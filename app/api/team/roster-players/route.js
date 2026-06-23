import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { getTeamFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/roster-players – Kader für die Statistik-Erfassung (Dual-Auth).
// Liefert Account-Spieler (teamId) + Slot-Platzhalter ohne Account – dedupliziert.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamFromToken(token);
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  await connectDB();

  // Account-Spieler des Teams
  const members = await Player.find({ teamId: team._id }).select(
    "firstName lastName position"
  );
  const players = members.map((m) => ({
    playerId: String(m._id),
    name: `${m.firstName} ${m.lastName}`.trim(),
    position: m.position || "",
  }));

  // Slots ohne Account-Anspruch (echte Platzhalter), um Doppelungen zu vermeiden
  const slots = (team.rosterSlots || [])
    .filter((s) => s.status !== "empty" && !s.claimedBy)
    .map((s) => ({
      rosterSlotId: String(s._id),
      name: s.name || "Unbenannt",
      position: s.position || "",
    }));

  return ok({ players, slots });
}

export const POST = withErrorHandling(handler);
