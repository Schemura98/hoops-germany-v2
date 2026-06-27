import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Player from "@/models/Player";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

// POST /api/player/getfollowingposts – Feed aus Beiträgen gefolgter Spieler,
// Mitglieder gefolgter Teams (+ eigene). Paginiert über `before` (createdAt).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);
  const limit = Math.min(Number(body.limit) || DEFAULT_LIMIT, MAX_LIMIT);

  const me = await getPlayerFromToken(token);
  if (!me) {
    return fail("Bitte zuerst anmelden", 401);
  }

  await connectDB();

  // Mitglieder gefolgter Teams UND des eigenen Teams → ihre Beiträge erscheinen
  // im Feed (eigene Mannschaft ist immer dabei, auch ohne sie explizit zu folgen).
  let teamMemberIds = [];
  const feedTeamIds = [
    ...new Set(
      [...(me.followingTeams || []), me.teamId].filter(Boolean).map(String)
    ),
  ];
  if (feedTeamIds.length) {
    const members = await Player.find({ teamId: { $in: feedTeamIds } }).select("_id");
    teamMemberIds = members.map((m) => m._id);
  }

  // Eindeutige Autoren: gefolgte Spieler + Mitglieder gefolgter Teams + ich selbst
  const ids = [
    ...new Set(
      [...(me.following || []), ...teamMemberIds, me._id].map((id) => String(id))
    ),
  ];

  const query = { player: { $in: ids } };
  if (body.before) {
    const d = new Date(body.before);
    if (!Number.isNaN(d.getTime())) query.createdAt = { $lt: d };
  }

  const fetched = await Post.find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .populate("player", "firstName lastName slug profileImage")
    .populate("comments.player", "firstName lastName slug profileImage")
    .populate("comments.replies.player", "firstName lastName slug profileImage");

  const hasMore = fetched.length > limit;
  const posts = hasMore ? fetched.slice(0, limit) : fetched;

  return ok({ posts, hasMore });
}

export const POST = withErrorHandling(handler);
