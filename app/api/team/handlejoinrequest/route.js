import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { getTeamForCapability } from "@/lib/serverAuth";
import { recordTransfer } from "@/lib/recordTransfer";
import { followOwnTeam } from "@/lib/teamFollow";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/handlejoinrequest – Beitrittsanfrage genehmigen/ablehnen (Dual-Auth).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamForCapability(token, "kader");
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  const { playerId, action } = body;
  if (!["approve", "reject"].includes(action)) {
    return fail("Ungültige Aktion", 400);
  }

  await connectDB();
  // Nur Spieler bearbeiten, die tatsächlich bei DIESEM Team angefragt haben.
  const player = await Player.findOne({
    _id: playerId,
    teamJoinRequest: team._id,
  });
  if (!player) {
    return fail("Anfrage nicht gefunden", 404);
  }

  player.teamJoinRequest = undefined;
  const prevTeam = player.teamId || null;

  if (action === "approve") {
    player.teamId = team._id;
    player.notifications.push({
      type: "join_approved",
      teamId: team._id,
      teamName: team.teamName,
      teamSlug: team.slug,
      message: `Deine Beitrittsanfrage bei ${team.teamName} wurde angenommen.`,
      read: false,
      createdAt: new Date(),
    });
  }

  await player.save();

  if (action === "approve") {
    await recordTransfer({
      player: player._id,
      fromTeam: prevTeam,
      toTeam: team._id,
    });
    await followOwnTeam(player._id, team._id);
  }

  return ok({
    message:
      action === "approve" ? "Anfrage angenommen." : "Anfrage abgelehnt.",
  });
}

export const POST = withErrorHandling(handler);
