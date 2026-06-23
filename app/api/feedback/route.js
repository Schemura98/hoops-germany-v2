import { connectDB } from "@/lib/db";
import Feedback from "@/models/Feedback";
import { sendMail } from "@/lib/mailer";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/feedback – strukturiertes Feedback speichern + Admin per E-Mail benachrichtigen.
async function handler(req) {
  const body = await req.json().catch(() => ({}));

  const type = body.type?.trim() || "Allgemein";
  const areas = Array.isArray(body.areas) ? body.areas.filter(Boolean).slice(0, 12) : [];
  const ratingNum = parseInt(body.rating, 10);
  const rating =
    Number.isFinite(ratingNum) && ratingNum >= 1 && ratingNum <= 5 ? ratingNum : null;
  const likes = body.likes?.trim() || "";
  const dislikes = body.dislikes?.trim() || "";
  const suggestions = body.suggestions?.trim() || "";
  const freeMessage = body.message?.trim() || "";

  // Mindestens eine inhaltliche Angabe verlangen
  if (!rating && !areas.length && !likes && !dislikes && !suggestions && !freeMessage) {
    return fail("Bitte gib uns wenigstens eine Rückmeldung (Bewertung, Thema oder Text).", 400);
  }

  // Lesefassung zusammensetzen (für Admin-Liste & E-Mail)
  const parts = [];
  if (rating) parts.push(`Gesamteindruck: ${rating}/5`);
  if (areas.length) parts.push(`Themen: ${areas.join(", ")}`);
  if (likes) parts.push(`Gefällt: ${likes}`);
  if (dislikes) parts.push(`Gefällt nicht: ${dislikes}`);
  if (suggestions) parts.push(`Vorschlag: ${suggestions}`);
  if (freeMessage) parts.push(freeMessage);
  const message = parts.join("\n");

  await connectDB();
  await Feedback.create({
    type,
    areas,
    rating,
    likes,
    dislikes,
    suggestions,
    message,
    status: "new",
  });

  // Benachrichtigung an Admin – Fehler hier nicht nach außen geben.
  try {
    await sendMail({
      to: process.env.SMTP_USER || "info@hoopsgermany.de",
      subject: `Neues Feedback (${type}${rating ? ` · ${rating}/5` : ""})`,
      html:
        `<p><strong>Typ:</strong> ${type}</p>` +
        (rating ? `<p><strong>Gesamteindruck:</strong> ${rating}/5</p>` : "") +
        (areas.length ? `<p><strong>Themen:</strong> ${areas.join(", ")}</p>` : "") +
        (likes ? `<p><strong>Gefällt:</strong> ${likes}</p>` : "") +
        (dislikes ? `<p><strong>Gefällt nicht:</strong> ${dislikes}</p>` : "") +
        (suggestions ? `<p><strong>Vorschlag:</strong> ${suggestions}</p>` : "") +
        (freeMessage ? `<p>${freeMessage.replace(/\n/g, "<br>")}</p>` : ""),
      text: message,
    });
  } catch (err) {
    console.error("[FEEDBACK MAIL ERROR]", err);
  }

  return ok({ message: "Danke für dein Feedback!" });
}

export const POST = withErrorHandling(handler);
