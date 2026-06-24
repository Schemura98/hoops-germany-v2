import crypto from "crypto";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { sendMail } from "@/lib/mailer";
import { passwordResetEmail } from "@/lib/emailTemplates";
import { getBaseUrl } from "@/lib/baseUrl";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

const GENERIC =
  "Falls ein Konto mit dieser E-Mail existiert, haben wir einen Link zum Zurücksetzen gesendet.";

// POST /api/player/forgotpassword – Reset-Link per E-Mail anfordern.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const email = body.email?.toLowerCase().trim();

  if (!email) {
    return fail("Bitte eine E-Mail-Adresse angeben", 400);
  }

  await connectDB();
  const player = await Player.findOne({ email });

  // Aus Sicherheitsgründen immer dieselbe Antwort (keine Auskunft, ob das Konto existiert).
  if (player) {
    const token = crypto.randomBytes(32).toString("hex");
    player.resetPasswordToken = token;
    player.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 Stunde
    await player.save();

    const baseUrl = getBaseUrl(req);
    const link = `${baseUrl}/reset-password?token=${token}`;
    const { subject, html, text } = passwordResetEmail({
      firstName: player.firstName,
      link,
      baseUrl,
    });

    try {
      await sendMail({ to: player.email, subject, html, text });
    } catch (err) {
      // Versand-Fehler nicht nach außen leaken; nur protokollieren.
      console.error("[FORGOT PASSWORD MAIL ERROR]", err);
    }
  }

  return ok({ message: GENERIC });
}

export const POST = withErrorHandling(handler);
