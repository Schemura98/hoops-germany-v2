import bcrypt from "bcryptjs";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/player/update-password – Passwort im eingeloggten Zustand ändern.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const decoded = verifyToken(token);
  const id = decoded?.id || decoded?.playerId;
  if (!id) {
    return fail("Nicht authentifiziert", 401);
  }

  const { currentPassword, newPassword } = body;
  if (!newPassword || newPassword.length < 6) {
    return fail("Das neue Passwort muss mindestens 6 Zeichen lang sein", 400);
  }

  await connectDB();
  // Passwort muss hier mitgeladen werden (im Gegensatz zu serverAuth).
  const player = await Player.findById(id);
  if (!player) {
    return fail("Spieler nicht gefunden", 404);
  }

  // Google-only-Account ohne Passwort: über "Passwort vergessen" initial setzen.
  if (!player.password) {
    return fail(
      "Dein Konto nutzt Google-Login. Setze ein Passwort über „Passwort vergessen“.",
      400
    );
  }

  if (!currentPassword) {
    return fail("Bitte das aktuelle Passwort eingeben", 400);
  }

  const valid = await bcrypt.compare(currentPassword, player.password);
  if (!valid) {
    return fail("Das aktuelle Passwort ist falsch", 401);
  }

  if (await bcrypt.compare(newPassword, player.password)) {
    return fail("Das neue Passwort darf nicht dem alten entsprechen", 400);
  }

  player.password = await bcrypt.hash(newPassword, 10);
  await player.save();

  return ok({ message: "Passwort erfolgreich geändert" });
}

export const POST = withErrorHandling(handler);
