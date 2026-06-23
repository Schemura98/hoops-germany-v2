import { getTokenFromRequest } from "@/lib/auth";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { connectDB } from "@/lib/db";
import TransferEvent from "@/models/TransferEvent";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

const LIMIT = 15;

// POST /api/player/transfer-feed – Transfers von gefolgten Spielern sowie von
// Spielern, die das eigene Team oder ein gefolgtes Team betreffen.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const me = await getPlayerFromToken(token);
  if (!me) {
    return fail("Bitte zuerst anmelden", 401);
  }

  const followingPlayers = (me.following || []).map(String);
  const teamIds = [
    ...new Set(
      [me.teamId, ...(me.followingTeams || [])].filter(Boolean).map(String)
    ),
  ];

  // Ohne gefolgte Personen/Teams gibt es nichts anzuzeigen.
  if (!followingPlayers.length && !teamIds.length) {
    return ok({ transfers: [] });
  }

  const or = [];
  if (followingPlayers.length) or.push({ player: { $in: followingPlayers } });
  if (teamIds.length) {
    or.push({ toTeam: { $in: teamIds } });
    or.push({ fromTeam: { $in: teamIds } });
  }

  await connectDB();
  const transfers = await TransferEvent.find({ $or: or })
    .sort({ createdAt: -1 })
    .limit(LIMIT)
    .populate("player", "firstName lastName slug profileImage")
    .populate("fromTeam", "teamName slug logo")
    .populate("toTeam", "teamName slug logo")
    .lean();

  // Verwaiste Einträge (gelöschter Spieler) herausfiltern.
  return ok({ transfers: transfers.filter((t) => t.player) });
}

export const POST = withErrorHandling(handler);
