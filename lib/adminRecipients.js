import Player from "@/models/Player";

// Zentrales Postfach: alle Admin-Benachrichtigungen (neues Team, Feedback,
// Liga-Meldung, Mismatch …) laufen gebündelt hier auf, damit nichts in den
// persönlichen Postfächern untergeht. Überschreibbar via ADMIN_INBOX.
export const CENTRAL_INBOX = process.env.ADMIN_INBOX || "info@hoopsgermany.de";

// Empfänger für Admin-Benachrichtigungs-Mails: alle Super-Admin-Adressen PLUS
// das zentrale Postfach (dedupliziert). Liefert einen Komma-String für `to`.
// `extra` erlaubt zusätzliche Adressen (z.B. betroffene Team-Admins).
export async function getAdminNotifyTo(extra = []) {
  const admins = await Player.find({ isSuperAdmin: true }).select("email").lean();
  const set = new Set();
  for (const a of admins) {
    if (a.email) set.add(a.email.trim().toLowerCase());
  }
  for (const e of extra) {
    if (e) set.add(String(e).trim().toLowerCase());
  }
  if (CENTRAL_INBOX) set.add(CENTRAL_INBOX.toLowerCase());
  return [...set].join(", ");
}
