import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Player from "@/models/Player";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { recordTransfer } from "@/lib/recordTransfer";
import { followOwnTeam } from "@/lib/teamFollow";
import { getTeamAdminRecipients } from "@/lib/teamAdmins";
import { sendMail } from "@/lib/mailer";
import { memberJoinedEmail } from "@/lib/emailTemplates";
import { getBaseUrl } from "@/lib/baseUrl";
import { positionLabel } from "@/lib/constants";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/respond-invite – eingeladener Spieler nimmt eine Kader-Einladung
// an oder lehnt sie ab. Body: { token, teamId, accept: boolean }
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const player = await getPlayerFromToken(token);
  if (!player) {
    return fail("Bitte zuerst anmelden", 401);
  }
  if (!body.teamId) {
    return fail("Kein Team angegeben", 400);
  }

  await connectDB();
  const team = await Team.findById(body.teamId).select(
    "teamName slug adminPlayerId notifyAllAdmins invitedPlayers"
  );
  if (!team) {
    return fail("Team nicht gefunden", 404);
  }

  const wasInvited = (team.invitedPlayers || []).some(
    (id) => String(id) === String(player._id)
  );
  if (!wasInvited) {
    return fail("Diese Einladung ist nicht mehr gültig", 400);
  }

  // Einladung in jedem Fall entfernen
  await Team.updateOne({ _id: team._id }, { $pull: { invitedPlayers: player._id } });
  // Die Einladungs-Benachrichtigung als gelesen markieren (aufräumen).
  await Player.updateOne(
    { _id: player._id, "notifications.type": "team_invite", "notifications.teamId": team._id },
    { $set: { "notifications.$[el].read": true } },
    { arrayFilters: [{ "el.type": "team_invite", "el.teamId": team._id }] }
  );

  if (!body.accept) {
    return ok({ accepted: false, message: "Einladung abgelehnt." });
  }

  // ---- Annehmen: in den Kader aufnehmen ----
  const prevTeam = player.teamId || null;
  await Player.updateOne(
    { _id: player._id },
    {
      $set: { teamId: team._id },
      $push: {
        notifications: {
          type: "join_approved",
          teamId: team._id,
          teamName: team.teamName,
          teamSlug: team.slug,
          message: `Du bist jetzt im Kader von ${team.teamName}.`,
          read: false,
          createdAt: new Date(),
        },
      },
    }
  );

  if (String(prevTeam || "") !== String(team._id)) {
    await recordTransfer({ player: player._id, fromTeam: prevTeam, toTeam: team._id });
  }
  await followOwnTeam(player._id, team._id);

  // Team-Admins über den Beitritt informieren (In-App + Mail), je Einstellung.
  const playerName = `${player.firstName} ${player.lastName}`.trim();
  const admins = await getTeamAdminRecipients(team);
  if (admins.length) {
    await Player.updateMany(
      { _id: { $in: admins.map((a) => a._id) } },
      {
        $push: {
          notifications: {
            type: "member_joined",
            fromPlayerId: player._id,
            teamId: team._id,
            teamName: team.teamName,
            teamSlug: team.slug,
            message: `${playerName} hat deine Einladung angenommen und ist jetzt im Kader.`,
            read: false,
            createdAt: new Date(),
          },
        },
      }
    );
    const mail = memberJoinedEmail({
      teamName: team.teamName,
      playerName,
      position: positionLabel(player.position),
      baseUrl: getBaseUrl(req),
    });
    for (const a of admins) {
      if (a.email) {
        sendMail({ to: a.email, subject: mail.subject, html: mail.html, text: mail.text }).catch(
          (err) => console.error("[INVITE ACCEPT MAIL ERROR]", err?.message || err)
        );
      }
    }
  }

  return ok({ accepted: true, message: `Willkommen im Kader von ${team.teamName}!` });
}

export const POST = withErrorHandling(handler);
