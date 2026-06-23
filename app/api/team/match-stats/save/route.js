import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
import { getTeamFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

function toCount(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// POST /api/team/match-stats/save – Spieler-Statistiken des eigenen Teams setzen.
// Ersetzt die bestehenden playerStats-Einträge DIESES Teams (Score bleibt unberührt).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamFromToken(token);
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  await connectDB();
  const match = await Match.findById(body.matchId);
  if (!match) {
    return fail("Spiel nicht gefunden", 404);
  }

  const involved =
    String(match.teamA) === String(team._id) ||
    String(match.teamB) === String(team._id);
  if (!involved) {
    return fail("Keine Berechtigung für dieses Spiel", 403);
  }

  const incoming = Array.isArray(body.stats) ? body.stats : [];
  const entries = incoming
    .filter((s) => s.playerId || s.rosterSlotId || s.playerName)
    .map((s) => ({
      player: s.playerId || null,
      playerName: s.playerName || undefined,
      rosterSlotId: s.rosterSlotId || undefined,
      team: team._id,
      points: toCount(s.points),
      assists: toCount(s.assists),
      rebounds: toCount(s.rebounds),
      didNotPlay: !!s.didNotPlay,
    }));

  // Bestehende Einträge dieses Teams entfernen, neue setzen
  match.playerStats = (match.playerStats || []).filter(
    (s) => String(s.team) !== String(team._id)
  );
  match.playerStats.push(...entries);
  await match.save();

  return ok({ message: "Statistiken gespeichert." });
}

export const POST = withErrorHandling(handler);
