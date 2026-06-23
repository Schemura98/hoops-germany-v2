import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

const SELECT = "firstName lastName slug profileImage position";

// POST /api/player/getfollowlist – Follower- und Following-Liste eines Spielers.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const playerId = body.playerId;
  if (!playerId || !mongoose.isValidObjectId(playerId)) {
    return fail("Ungültige Spieler-ID", 400);
  }

  await connectDB();
  const player = await Player.findById(playerId)
    .select("followers following")
    .populate("followers", SELECT)
    .populate("following", SELECT);

  if (!player) {
    return fail("Spieler nicht gefunden", 404);
  }

  return ok({
    followers: player.followers,
    following: player.following,
    followersCount: player.followers.length,
    followingCount: player.following.length,
  });
}

export const POST = withErrorHandling(handler);
