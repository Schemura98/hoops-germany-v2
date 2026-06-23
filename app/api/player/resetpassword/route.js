import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/player/resetpassword – neues Passwort per Token setzen.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const { token, newPassword } = body;

  if (!token) {
    return fail("Ungültiger oder fehlender Link", 400);
  }
  if (!newPassword || newPassword.length < 6) {
    return fail("Das neue Passwort muss mindestens 6 Zeichen lang sein", 400);
  }

  await connectDB();
  const player = await Player.findOne({
    resetPasswordToken: token,
    resetPasswordExpiry: { $gt: new Date() },
  });

  if (!player) {
    return fail("Der Link ist ungültig oder abgelaufen", 400);
  }

  player.password = await bcrypt.hash(newPassword, 10);
  player.resetPasswordToken = undefined;
  player.resetPasswordExpiry = undefined;
  if (player.status !== "active") player.status = "active";
  await player.save();

  return ok({ message: "Passwort wurde zurückgesetzt. Du kannst dich jetzt anmelden." });
}

export const POST = withErrorHandling(handler);
