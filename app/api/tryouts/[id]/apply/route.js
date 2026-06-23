import mongoose from "mongoose";
import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Tryout from "@/models/Tryout";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/tryouts/[id]/apply – Bewerbung auf ein Tryout (Spieler-Auth).
async function handler(req, ctx) {
  const id = ctx?.params?.id;
  if (!id || !mongoose.isValidObjectId(id)) {
    return fail("Ungültige Tryout-ID", 400);
  }

  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const player = await getPlayerFromToken(token);
  if (!player) {
    return fail("Bitte zuerst als Spieler anmelden", 401);
  }

  await connectDB();
  const tryout = await Tryout.findById(id);
  if (!tryout) {
    return fail("Tryout nicht gefunden", 404);
  }
  if (tryout.status !== "active") {
    return fail("Dieses Tryout ist geschlossen", 400);
  }

  const already = tryout.applicants.some(
    (a) => String(a.playerId) === String(player._id)
  );
  if (already) {
    return fail("Du hast dich bereits beworben", 409);
  }

  tryout.applicants.push({ playerId: player._id, appliedAt: new Date() });
  await tryout.save();

  return ok({ message: "Bewerbung gesendet!" });
}

export const POST = withErrorHandling(handler);
