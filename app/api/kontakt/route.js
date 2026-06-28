import { sendMail } from "@/lib/mailer";
import { contactEmail } from "@/lib/emailTemplates";
import { getAdminNotifyTo } from "@/lib/adminRecipients";
import { getBaseUrl } from "@/lib/baseUrl";
import { connectDB } from "@/lib/db";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/kontakt – Kontaktanfrage per E-Mail an das Team senden.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const name = body.name?.trim();
  const email = body.email?.trim();
  const message = body.message?.trim();

  if (!name || !email || !message) {
    return fail("Bitte alle Felder ausfüllen", 400);
  }
  if (!EMAIL_RE.test(email)) {
    return fail("Bitte eine gültige E-Mail-Adresse angeben", 400);
  }

  try {
    await connectDB();
    // Kontaktanfragen sind administrativ → an alle Super-Admins + zentrales Postfach.
    const to = await getAdminNotifyTo();
    const mail = contactEmail({ name, email, message, baseUrl: getBaseUrl(req) });
    await sendMail({
      to,
      replyTo: email, // direkte Antwort an den Absender möglich
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
  } catch (err) {
    console.error("[KONTAKT MAIL ERROR]", err);
    return fail("Nachricht konnte nicht gesendet werden. Bitte später erneut versuchen.", 502);
  }

  return ok({ message: "Danke! Wir melden uns bei dir." });
}

export const POST = withErrorHandling(handler);
