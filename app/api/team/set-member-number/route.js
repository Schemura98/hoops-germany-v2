import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { getTeamForCapability } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/set-member-number – Team-Admin vergibt/ändert die Rückennummer
// eines Mitglieds (Dual-Auth; jeder Team-Admin darf das). Body: { token, playerId, number }
// Leerer String entfernt die Nummer. Die Nummer ist optional und rein informativ.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamForCapability(token, "kader");
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  const { playerId } = body;
  if (!playerId) {
    return fail("Kein Spieler angegeben", 400);
  }

  // Auf 3 Zeichen begrenzen (z.B. "00", "23"); leer = entfernen.
  const number = String(body.number ?? "").trim().slice(0, 3);

  await connectDB();
  const player = await Player.findById(playerId).select("teamId");
  if (!player || String(player.teamId) !== String(team._id)) {
    return fail("Spieler gehört nicht zu diesem Team", 400);
  }

  await Player.updateOne({ _id: player._id }, { $set: { number } });

  return ok({ playerId: String(player._id), number });
}

export const POST = withErrorHandling(handler);
