import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Tryout from "@/models/Tryout";
import { getTeamFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// Gemeinsamer Auth-Schritt für alle Methoden.
async function resolveTeam(req, body) {
  const token = getTokenFromRequest(req, body.token);
  return getTeamFromToken(token);
}

// POST /api/tryouts/my-tryouts – Tryouts des eigenen Teams (mit Bewerbern).
async function list(req) {
  const body = await req.json().catch(() => ({}));
  const team = await resolveTeam(req, body);
  if (!team) return fail("Kein Team-Zugriff für diese Sitzung", 401);

  await connectDB();
  const tryouts = await Tryout.find({ teamId: team._id })
    .populate("applicants.playerId", "firstName lastName position profileImage")
    .sort({ createdAt: -1 });

  return ok({ tryouts });
}

// PATCH /api/tryouts/my-tryouts – Status umschalten (active/closed).
async function patch(req) {
  const body = await req.json().catch(() => ({}));
  const team = await resolveTeam(req, body);
  if (!team) return fail("Kein Team-Zugriff für diese Sitzung", 401);

  const { tryoutId, status } = body;
  if (!["active", "closed"].includes(status)) {
    return fail("Ungültiger Status", 400);
  }

  await connectDB();
  const tryout = await Tryout.findOneAndUpdate(
    { _id: tryoutId, teamId: team._id },
    { $set: { status } },
    { new: true }
  );
  if (!tryout) return fail("Tryout nicht gefunden", 404);

  return ok({ tryout });
}

// DELETE /api/tryouts/my-tryouts – Tryout entfernen.
async function remove(req) {
  const body = await req.json().catch(() => ({}));
  const team = await resolveTeam(req, body);
  if (!team) return fail("Kein Team-Zugriff für diese Sitzung", 401);

  if (!body.tryoutId) return fail("Tryout-ID fehlt", 400);

  await connectDB();
  const res = await Tryout.deleteOne({ _id: body.tryoutId, teamId: team._id });
  if (res.deletedCount === 0) return fail("Tryout nicht gefunden", 404);

  return ok({ message: "Tryout entfernt" });
}

export const POST = withErrorHandling(list);
export const PATCH = withErrorHandling(patch);
export const DELETE = withErrorHandling(remove);
