import { connectDB } from "@/lib/db";
import Tryout from "@/models/Tryout";
import { ok, withErrorHandling } from "@/lib/apiResponse";

// DB-Zugriff erst zur Laufzeit.
export const dynamic = "force-dynamic";

// GET /api/tryouts – aktive Tryouts (öffentlich).
async function handler() {
  await connectDB();
  const tryouts = await Tryout.find({ status: "active" })
    .select("teamId date location positions description applicants")
    .populate("teamId", "teamName slug logo")
    .sort({ date: 1 });

  return ok({
    // Verwaiste Tryouts (Team zwischenzeitlich gelöscht → teamId null) ausblenden.
    tryouts: tryouts
      .filter((t) => t.teamId)
      .map((t) => ({
      _id: t._id,
      team: t.teamId,
      date: t.date,
      location: t.location,
      positions: t.positions,
      description: t.description,
      applicantCount: t.applicants?.length || 0,
    })),
  });
}

export const GET = withErrorHandling(handler);
