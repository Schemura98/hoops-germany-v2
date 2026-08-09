import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import { ok, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/fetchteams – alle Teams (für Auswahllisten & öffentliche Übersicht).
async function handler() {
  await connectDB();
  // Nur freigegebene Teams (Bestand ohne Feld = freigegeben; nur explizit false ausblenden).
  const teams = await Team.find({ approved: { $ne: false } })
    .select("teamName slug logo region bundesland isDemo")
    .sort({ teamName: 1 });

  return ok({ teams });
}

export const POST = withErrorHandling(handler);
