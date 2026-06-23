import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { saveImage } from "@/lib/uploadFile";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/upload/player-image – Profilbild hochladen (multipart, Spieler-Auth).
async function handler(req) {
  const formData = await req.formData();
  const token = formData.get("token");
  const file = formData.get("file");

  const decoded = verifyToken(token);
  const id = decoded?.id || decoded?.playerId;
  if (!id) {
    return fail("Nicht authentifiziert", 401);
  }

  const result = await saveImage(file, "players");
  if (!result.ok) {
    return fail(result.message, 400);
  }

  await connectDB();
  await Player.findByIdAndUpdate(id, { $set: { profileImage: result.url } });

  return ok({ url: result.url });
}

export const POST = withErrorHandling(handler);
