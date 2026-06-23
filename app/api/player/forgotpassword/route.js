import crypto from "crypto";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { sendMail } from "@/lib/mailer";
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

    const link = `${getBaseUrl(req)}/reset-password?token=${token}`;
    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#111827">Passwort zurücksetzen</h2>
        <p style="color:#4b5563">Hallo ${player.firstName || ""},</p>
        <p style="color:#4b5563">
          du hast angefordert, dein Passwort zurückzusetzen. Klicke auf den Button
          (gültig für 1 Stunde):
        </p>
        <p style="margin:24px 0">
          <a href="${link}" style="background:#f97316;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">
            Neues Passwort setzen
          </a>
        </p>
        <p style="color:#9ca3af;font-size:12px">
          Falls du das nicht warst, kannst du diese E-Mail ignorieren.
        </p>
      </div>`;

    try {
      await sendMail({
        to: player.email,
        subject: "Hoops Germany – Passwort zurücksetzen",
        html,
        text: `Passwort zurücksetzen: ${link}`,
      });
    } catch (err) {
      // Versand-Fehler nicht nach außen leaken; nur protokollieren.
      console.error("[FORGOT PASSWORD MAIL ERROR]", err);
    }
  }

  return ok({ message: GENERIC });
}

export const POST = withErrorHandling(handler);
