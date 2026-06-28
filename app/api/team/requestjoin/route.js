import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Player from "@/models/Player";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { sendMail } from "@/lib/mailer";
import { joinRequestEmail } from "@/lib/emailTemplates";
import { getBaseUrl } from "@/lib/baseUrl";
import { positionLabel } from "@/lib/constants";
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

  // Team-Admin benachrichtigen (spielergeführtes Team): In-App + Mail
  if (team.adminPlayerId) {
    const admin = await Player.findByIdAndUpdate(
      team.adminPlayerId,
      {
        $push: {
          notifications: {
            type: "join_request",
            fromPlayerId: player._id,
            teamId: team._id,
            teamName: team.teamName,
            teamSlug: team.slug,
            message: `${player.firstName} ${player.lastName} möchte deinem Team beitreten.`,
            read: false,
            createdAt: new Date(),
          },
        },
      },
      { new: true, projection: "email" }
    );
    if (admin?.email) {
      const mail = joinRequestEmail({
        teamName: team.teamName,
        playerName: `${player.firstName} ${player.lastName}`.trim(),
        position: positionLabel(player.position),
        kind: "join",
        baseUrl: getBaseUrl(req),
      });
      sendMail({ to: admin.email, subject: mail.subject, html: mail.html, text: mail.text }).catch(
        (err) => console.error("[JOIN REQUEST MAIL ERROR]", err?.message || err)
      );
    }
  }

  return ok({ message: "Beitrittsanfrage gesendet." });
}

export const POST = withErrorHandling(handler);
