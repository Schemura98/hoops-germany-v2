import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { getTeamFromToken } from "@/lib/serverAuth";
import { extractHashtags, resolveMentions } from "@/lib/postParse";
import { notifyMentions } from "@/lib/notifyEngagement";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/posts/team-post – Beitrag im Namen des Vereins erstellen (Dual-Auth:
// nur Team-Admins, getTeamFromToken liefert das verwaltete Team). `authorTeam`
// steuert das Rendering; `teams` macht den Beitrag für die Feed-/Ranking-Logik
// dem Verein zuordenbar (erscheint bei dessen Followern + Mitgliedern).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamFromToken(token);
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  const content = body.content?.trim() || "";
  const image = body.image?.trim() || "";
  if (!content && !image) {
    return fail("Der Beitrag darf nicht leer sein", 400);
  }

  await connectDB();
  const hashtags = extractHashtags(content);
  const mentions = await resolveMentions(content);
  const post = await Post.create({
    player: null,
    authorTeam: team._id,
    teams: [team._id],
    kind: "user",
    content,
    image,
    hashtags,
    mentions,
    likes: [],
    comments: [],
  });
  await post.populate("authorTeam", "teamName slug logo");

  // Erwähnte Spieler benachrichtigen.
  await notifyMentions({
    recipientIds: mentions.map((m) => m.playerId),
    actorId: null,
    authorName: team.teamName,
    postId: post._id,
  });

  return ok({ post }, 201);
}

export const POST = withErrorHandling(handler);
