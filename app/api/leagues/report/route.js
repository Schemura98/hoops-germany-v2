import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import Feedback from "@/models/Feedback";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { sendMail } from "@/lib/mailer";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/leagues/report – Liga-Meldung an die Super-Admins (Notfall/Korrektur,
// z. B. fehlende oder falsche Liga). Landet in der Admin-Inbox + per Mail.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const message = body.message?.trim() || "";
  const leagueName = body.leagueName?.trim() || "";
  const bundesland = body.bundesland?.trim() || "";
  if (!message && !leagueName) {
    return fail("Bitte beschreibe kurz, was mit der Liga nicht stimmt.", 400);
  }

  await connectDB();

  // Wer meldet? (optional – Meldung geht auch ohne Login)
  let reporter = "";
  try {
    const player = await getPlayerFromToken(getTokenFromRequest(req, body.token));
    if (player) reporter = `${player.firstName} ${player.lastName} <${player.email}>`;
  } catch {
    /* anonym ok */
  }

  const lines = [];
  if (leagueName) lines.push(`Liga: ${leagueName}`);
  if (bundesland) lines.push(`Bundesland: ${bundesland}`);
  if (message) lines.push(message);
  if (reporter) lines.push(`— gemeldet von ${reporter}`);
  const text = lines.join("\n");

  // In der Admin-Inbox sichtbar machen.
  await Feedback.create({ type: "Liga-Meldung", message: text, status: "new" });

  // Super-Admins per Mail benachrichtigen.
  try {
    const admins = await Player.find({ isSuperAdmin: true }).select("email").lean();
    const to =
      admins.map((a) => a.email).filter(Boolean).join(", ") ||
      process.env.SMTP_USER ||
      "info@hoopsgermany.de";
    await sendMail({
      to,
      subject: "Hoops Germany – Liga-Meldung",
      html: `<p>Es ist eine neue Liga-Meldung eingegangen:</p><pre style="white-space:pre-wrap;font-family:inherit">${text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")}</pre>`,
      text,
    });
  } catch (err) {
    console.error("[LEAGUE REPORT MAIL ERROR]", err);
  }

  return ok({ message: "Danke! Deine Meldung ist bei den Admins eingegangen." });
}

export const POST = withErrorHandling(handler);
