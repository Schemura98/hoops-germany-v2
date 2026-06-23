import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/player/fetchposts – Beiträge eines Spielers (öffentlich, per playerId).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const playerId = body.playerId;
  if (!playerId || !mongoose.isValidObjectId(playerId)) {
    return fail("Ungültige Spieler-ID", 400);
  }

  await connectDB();
  const posts = await Post.find({ player: playerId })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("player", "firstName lastName slug profileImage")
    .populate("comments.player", "firstName lastName slug profileImage");

  return ok({ posts });
}

export const POST = withErrorHandling(handler);
