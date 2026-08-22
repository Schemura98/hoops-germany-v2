import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";
import mongoose from "mongoose";

// POST /api/posts/deletepost – einen EIGENEN Beitrag löschen (Roadmap 37).
//
// Anlass: Bis zum 22.08.2026 gab es in der ganzen Oberfläche keinen Weg, einen
// eigenen Beitrag wieder loszuwerden – nur `/api/admin/deletepost` konnte es,
// und das ist Super-Admins vorbehalten. Wer sich vertippte oder etwas bereute,
// musste einen Betreiber bitten. Auf einer Plattform, deren Beiträge unter
// Klarnamen stehen und Benachrichtigungen an fremde Menschen auslösen, ist das
// zu wenig.
//
// ⚠️ EREIGNIS-BEITRÄGE SIND AUSDRÜCKLICH NICHT LÖSCHBAR (`kind === "auto"`).
// Das ist die wichtigste Zeile dieser Datei und keine Bequemlichkeit:
// Spielergebnisse und Transfers sind KEINE Meinungsäußerungen, sondern die
// protokollierte Tatsache, auf der die gesamte Positionierung der Plattform
// ruht („wie LinkedIn, nur nachweisbar"). Wer ein verlorenes Spiel aus seinem
// Verlauf löschen könnte, macht aus dem Beleg eine Selbstdarstellung – und der
// Beitrag ist ohnehin nur die ANZEIGE des Ereignisses, das Ereignis selbst
// liegt in `matches`/`transferevents`. Löschen würde also den Beleg verstecken,
// ohne die Tatsache zu ändern. Das ist die schlechteste aller Kombinationen.
//
// ⚠️ Ebenfalls bewusst NICHT gebaut: dass der Verfasser eines Beitrags FREMDE
// Kommentare darunter löschen darf. Das ist Moderation, nicht Aufräumen, und
// es ist die Funktion, mit der man unbequeme Antworten verschwinden lässt.
// Braucht eine eigene Entscheidung (Patrick/Nora), nicht diese Route.
//
// Hart gelöscht, nicht als „entfernt" markiert: `/post/[id]` fängt einen
// fehlenden Beitrag bereits ab („Dieser Beitrag existiert nicht mehr oder wurde
// entfernt"), also laufen bestehende Benachrichtigungen sauber auf. Ein
// Lösch-Kennzeichen müsste dagegen von JEDER Abfrage berücksichtigt werden –
// eine vergessene Stelle zeigt den Beitrag dann weiter, und das fällt niemandem
// auf.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const player = await getPlayerFromToken(getTokenFromRequest(req, body.token));
  if (!player) return fail("Nicht authentifiziert", 401);
  if (!body.postId) return fail("Beitrags-ID fehlt", 400);
  // ⚠️ Siehe `deletecomment/route.js`: `{"$ne": null}` wirft nicht, sondern
  // liefert einen beliebigen Beitrag. Zweite Schranke vor der Datenbank
  // (Befund Kai B1).
  if (!mongoose.isValidObjectId(body.postId)) return fail("Ungültige Kennung", 400);

  await connectDB();
  const post = await Post.findById(body.postId).select("player authorTeam kind autoType");
  if (!post) return fail("Beitrag nicht gefunden", 404);

  // ⚠️ Nicht nur `kind === "auto"` (Befund Kai B2). Die Sperre hing an einem
  // einzigen Zeichenvergleich: Ein Beitrag mit gesetztem `autoType`, dem aber
  // `kind` fehlt, war löschbar. Auf `hoops_prod` nur lesend nachgezählt und
  // heute NICHT auslösbar (188 Beiträge ohne `kind`, davon 0 mit `autoType`) —
  // aber es ist eine Annahme über künftige Schreiber, und die trägt nicht.
  // `autoType` ist das Merkmal, das ein Ereignis wirklich ausmacht.
  if (post.kind === "auto" || post.autoType) {
    return fail(
      "Ergebnisse und Transfers sind belegte Ereignisse und lassen sich nicht löschen.",
      403
    );
  }

  // Zwei Wege zur Berechtigung: eigener Beitrag, oder Vereins-Beitrag des
  // Vereins, den ich verwalte (dort hat der Verein „gesprochen", nicht ich).
  const eigener = post.player && String(post.player) === String(player._id);
  const meinVerein =
    post.authorTeam &&
    player.teamAdminOf &&
    String(post.authorTeam) === String(player.teamAdminOf);

  if (!eigener && !meinVerein) return fail("Keine Berechtigung", 403);

  await Post.findByIdAndDelete(post._id);
  return ok({ message: "Beitrag gelöscht", postId: String(post._id) });
}

export const POST = withErrorHandling(handler);
