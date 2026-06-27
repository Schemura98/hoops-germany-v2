import { verifyToken } from "@/lib/auth";
import { saveImage } from "@/lib/uploadFile";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/posts/upload-image – Beitragsbild hochladen (multipart, Spieler-Auth).
// Speichert unter public/posts/ und liefert die URL zurück; angehängt wird das
// Bild erst beim Erstellen des Beitrags (uploadpost).
async function handler(req) {
  const formData = await req.formData();
  const token = formData.get("token");
  const file = formData.get("file");

  const decoded = verifyToken(token);
  const id = decoded?.id || decoded?.playerId;
  if (!id) {
    return fail("Nicht authentifiziert", 401);
  }

  const result = await saveImage(file, "posts");
  if (!result.ok) {
    return fail(result.message, 400);
  }

  return ok({ url: result.url });
}

export const POST = withErrorHandling(handler);
