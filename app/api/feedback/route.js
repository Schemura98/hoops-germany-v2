import { connectDB } from "@/lib/db";
import Feedback from "@/models/Feedback";
import { sendMail } from "@/lib/mailer";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/feedback – Feedback speichern und Admin per E-Mail benachrichtigen.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const message = body.message?.trim();
  const type = body.type?.trim() || "Allgemein";

  if (!message) {
    return fail("Bitte eine Nachricht eingeben", 400);
  }

  await connectDB();
  await Feedback.create({ message, type, status: "new" });

  // Benachrichtigung an Admin – Fehler hier nicht nach außen geben.
  try {
    await sendMail({
      to: process.env.SMTP_USER || "info@hoopsgermany.de",
      subject: `Neues Feedback (${type})`,
      html: `<p><strong>Typ:</strong> ${type}</p><p>${message.replace(/\n/g, "<br>")}</p>`,
      text: `Typ: ${type}\n\n${message}`,
    });
  } catch (err) {
    console.error("[FEEDBACK MAIL ERROR]", err);
  }

  return ok({ message: "Danke für dein Feedback!" });
}

export const POST = withErrorHandling(handler);
