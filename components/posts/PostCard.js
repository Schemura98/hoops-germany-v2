"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  PiHeartBold,
  PiHeartFill,
  PiChatCircleBold,
  PiBasketballBold,
  PiArrowsLeftRightBold,
  PiUsersBold,
  PiMegaphoneBold,
  PiMagnifyingGlassBold,
  PiUserPlusBold,
} from "react-icons/pi";
import { getPlayerToken } from "@/lib/clientAuth";
import { timeAgo } from "@/lib/timeAgo";
import Avatar from "./Avatar";
import BaseAvatar from "@/components/Avatar";
import RichText from "./RichText";
import PostEmbed from "./PostEmbed";
import MentionTextarea from "./MentionTextarea";
import ErgebnisInhalt from "./ErgebnisInhalt";

// Darstellung der automatischen Ereignis-Beiträge (Icon + Badge je Typ).
const AUTO = {
  match_result: { Icon: PiBasketballBold, label: "Spielergebnis", color: "bg-brand-500/15 text-brand-400" },
  transfer: { Icon: PiArrowsLeftRightBold, label: "Transfer", color: "bg-navy-700 text-mist-300" },
  team_founded: { Icon: PiUsersBold, label: "Neues Team", color: "bg-signal-ok/15 text-signal-ok" },
  tryout: { Icon: PiMegaphoneBold, label: "Tryout", color: "bg-navy-700 text-mist-300" },
  recruiting: { Icon: PiMagnifyingGlassBold, label: "Spieler gesucht", color: "bg-navy-700 text-mist-300" },
  transfer_available: { Icon: PiUserPlusBold, label: "Auf Vereinssuche", color: "bg-navy-700 text-mist-300" },
};
const AUTO_FALLBACK = { Icon: PiBasketballBold, label: "Update", color: "bg-navy-700 text-mist-400" };

function authorLink(player) {
  return player?.slug || player?._id
    ? `/player/view-player/${player.slug || player._id}`
    : "#";
}

// Wiederverwendbarer Like-Button für Kommentare und Antworten.
function LikeButton({ liked, count, busy, onToggle }) {
  return (
    <button
      onClick={onToggle}
      disabled={busy}
      className={`inline-flex items-center gap-1 text-xs ${
        liked ? "text-brand-400" : "text-mist-400 hover:text-brand-400"
      }`}
    >
      {liked ? <PiHeartFill /> : <PiHeartBold />}
      {count > 0 && <span>{count}</span>}
    </button>
  );
}

