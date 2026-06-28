import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { getTeamFromToken } from "@/lib/serverAuth";
import { coAdminPerms } from "@/lib/teamPermissions";
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
    "firstName lastName position number isTeamAdmin teamAdminOf"
  );
  const founderId = team.adminPlayerId ? String(team.adminPlayerId) : null;
  const players = members.map((m) => {
    const isFounder = founderId === String(m._id);
    const isAdmin = !!(m.isTeamAdmin && String(m.teamAdminOf || "") === String(team._id));
    return {
      playerId: String(m._id),
      name: `${m.firstName} ${m.lastName}`.trim(),
      position: m.position || "",
      number: m.number || "",
      isAdmin,
      isFounder,
      // Teilrechte (nur für Co-Admins relevant; Haupt-Admin hat immer alle).
      perms: isAdmin && !isFounder ? coAdminPerms(team, m._id) : null,
    };
  });

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
