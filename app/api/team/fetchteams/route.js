import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import { ok, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/fetchteams – alle Teams (für Auswahllisten & öffentliche Übersicht).
async function handler() {
  await connectDB();
  const teams = await Team.find({})
    .select("teamName slug logo region bundesland")
    .sort({ teamName: 1 });

  return ok({ teams });
}

export const POST = withErrorHandling(handler);
