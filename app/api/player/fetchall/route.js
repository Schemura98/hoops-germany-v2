import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { ok, withErrorHandling } from "@/lib/apiResponse";

// POST /api/player/fetchall – öffentliche Spielerliste.
async function handler() {
  await connectDB();
  const players = await Player.find({})
    .select("firstName lastName slug position profileImage nationality teamId")
    .populate("teamId", "teamName slug logo")
    .sort({ lastName: 1, firstName: 1 });

  return ok({ players });
}

export const POST = withErrorHandling(handler);
