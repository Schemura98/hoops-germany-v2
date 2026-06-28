import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Player from "@/models/Player";
import { getTeamForCapability } from "@/lib/serverAuth";
import { sendMail } from "@/lib/mailer";
import { teamInvitePlayerEmail } from "@/lib/emailTemplates";
import { getBaseUrl } from "@/lib/baseUrl";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/invite-player – Team-Admin lädt einen BESTEHENDEN Account in den
// Kader ein (Capability "kader"). Der Spieler wird per Glocke + Mail gefragt, ob er
// annimmt; erst bei Annahme landet er im Kader. Body: { token, playerId }
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamForCapability(token, "kader");
  if (!team) {
    return fail("Keine Berechtigung für diese Aktion", 403);
  }

  const { playerId } = body;
  if (!playerId) {
    return fail("Kein Spieler angegeben", 400);
  }

  await connectDB();
  const player = await Player.findById(playerId).select("firstName lastName email teamId");
  if (!player) {
    return fail("Spieler nicht gefunden", 404);
  }
  if (String(player.teamId || "") === String(team._id)) {
    return fail("Dieser Spieler ist bereits in deinem Kader", 400);
  }
  if ((team.invitedPlayers || []).some((id) => String(id) === String(player._id))) {
    return fail("Dieser Spieler wurde bereits eingeladen", 400);
  }

  // Einladung vormerken
  await Team.updateOne({ _id: team._id }, { $addToSet: { invitedPlayers: player._id } });

  // Glocken-Benachrichtigung mit Annehmen/Ablehnen (im NotificationBell inline)
  await Player.updateOne(
    { _id: player._id },
    {
      $push: {
        notifications: {
          type: "team_invite",
          teamId: team._id,
          teamName: team.teamName,
          teamSlug: team.slug,
          message: `${team.teamName} möchte dich in den Kader aufnehmen.`,
          read: false,
          createdAt: new Date(),
        },
      },
    }
  );

  // Optimierte Einladungs-Mail
  if (player.email) {
    const mail = teamInvitePlayerEmail({
      teamName: team.teamName,
      playerName: `${player.firstName || ""} ${player.lastName || ""}`.trim(),
      baseUrl: getBaseUrl(req),
    });
    sendMail({ to: player.email, subject: mail.subject, html: mail.html, text: mail.text }).catch(
      (err) => console.error("[TEAM INVITE MAIL ERROR]", err?.message || err)
    );
  }

  return ok({ message: `Einladung an ${player.firstName} gesendet.` });
}

export const POST = withErrorHandling(handler);
