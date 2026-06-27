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

  await connectDB();

  const pop = (q) =>
    q
      .populate("player", "firstName lastName slug profileImage")
      .populate("fromTeam", "teamName slug logo")
      .populate("toTeam", "teamName slug logo")
      .lean();

  // 1) Persönlich relevante Transfers (gefolgte Personen / eigenes & gefolgte Teams).
  const or = [];
  if (followingPlayers.length) or.push({ player: { $in: followingPlayers } });
  if (teamIds.length) {
    or.push({ toTeam: { $in: teamIds } });
    or.push({ fromTeam: { $in: teamIds } });
  }
  let transfers = or.length
    ? (await pop(TransferEvent.find({ $or: or }).sort({ createdAt: -1 }).limit(LIMIT))).filter((t) => t.player)
    : [];

  // 2) Mit aktuellen Community-Transfers auffüllen, damit das Widget nie leer ist.
  if (transfers.length < LIMIT) {
    const seen = new Set(transfers.map((t) => String(t._id)));
    const recent = await pop(
      TransferEvent.find({}).sort({ createdAt: -1 }).limit(LIMIT + 10)
    );
    for (const t of recent) {
      if (transfers.length >= LIMIT) break;
      if (t.player && !seen.has(String(t._id))) {
        transfers.push(t);
        seen.add(String(t._id));
      }
    }
  }

  return ok({ transfers });
}

export const POST = withErrorHandling(handler);
