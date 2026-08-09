import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { ok, withErrorHandling } from "@/lib/apiResponse";

// POST /api/player/transferlist – öffentliche Liste transferbereiter Spieler.
async function handler() {
  await connectDB();
  const players = await Player.find({ transferStatus: "verfuegbar" })
    .select(
      "firstName lastName slug position profileImage nationality preferredLeague transferNote teamId bundesland hometown isDemo"
    )
    .populate("teamId", "teamName slug")
    .sort({ lastName: 1, firstName: 1 });

  return ok({ players });
}

export const POST = withErrorHandling(handler);
