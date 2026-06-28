import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import Team from "@/models/Team";
import { positionLabel } from "@/lib/constants";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/player/search – leichte Namens-Suche für Auswahl-Felder (z.B. Kader-Einladung).
// Body: { q } – liefert bis zu 10 Treffer mit Name/Position/aktuellem Team.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const q = String(body.q || "").trim();
  if (q.length < 2) {
    return ok({ players: [] });
  }

  await connectDB();
  // Tokens (Vor-/Nachname) – jeder muss in firstName oder lastName vorkommen.
  const tokens = q.split(/\s+/).slice(0, 3).map((t) => t.replace(/[^\p{L}\d-]/gu, ""));
  const and = tokens
    .filter(Boolean)
    .map((t) => {
      const rx = new RegExp(t, "i");
      return { $or: [{ firstName: rx }, { lastName: rx }] };
    });

  const players = await Player.find(and.length ? { $and: and } : {})
    .select("firstName lastName slug position number profileImage teamId")
    .limit(10)
    .lean();

  const teamIds = [...new Set(players.map((p) => p.teamId).filter(Boolean).map(String))];
  const teams = teamIds.length
    ? await Team.find({ _id: { $in: teamIds } }).select("teamName").lean()
    : [];
  const teamName = new Map(teams.map((t) => [String(t._id), t.teamName]));

  return ok({
    players: players.map((p) => ({
      playerId: String(p._id),
      name: `${p.firstName || ""} ${p.lastName || ""}`.trim(),
      slug: p.slug || null,
      position: positionLabel(p.position) || "",
      profileImage: p.profileImage || null,
      teamId: p.teamId ? String(p.teamId) : null,
      teamName: p.teamId ? teamName.get(String(p.teamId)) || "" : "",
    })),
  });
}

export const POST = withErrorHandling(handler);
