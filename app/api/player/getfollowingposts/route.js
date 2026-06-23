import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Player from "@/models/Player";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/player/getfollowingposts – Feed aus Beiträgen gefolgter Spieler,
// Mitglieder gefolgter Teams (+ eigene).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const me = await getPlayerFromToken(token);
  if (!me) {
    return fail("Bitte zuerst anmelden", 401);
  }

  await connectDB();

  // Mitglieder der Teams, denen ich folge → ihre Beiträge erscheinen im Feed
  let teamMemberIds = [];
  if ((me.followingTeams || []).length) {
    const members = await Player.find({ teamId: { $in: me.followingTeams } }).select("_id");
    teamMemberIds = members.map((m) => m._id);
  }

  // Eindeutige Autoren: gefolgte Spieler + Mitglieder gefolgter Teams + ich selbst
  const ids = [
    ...new Set(
      [...(me.following || []), ...teamMemberIds, me._id].map((id) => String(id))
    ),
  ];

  const posts = await Post.find({ player: { $in: ids } })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("player", "firstName lastName slug profileImage")
    .populate("comments.player", "firstName lastName slug profileImage");

  return ok({ posts });
}

export const POST = withErrorHandling(handler);
