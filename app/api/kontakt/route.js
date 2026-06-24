import { sendMail } from "@/lib/mailer";
import { contactEmail } from "@/lib/emailTemplates";
import { getBaseUrl } from "@/lib/baseUrl";
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
    const mail = contactEmail({ name, email, message, baseUrl: getBaseUrl(req) });
    await sendMail({
      to: process.env.SMTP_USER || "info@hoopsgermany.de",
      replyTo: email,
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