// Eine Antwort auf einen Kommentar (eingerückt, ebenfalls likebar).
function ReplyItem({ reply, postId, commentId, currentPlayerId }) {
  const [liked, setLiked] = useState(
    (reply.likes || []).some((l) => String(l) === String(currentPlayerId))
  );
  const [likeCount, setLikeCount] = useState((reply.likes || []).length);
  const [busy, setBusy] = useState(false);

  async function toggleLike() {
    if (busy) return;
    setBusy(true);
    const prev = { liked, likeCount };
    setLiked(!liked);
    setLikeCount((c) => c + (liked ? -1 : 1));
    try {
      const token = getPlayerToken();
      const { data } = await axios.post("/api/posts/likecomment", {
        token,
        postId,
        commentId,
        replyId: reply._id,
      });
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch {
      setLiked(prev.liked);
      setLikeCount(prev.likeCount);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Link href={authorLink(reply.player)}>
        <Avatar player={reply.player} className="h-7 w-7" />
      </Link>
      <div className="flex-1">
        <div className="bg-navy-950 rounded-md px-3 py-2">
          <Link
            href={authorLink(reply.player)}
            className="text-sm font-medium text-paper-50 hover:text-brand-400"
          >
            {reply.player?.firstName} {reply.player?.lastName}
          </Link>
          <p className="text-sm text-mist-300 whitespace-pre-line break-words">
            <RichText text={reply.text} mentions={reply.mentions} />
          </p>
        </div>
        <div className="mt-1 pl-3">
          <LikeButton liked={liked} count={likeCount} busy={busy} onToggle={toggleLike} />
        </div>
      </div>
    </div>
  );
}

// Ein Kommentar inkl. Like, Antworten-Liste und Antwort-Eingabe.
function CommentItem({ comment, postId, currentPlayerId }) {
  const [liked, setLiked] = useState(
    (comment.likes || []).some((l) => String(l) === String(currentPlayerId))
  );
  const [likeCount, setLikeCount] = useState((comment.likes || []).length);
  const [likeBusy, setLikeBusy] = useState(false);

  const [replies, setReplies] = useState(comment.replies || []);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  async function toggleLike() {
    if (likeBusy) return;
    setLikeBusy(true);
    const prev = { liked, likeCount };
    setLiked(!liked);
    setLikeCount((c) => c + (liked ? -1 : 1));
    try {
      const token = getPlayerToken();
      const { data } = await axios.post("/api/posts/likecomment", {
        token,
        postId,
        commentId: comment._id,
      });
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch {
      setLiked(prev.liked);
      setLikeCount(prev.likeCount);
    } finally {
      setLikeBusy(false);
    }
  }

  async function addReply() {
    if (!replyText.trim() || replying) return;
    setReplying(true);
    try {
      const token = getPlayerToken();
      const { data } = await axios.post("/api/posts/addreply", {
        token,
        postId,
        commentId: comment._id,
        text: replyText,
      });
      setReplies((r) => [...r, data.reply]);
      setReplyText("");
      setShowReply(false);
    } catch {
      /* belassen */
    } finally {
      setReplying(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Link href={authorLink(comment.player)}>
        <Avatar player={comment.player} className="h-8 w-8" />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="bg-navy-950 rounded-md px-3 py-2">
          <Link
            href={authorLink(comment.player)}
            className="text-sm font-medium text-paper-50 hover:text-brand-400"
          >
            {comment.player?.firstName} {comment.player?.lastName}
          </Link>
          <p className="text-sm text-mist-300 whitespace-pre-line break-words">
            <RichText text={comment.text} mentions={comment.mentions} />
          </p>
        </div>

        {/* Aktionen */}
        <div className="mt-1 pl-3 flex items-center gap-4">
          <LikeButton liked={liked} count={likeCount} busy={likeBusy} onToggle={toggleLike} />
          <button
            onClick={() => setShowReply((v) => !v)}
            className="text-xs font-medium text-mist-400 hover:text-brand-400"
          >
            Antworten
          </button>
        </div>

        {/* Antworten */}
        {replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {replies.map((r) => (
              <ReplyItem
                key={r._id}
                reply={r}
                postId={postId}
                commentId={comment._id}
                currentPlayerId={currentPlayerId}
              />
            ))}
          </div>
        )}

        {/* Antwort-Eingabe */}
        {showReply && (
          <div className="mt-2 flex gap-2">
            <MentionTextarea
              multiline={false}
              autoFocus
              value={replyText}
              onChange={setReplyText}
              onEnter={addReply}
              placeholder="Antworten…"
              wrapperClassName="relative flex-1"
              className="w-full rounded-full border border-navy-600 px-4 py-1.5 text-sm text-paper-50 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            <button
              onClick={addReply}
              disabled={replying || !replyText.trim()}
              className="bg-brand-500 hover:bg-brand-400 disabled:opacity-60 text-navy-950 rounded-full px-4 py-1.5 text-sm font-medium"
            >
              Senden
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PostCard({ post, currentPlayerId }) {
  const initialLiked = (post.likes || []).some(
    (l) => String(l) === String(currentPlayerId)
  );
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState((post.likes || []).length);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [liking, setLiking] = useState(false);
  const [commenting, setCommenting] = useState(false);

  // Gesamtzahl Kommentare inkl. Antworten (für den Zähler).
  const commentTotal =
    comments.length +
    comments.reduce((sum, c) => sum + (c.replies?.length || 0), 0);

  async function toggleLike() {
    if (liking) return;
    setLiking(true);
    // Optimistisch
    const prev = { liked, likeCount };
    setLiked(!liked);
    setLikeCount((c) => c + (liked ? -1 : 1));
    try {
      const token = getPlayerToken();
      const { data } = await axios.post("/api/posts/likepost", {
        token,
        postId: post._id,
      });
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch {
      setLiked(prev.liked);
      setLikeCount(prev.likeCount);
    } finally {
      setLiking(false);
    }
  }

  async function addComment() {
    if (!commentText.trim() || commenting) return;
    setCommenting(true);
    try {
      const token = getPlayerToken();
      const { data } = await axios.post("/api/posts/addcomment", {
        token,
        postId: post._id,
        text: commentText,
      });
      setComments((c) => [...c, data.comment]);
      setCommentText("");
    } catch {
      /* still */
    } finally {
      setCommenting(false);
    }
  }

  const author = post.player;
  const isAuto = post.kind === "auto";
  const auto = isAuto ? AUTO[post.autoType] || AUTO_FALLBACK : null;
  // Vereins-Beitrag (Team als Autor) – nur wenn es kein Auto-Post ist.
  const teamAuthor = !isAuto && post.authorTeam ? post.authorTeam : null;
  const teamLink = teamAuthor?.slug
    ? `/team/team-detail/${teamAuthor.slug}`
    : "#";

  // Zwei Ränge statt einer Schachtel (Entwurf Vivien, 15.08.2026, §3.4).
  //
  // Bis heute lagen ein beidseitig bestätigtes 80:94 und „Game Day! Heute
  // zählt's." in exakt derselben Fläche, mit demselben Rahmen und demselben
  // Gewicht. Das war der zweitgrößte Beitrag zum „alles gleich"-Eindruck.
  //
  // Rang A – Ereignis (`kind === "auto"`): eine Tatsache. Bleibt ein
  //   Tafel-Segment mit Fläche und Rahmen.
  // Rang B – Wort (`kind === "user"`): ein Gespräch. Kein Kasten, nur eine
  //   Trennlinie.
  //
  // ⚠️ Das ist ein GEWICHTS-Unterschied, keine Abwertung: Rang B wird ruhiger,
  // nicht kleiner – die Textgröße bleibt unverändert. Was verschwindet, ist der
  // Rahmen, der einem Halbsatz das Gewicht einer Meldung gab.
  const rang = isAuto
    ? "bg-navy-800 rounded-md border border-navy-600 p-4"
    : "border-b border-navy-600 pb-5";

  return (
    <div className={rang}>
      {isAuto ? (
        <>
          {/* Kopf (Ereignis) */}
          <div className="flex items-center gap-3">
            <span
              className={`h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center ${auto.color}`}
            >
              <auto.Icon />
            </span>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-mist-400">
                {auto.label}
              </span>
              <p className="text-xs text-mist-400">{timeAgo(post.createdAt)}</p>
            </div>
          </div>

          {/* Inhalt (verlinkt aufs Ereignis).
              Ergebnisse bekommen seit dem 18.08.2026 eine eigene Form: der
              Punktestand führt, der Beleg ist eine eigene Zeile, und wer im
              Box-Score steht, sieht seine eigenen Zahlen dazu. Alles andere
              bleibt die Satzform – sie trägt dort, wo es nichts zu beziffern
              gibt (Tryout, Vereinssuche, Neues Team). */}
          {post.autoType === "match_result" ? (
            <ErgebnisInhalt post={post} />
          ) : post.meta?.href ? (
            <Link href={post.meta.href} className="block mt-3 group">
              <p className="font-semibold text-paper-50 group-hover:text-brand-400">
                {post.content}
              </p>
              {post.meta?.note && (
                <p className="text-xs text-mist-400 mt-0.5">{post.meta.note}</p>
              )}
            </Link>
          ) : (
            <div className="mt-3">
              <p className="font-semibold text-paper-50">{post.content}</p>
              {post.meta?.note && (
                <p className="text-xs text-mist-400 mt-0.5">{post.meta.note}</p>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Kopf */}
          {teamAuthor ? (
            <div className="flex items-center gap-3">
              <Link href={teamLink}>
                <BaseAvatar
                  name={teamAuthor.teamName}
                  src={teamAuthor.logo}
                  square
                />
              </Link>
              <div>
                <Link
                  href={teamLink}
                  className="font-medium text-paper-50 hover:text-brand-400"
                >
                  {teamAuthor.teamName}
                </Link>
                <p className="text-xs text-mist-400">
                  <span className="text-brand-400 font-medium">Verein</span> ·{" "}
                  {timeAgo(post.createdAt)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href={authorLink(author)}>
                <Avatar player={author} />
              </Link>
              <div>
                <Link
                  href={authorLink(author)}
                  className="font-medium text-paper-50 hover:text-brand-400"
                >
                  {author?.firstName} {author?.lastName}
                </Link>
                <p className="text-xs text-mist-400">{timeAgo(post.createdAt)}</p>
              </div>
            </div>
          )}

          {/* Inhalt */}
          {/* ⚠️ `max-w-[68ch]` (Entwurf Vivien §3.4, nachgetragen 15.08.2026).
              Der Kommentar auf der Newsfeed-Seite behauptete diese Kappung
              bereits, während es hier KEIN `max-w` gab (Befund Kai): Die
              Spalte wuchs von 544 auf 700 px, und die Begründung dafür war
              erfunden. Jetzt stimmt sie.
              Gekappt wird der TEXT, nicht die Spalte – Ergebniszeilen und
              Bilder dürfen die volle Breite nutzen, Fließtext bleibt bei
              45–75 Zeichen lesbar. */}
          {post.content && (
            <p className="mt-3 max-w-[68ch] text-paper-50 whitespace-pre-line">
              <RichText text={post.content} mentions={post.mentions} />
            </p>
          )}
          {post.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.image}
              alt=""
              className="mt-3 rounded-md max-h-96 w-full object-cover"
            />
          )}
          <PostEmbed embed={post.embed} />
        </>
      )}

      {/* Aktionen
          ⚠️ GRÖSSERE ZIELE OHNE GRÖSSERE KARTE (Entwurf Vivien, 18.08.2026).
          Die Knöpfe maßen 29x20 px – unter dem Mindestmaß von 24x24 (WCAG
          2.5.8 AA). Der Fehler ist ALT (stand schon im Live-Stand `aff17e6`),
          fiel aber erst auf, seit die mobilen Wegweiser sauber auf 44 px
          stehen: sauberes Ziel oben, 20-px-Ziel darunter.

          Der Kniff: Innenabstand macht das ZIEL größer, ein gleich großer
          negativer Außenabstand zieht das LAYOUT wieder zurück. Am laufenden
          Browser vorher/nachher gemessen – Kartenhöhe 155 → 155 px,
          Aktionszeile 33 → 33 px, Ziel 28,7x20 → 44,7x32.

          ⚠️ BEWUSST 32 UND NICHT 44 px. Die Wegweiser sind Navigation am
          Rand; diese Knöpfe sitzen mitten im Lesestoff, in einer Liste, durch
          die gewischt wird. Ein 44-px-Ziel unter einem 20-px-Bild fängt
          Wischbewegungen ab und erzeugt Fehlklicks – und ein Like verschickt
          eine Benachrichtigung an einen echten Menschen. Viviens Grenze:
          „Ein Klickziel darf großzügig sein, aber es muss noch das sein, was
          man sieht."

          ⚠️ KEIN dauerhafter Rahmen um die Knöpfe: Das ergäbe dieselbe
          Pillenform wie die mobilen Wegweiser – zwei Bauteile mit derselben
          Geste und verschiedener Funktion, also genau die Gleichförmigkeit,
          die diesen ganzen Umbau ausgelöst hat. */}
      {/* ⚠️ `gap-5` (20 px) MUSS bleiben und darf nicht verkleinert werden.
          Die Knöpfe ziehen sich mit -mx-2 je 8 px nach außen; bei gap-3 (12 px)
          ergibt das 12 − 8 − 8 = **−4 px**, die Ziele ÜBERLAPPEN sich also und
          ein Tippen am Rand trifft den falschen Knopf. Beim Bauen genau so
          passiert und nur aufgefallen, weil der Abstand mitgemessen wurde.
          Mit gap-5 bleiben 20 − 16 = 4 px echter Zwischenraum. */}
      <div className="mt-3 flex items-center gap-5 text-sm text-mist-400 border-t border-navy-600 pt-3">
        <button
          onClick={toggleLike}
          aria-pressed={liked}
          className={`inline-flex items-center gap-1.5 -my-1.5 -mx-2 px-2 py-1.5 rounded-sm transition-colors hover:bg-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800 ${
            liked ? "text-brand-400" : "hover:text-brand-400"
          }`}
        >
          {liked ? <PiHeartFill aria-hidden="true" /> : <PiHeartBold aria-hidden="true" />}{" "}
          {/* Vorleseprogramme sagten bisher nur die nackte Zahl („fünf").
              Das Wort steht IM Knopf statt als überschreibende Beschriftung –
              sonst verschwindet die Zahl für Blinde ganz. Muster wie in
              `components/landing/LandingFeatures.js`. */}
          <span className="sr-only">Gefällt mir{liked ? ", von dir markiert" : ""}: </span>
          {likeCount}
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          aria-expanded={showComments}
          className="inline-flex items-center gap-1.5 -my-1.5 -mx-2 px-2 py-1.5 rounded-sm transition-colors hover:bg-navy-700 hover:text-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800"
        >
          <PiChatCircleBold aria-hidden="true" />{" "}
          <span className="sr-only">Kommentare: </span>
          {commentTotal}
        </button>
      </div>

      {/* Kommentare */}
      {showComments && (
        <div className="mt-3 space-y-3">
          {comments.map((c) => (
            <CommentItem
              key={c._id}
              comment={c}
              postId={post._id}
              currentPlayerId={currentPlayerId}
            />
          ))}

          <div className="flex gap-2">
            <MentionTextarea
              multiline={false}
              value={commentText}
              onChange={setCommentText}
              onEnter={addComment}
              placeholder="Kommentieren…"
              wrapperClassName="relative flex-1"
              className="w-full rounded-full border border-navy-600 px-4 py-2 text-sm text-paper-50 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            <button
              onClick={addComment}
              disabled={commenting || !commentText.trim()}
              className="bg-brand-500 hover:bg-brand-400 disabled:opacity-60 text-navy-950 rounded-full px-4 py-2 text-sm font-medium"
            >
              Senden
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
