import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Player from "@/models/Player";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { recordTransfer } from "@/lib/recordTransfer";
import { slotsFreigeben } from "@/lib/rosterSlots";
import { followOwnTeam } from "@/lib/teamFollow";
import { getTeamAdminRecipients } from "@/lib/teamAdmins";
import { sendMail } from "@/lib/mailer";
import { memberJoinedEmail } from "@/lib/emailTemplates";
import { getBaseUrl } from "@/lib/baseUrl";
import { positionLabel } from "@/lib/constants";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/join-via-link – allgemeiner Team-Einladungslink: der (gerade
// registrierte oder eingeloggte) Spieler tritt dem Team DIREKT bei. Body: { token, inviteToken }
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const player = await getPlayerFromToken(token);
  if (!player) {
    return fail("Bitte zuerst anmelden", 401);
  }

  const inviteToken = body.inviteToken;
  if (!inviteToken) {
    return fail("Ungültiger Einladungslink", 400);
  }

  await connectDB();
  const team = await Team.findOne({ inviteToken }).select(
    "teamName slug adminPlayerId notifyAllAdmins"
  );
  if (!team) {
    return fail("Dieser Einladungslink ist ungültig oder abgelaufen", 404);
  }

  if (String(player.teamId || "") === String(team._id)) {
    return ok({ message: `Du bist bereits im Kader von ${team.teamName}.`, alreadyMember: true });
  }

  // Direkt beitreten (Einladungslink = Beitritt durch den Link)
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
    // Kaderplatz beim ALTEN Verein freigeben (13.08.2026, Befund von Kai).
    // Bewusst nur der alte: Ein Platz beim neuen Verein, den derselbe Spieler
    // gerade beansprucht hat, soll bestehen bleiben. Ohne das behielte der
    // Ex-Verein den Platz dauerhaft als belegt — und die Kaderprüfung beim
    // Statistik-Speichern würde den Gewechselten weiter als zugehörig werten.
    if (prevTeam) await slotsFreigeben(player._id, prevTeam);
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
            message: `${playerName} ist über den Einladungslink deinem Kader beigetreten.`,
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
          (err) => console.error("[JOIN VIA LINK MAIL ERROR]", err?.message || err)
        );
      }
    }
  }

  return ok({ message: `Willkommen im Kader von ${team.teamName}!`, teamSlug: team.slug });
}

export const POST = withErrorHandling(handler);
