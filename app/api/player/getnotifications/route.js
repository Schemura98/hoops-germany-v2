import { getTokenFromRequest } from "@/lib/auth";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/player/getnotifications – Benachrichtigungen des eingeloggten Spielers.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const player = await getPlayerFromToken(token);
  if (!player) {
    return fail("Nicht authentifiziert", 401);
  }

  const notifications = (player.notifications || [])
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((n) => ({
      _id: n._id,
      type: n.type,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt,
      teamId: n.teamId,
      teamSlug: n.teamSlug,
      teamName: n.teamName,
      fromPlayerId: n.fromPlayerId,
      matchId: n.matchId,
      postId: n.postId,
      count: n.count,
    }));

  const unreadCount = notifications.filter((n) => !n.read).length;

  return ok({ notifications, unreadCount });
}

export const POST = withErrorHandling(handler);
