import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/posts/deletecomment – einen EIGENEN Kommentar oder eine eigene
// Antwort löschen (Roadmap 37). Mit `replyId` trifft es die Antwort, ohne den
// Kommentar.
//
// ⚠️ Es gab bis zum 22.08.2026 GAR KEINEN Löschweg für Kommentare – auch nicht
// für Super-Admins. `/api/admin/deletepost` löscht nur ganze Beiträge.
//
// ⚠️ Gelöscht werden darf nur, was man SELBST geschrieben hat. Ausdrücklich
// nicht: fremde Kommentare unter dem eigenen Beitrag. Das wäre Moderation und
// braucht eine eigene Entscheidung – Begründung im Kopf von
// `app/api/posts/deletepost/route.js`.
//
// ⚠️ Ein gelöschter Kommentar nimmt seine Antworten mit. Das ist eine
// Entscheidung, keine Nachlässigkeit: Antworten sind im Datenmodell IN den
// Kommentar eingebettet (`replies` in `commentSchema`), es gibt also keinen Ort,
// an dem eine verwaiste Antwort weiterleben könnte. Der Hinweistext in der
// Oberfläche sagt das vorher, damit niemand fremde Antworten aus Versehen
// mitlöscht.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const player = await getPlayerFromToken(getTokenFromRequest(req, body.token));
  if (!player) return fail("Nicht authentifiziert", 401);
  if (!body.postId || !body.commentId) return fail("Angaben unvollständig", 400);

  await connectDB();
  const post = await Post.findById(body.postId);
  if (!post) return fail("Beitrag nicht gefunden", 404);

  const comment = post.comments?.id(body.commentId);
  if (!comment) return fail("Kommentar nicht gefunden", 404);

  const gehoertMir = (doc) =>
    doc?.player && String(doc.player) === String(player._id);

  if (body.replyId) {
    const reply = comment.replies?.id(body.replyId);
    if (!reply) return fail("Antwort nicht gefunden", 404);
    if (!gehoertMir(reply)) return fail("Keine Berechtigung", 403);
    reply.deleteOne();
    await post.save();
    return ok({ message: "Antwort gelöscht", replyId: String(body.replyId) });
  }

  if (!gehoertMir(comment)) return fail("Keine Berechtigung", 403);
  const antworten = comment.replies?.length || 0;
  comment.deleteOne();
  await post.save();
  return ok({
    message: "Kommentar gelöscht",
    commentId: String(body.commentId),
    // Die Oberfläche zeigt damit an, was wirklich verschwunden ist.
    entfernteAntworten: antworten,
  });
}

export const POST = withErrorHandling(handler);
