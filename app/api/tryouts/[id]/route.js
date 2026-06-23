import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Tryout from "@/models/Tryout";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// GET /api/tryouts/[id] – Tryout-Detail (öffentlich).
async function handler(req, ctx) {
  const id = ctx?.params?.id;
  if (!id || !mongoose.isValidObjectId(id)) {
    return fail("Ungültige Tryout-ID", 400);
  }

  await connectDB();
  const t = await Tryout.findById(id).populate("teamId", "teamName slug logo region");
  if (!t) {
    return fail("Tryout nicht gefunden", 404);
  }

  return ok({
    tryout: {
      _id: t._id,
      team: t.teamId,
      date: t.date,
      location: t.location,
      positions: t.positions,
      description: t.description,
      status: t.status,
      applicantCount: t.applicants?.length || 0,
    },
  });
}

export const GET = withErrorHandling(handler);
