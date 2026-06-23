import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { signPlayerToken } from "@/lib/auth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// Referenz-Implementierung für das API-Pattern (Abschnitt 6 der Spezifikation).
// Alle weiteren Endpunkte folgen dieser Struktur:
//   connectDB() -> Eingaben prüfen -> Logik -> ok()/fail(), gewrappt in withErrorHandling.
async function handler(req) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return fail("E-Mail und Passwort sind erforderlich", 400);
  }

  await connectDB();

  const player = await Player.findOne({ email: email.toLowerCase().trim() });
  if (!player || !player.password) {
    return fail("Ungültige Anmeldedaten", 401);
  }

  const valid = await bcrypt.compare(password, player.password);
  if (!valid) {
    return fail("Ungültige Anmeldedaten", 401);
  }

  const token = signPlayerToken({ id: player._id.toString() });

  return ok({
    token,
    player: {
      id: player._id,
      firstName: player.firstName,
      lastName: player.lastName,
      email: player.email,
      isTeamAdmin: player.isTeamAdmin,
      isSuperAdmin: player.isSuperAdmin,
    },
  });
}

export const POST = withErrorHandling(handler);
