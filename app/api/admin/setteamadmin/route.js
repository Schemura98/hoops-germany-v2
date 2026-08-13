import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import Team from "@/models/Team";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";
import { slotsFreigeben } from "@/lib/rosterSlots";

// POST /api/admin/setteamadmin – Spieler als Team-Admin setzen/entfernen (Admin).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  const { playerId, teamId, remove } = body;
  if (!playerId) return fail("Spieler-ID fehlt", 400);

  await connectDB();
  const player = await Player.findById(playerId);
  if (!player) return fail("Spieler nicht gefunden", 404);

  // Entfernen
  if (remove) {
    if (player.teamAdminOf) {
      await Team.updateOne(
        { _id: player.teamAdminOf, adminPlayerId: player._id },
        { $unset: { adminPlayerId: "" } }
      );
    }
    player.isTeamAdmin = false;
    player.teamAdminOf = undefined;
    await player.save();
    return ok({ message: "Team-Admin-Rechte entfernt" });
  }

  // Setzen
  if (!teamId) return fail("Team-ID fehlt", 400);
  const team = await Team.findById(teamId);
  if (!team) return fail("Team nicht gefunden", 404);

  // Vorheriges Team des Spielers ggf. lösen
  if (player.teamAdminOf && String(player.teamAdminOf) !== String(teamId)) {
    await Team.updateOne(
      { _id: player.teamAdminOf, adminPlayerId: player._id },
      { $unset: { adminPlayerId: "" } }
    );
  }

  const vorherigesTeam = player.teamId || null;
  player.isTeamAdmin = true;
  player.teamAdminOf = team._id;
  player.teamId = team._id; // Team-Admin ist auch Mitglied (sonst fehlen Kader/Spiele/Ergebnisse)
  await player.save();

  // Kaderplatz beim alten Verein freigeben (Liste aller Wechselwege in
  // lib/rosterSlots.js). ⚠️ Dieser Pfad protokolliert weiterhin KEINEN
  // Transfer – vorbestehend, hier bewusst nicht mitgeändert.
  if (vorherigesTeam && String(vorherigesTeam) !== String(team._id)) {
    await slotsFreigeben(player._id, vorherigesTeam);
  }
  await Team.findByIdAndUpdate(team._id, { adminPlayerId: player._id });

  return ok({ message: `${player.firstName} ist jetzt Admin von ${team.teamName}` });
}

export const POST = withErrorHandling(handler);
