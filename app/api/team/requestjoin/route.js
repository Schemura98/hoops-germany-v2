import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Player from "@/models/Player";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { sendMail } from "@/lib/mailer";
import { joinRequestEmail } from "@/lib/emailTemplates";
import { getBaseUrl } from "@/lib/baseUrl";
import { positionLabel } from "@/lib/constants";
import { getTeamAdminRecipients } from "@/lib/teamAdmins";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/requestjoin – Spieler stellt Beitrittsanfrage an ein Team.
// Akzeptiert teamId oder teamSlug.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const player = await getPlayerFromToken(token);
  if (!player) {
    return fail("Bitte zuerst als Spieler anmelden", 401);
  }

  await connectDB();
  const team = body.teamId
    ? await Team.findById(body.teamId)
    : body.teamSlug
    ? await Team.findOne({ slug: body.teamSlug })
    : null;

  if (!team) {
    return fail("Team nicht gefunden", 404);
  }

  if (String(player.teamId) === String(team._id)) {
    return fail("Du bist bereits in diesem Team", 400);
  }
  if (String(player.teamJoinRequest) === String(team._id)) {
    return ok({ message: "Anfrage bereits gesendet." });
  }

  player.teamJoinRequest = team._id;
  await player.save();

  // Team-Admin(s) benachrichtigen (spielergeführtes Team): In-App + Mail.
  // Empfänger je nach Team-Einstellung (nur Haupt-Admin oder alle Admins).
  const playerName = `${player.firstName} ${player.lastName}`.trim();
  const admins = await getTeamAdminRecipients(team);
  if (admins.length) {
    await Player.updateMany(
      { _id: { $in: admins.map((a) => a._id) } },
      {
        $push: {
          notifications: {
            type: "join_request",
            fromPlayerId: player._id,
            teamId: team._id,
            teamName: team.teamName,
            teamSlug: team.slug,
            message: `${playerName} möchte deinem Team beitreten.`,
            read: false,
            createdAt: new Date(),
          },
        },
      }
    );
    const mail = joinRequestEmail({
      teamName: team.teamName,
      playerName,
      position: positionLabel(player.position),
      kind: "join",
      baseUrl: getBaseUrl(req),
    });
    for (const a of admins) {
      if (a.email) {
        sendMail({ to: a.email, subject: mail.subject, html: mail.html, text: mail.text }).catch(
          (err) => console.error("[JOIN REQUEST MAIL ERROR]", err?.message || err)
        );
      }
    }
  }

  return ok({ message: "Beitrittsanfrage gesendet." });
}

export const POST = withErrorHandling(handler);
