import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Team from "@/models/Team";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { rankPosts } from "@/lib/feedRanking";
import { ok, withErrorHandling } from "@/lib/apiResponse";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
// Kandidatenfenster: die N neuesten Beiträge werden gerankt (für eine Amateur-
// Community mehr als ausreichend; ältere Beiträge erscheinen nicht im „Für dich").
const CANDIDATE_CAP = 500;

// POST /api/posts/feed – personalisierter „Für dich"-Feed (Hot-Score + Boosts).
// Body: { token?, offset?, limit? }. Offset-Paginierung (Ranking ist nicht chronologisch).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const limit = Math.min(Number(body.limit) || DEFAULT_LIMIT, MAX_LIMIT);
  const offset = Math.max(0, Number(body.offset) || 0);

  await connectDB();

  // Optionaler Login-Kontext für die Personalisierung (Feed funktioniert auch ausgeloggt).
  let me = null;
  try {
    const token = getTokenFromRequest(req, body.token);
    if (token) me = await getPlayerFromToken(token);
  } catch {
    me = null;
  }

  // Kandidatenfenster: neueste Beiträge laden + Engagement/Autor-Kontext populaten.
  const candidates = await Post.find({})
    .sort({ createdAt: -1 })
    .limit(CANDIDATE_CAP)
    .populate("player", "firstName lastName slug profileImage teamId bundesland")
    .populate("comments.player", "firstName lastName slug profileImage")
    .populate("comments.replies.player", "firstName lastName slug profileImage");

  // Liga/Bundesland aller beteiligten Teams (Autor-Team + Auto-Post-Teams) einmalig laden.
  const teamIds = new Set();
  for (const p of candidates) {
    if (p.player?.teamId) teamIds.add(String(p.player.teamId));
    (p.teams || []).forEach((t) => teamIds.add(String(t)));
  }
  if (me?.teamId) teamIds.add(String(me.teamId));

  const teamMeta = new Map();
  if (teamIds.size) {
    const teams = await Team.find({ _id: { $in: [...teamIds] } }).select("leagueId bundesland");
    for (const t of teams) {
      teamMeta.set(String(t._id), { leagueId: t.leagueId, bundesland: t.bundesland });
    }
  }

  const ctx = {
    now: Date.now(),
    followingSet: new Set((me?.following || []).map(String)),
    teamId: me?.teamId || null,
    followingTeamsSet: new Set((me?.followingTeams || []).map(String)),
    bundesland: me?.bundesland || null,
    leagueId: me?.teamId ? teamMeta.get(String(me.teamId))?.leagueId || null : null,
    teamMeta,
  };

  const ranked = rankPosts(candidates, ctx);
  const posts = ranked.slice(offset, offset + limit);
  const hasMore = offset + limit < ranked.length;

  return ok({ posts, hasMore });
}

export const POST = withErrorHandling(handler);
