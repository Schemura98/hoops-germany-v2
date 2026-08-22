"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  PiHeartBold,
  PiHeartFill,
  PiChatCircleBold,
  PiTrashBold,
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
import ConfirmAction from "@/components/ui/ConfirmAction";

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

// Wiederverwendbarer Löschen-Auslöser (Roadmap 37, 22.08.2026).
//
// ⚠️ `ConfirmAction` und NICHT `window.confirm` – das ist Projektstandard und
// hier besonders wichtig: Löschen ist unumkehrbar, und der Auslöser sitzt
// mitten in einer Liste, durch die gewischt wird.
//
// ⚠️ Bewusst nur ein Symbol ohne Beschriftung, in `mist-400`, das erst beim
// Zeigen auf `signal-error` anspringt. Ein dauerhaft rotes Element neben jedem
// eigenen Beitrag würde die Liste zur Warnanzeige machen – und die Handlung,
// die hier zählt, ist Lesen, nicht Löschen. Für Vorleseprogramme trägt der
// Knopf trotzdem einen vollen Namen.
function LoeschKnopf({ was, hinweis, busy, onConfirm, className = "" }) {
  return (
    <ConfirmAction
      trigger={({ onClick }) => (
        /* ⚠️ `min-h-8 min-w-8` ist GEMESSEN, nicht dekorativ: Ohne diese Angabe
           ist das Klickziel 30x26 px, während Like und Kommentar daneben 45x32
           messen. Der Grund ist unscheinbar – die beiden Nachbarn tragen eine
           sichtbare Zahl und damit eine volle Zeilenbox, dieser Knopf nur ein
           Symbol und `sr-only`-Text, der keine Höhe erzeugt. Ein Ziel, das
           kleiner ist als seine Nachbarn, ist genau dort gefährlich, wo es das
           Löschen auslöst. */
        <button
          type="button"
          onClick={onClick}
          disabled={busy}
          className={`inline-flex min-h-8 min-w-8 items-center justify-center gap-1.5 -my-1.5 -mx-2 px-2 py-1.5 rounded-sm text-mist-400 transition-colors hover:bg-navy-700 hover:text-signal-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 ${className}`}
        >
          <PiTrashBold aria-hidden="true" />
          <span className="sr-only">{was} löschen</span>
        </button>
      )}
      message={hinweis}
      confirmLabel="Löschen"
      busy={busy}
      onConfirm={onConfirm}
    />
  );
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
function ReplyItem({ reply, postId, commentId, currentPlayerId, onDeleted }) {
  const [liked, setLiked] = useState(
    (reply.likes || []).some((l) => String(l) === String(currentPlayerId))
  );
  const [likeCount, setLikeCount] = useState((reply.likes || []).length);
  const [busy, setBusy] = useState(false);
  const [loeschBusy, setLoeschBusy] = useState(false);
  const meins = String(reply.player?._id || reply.player) === String(currentPlayerId);

  async function loeschen() {
    if (loeschBusy) return;
    setLoeschBusy(true);
    try {
      await axios.post("/api/posts/deletecomment", {
        token: getPlayerToken(),
        postId,
        commentId,
        replyId: reply._id,
      });
      onDeleted?.(reply._id);
    } catch {
      // Bleibt stehen – der Nutzer sieht, dass nichts passiert ist, und kann
      // es erneut versuchen. Eine Fehlermeldung an dieser Stelle wäre ein
      // vierter Text in einer ohnehin dichten Zeile.
      setLoeschBusy(false);
    }
  }

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
        <div className="bg-navy-700 rounded-sm px-3 py-2">
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
        <div className="mt-1 pl-3 flex items-center gap-4">
          <LikeButton liked={liked} count={likeCount} busy={busy} onToggle={toggleLike} />
          {meins && (
            <LoeschKnopf
              was="Antwort"
              hinweis="Diese Antwort löschen?"
              busy={loeschBusy}
              onConfirm={loeschen}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Ein Kommentar inkl. Like, Antworten-Liste und Antwort-Eingabe.
function CommentItem({ comment, postId, currentPlayerId, onDeleted }) {
  const [liked, setLiked] = useState(
    (comment.likes || []).some((l) => String(l) === String(currentPlayerId))
  );
  const [likeCount, setLikeCount] = useState((comment.likes || []).length);
  const [likeBusy, setLikeBusy] = useState(false);

  const [replies, setReplies] = useState(comment.replies || []);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [loeschBusy, setLoeschBusy] = useState(false);
  const meins = String(comment.player?._id || comment.player) === String(currentPlayerId);

  async function loeschen() {
    if (loeschBusy) return;
    setLoeschBusy(true);
    try {
      await axios.post("/api/posts/deletecomment", {
        token: getPlayerToken(),
        postId,
        commentId: comment._id,
      });
      onDeleted?.(comment._id);
    } catch {
      setLoeschBusy(false);
    }
  }

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
        <div className="bg-navy-700 rounded-sm px-3 py-2">
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
          {meins && (
            <LoeschKnopf
              was="Kommentar"
              hinweis={
                replies.length
                  ? `Diesen Kommentar löschen? Die ${replies.length} Antwort${
                      replies.length === 1 ? "" : "en"
                    } darunter verschwinden mit.`
                  : "Diesen Kommentar löschen?"
              }
              busy={loeschBusy}
              onConfirm={loeschen}
            />
          )}
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
                onDeleted={(id) =>
                  setReplies((liste) => liste.filter((x) => String(x._id) !== String(id)))
                }
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
              className="w-full rounded-sm border border-navy-600 bg-navy-700 px-4 py-1.5 text-sm text-paper-50 placeholder:text-mist-400 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            <button
              onClick={addReply}
              disabled={replying || !replyText.trim()}
              className="bg-brand-500 hover:bg-brand-400 disabled:bg-navy-600 disabled:text-mist-300 text-navy-950 rounded-sm px-4 py-1.5 text-sm font-medium transition-colors"
            >
              Senden
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PostCard({
  post,
  currentPlayerId,
  // Roadmap 37: Damit ein Verein seinen eigenen Beitrag zurücknehmen kann,
  // muss die Karte wissen, welchen Verein ich verwalte. Optional – fehlt der
  // Wert, entfällt nur der Vereins-Fall, der eigene Beitrag bleibt löschbar.
  currentTeamAdminOf,
  onDeleted,
}) {
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
  const [loeschBusy, setLoeschBusy] = useState(false);
  // ⚠️ Die Karte entfernt sich notfalls SELBST aus dem Bild. Grund: `PostCard`
  // wird an fünf Stellen eingebunden, und nur der Feed führt eine Liste, die er
  // nachziehen kann. Ohne diesen Eigenzustand hätte die Funktion auf vier von
  // fünf Flächen stumm nichts getan – genau die Sorte Lücke, die in diesem
  // Projekt regelmäßig als Befund auftaucht.
  const [weg, setWeg] = useState(false);

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

  // ⚠️ EREIGNIS-BEITRÄGE SIND NICHT LÖSCHBAR, und zwar auch nicht vom eigenen
  // Verfasser (Roadmap 37). Ein Spielergebnis ist keine Äußerung, sondern die
  // Anzeige einer belegten Tatsache – die eigentliche Aufzeichnung liegt in
  // `matches`. Ein Löschweg würde den BELEG verstecken, ohne die Tatsache zu
  // ändern, und damit genau die Belegbarkeit aushöhlen, die das Produkt
  // verkauft. Die Serverroute weist es zusätzlich ab; hier fehlt nur der Knopf.
  const eigenerBeitrag =
    !isAuto &&
    !post.authorTeam &&
    currentPlayerId &&
    String(author?._id || author) === String(currentPlayerId);
  const meinVereinsBeitrag =
    !isAuto &&
    post.authorTeam &&
    currentTeamAdminOf &&
    String(post.authorTeam?._id || post.authorTeam) === String(currentTeamAdminOf);
  const darfLoeschen = Boolean(eigenerBeitrag || meinVereinsBeitrag);

  async function beitragLoeschen() {
    if (loeschBusy) return;
    setLoeschBusy(true);
    try {
      await axios.post("/api/posts/deletepost", {
        token: getPlayerToken(),
        postId: post._id,
      });
      onDeleted?.(post._id);
      setWeg(true);
    } catch {
      setLoeschBusy(false);
    }
  }

  if (weg) return null;

  // GLEICHE KACHEL, UNGLEICHES LICHT (Vivien, 22.08.2026 – ersetzt die zwei
  // Ränge aus §3.4 vom 15.08.2026).
  //
  // Die Absicht von damals bleibt richtig und bleibt bestehen: Ein beidseitig
  // bestätigtes 80:94 und „Game Day! Heute zählt's." dürfen nicht dasselbe
  // Gewicht haben. Falsch war nur der TRÄGER dieses Unterschieds. Rang A war
  // eine Kachel, Rang B gar keine – im laufenden Feed gemessen ergab das die
  // Folge Kachel · Kachel · nackt · Kachel · nackt · nackt · nackt · nackt ·
  // Kachel · nackt. Nicht zwei Ränge, sondern ein ausgefranster Rand.
  //
  // ⚠️ Vivien hatte genau das im eigenen Risiko-Register stehen
  // (`docs/NEWSFEED-DESKTOP-2026-08-15.md`, Zeile „Zwei Ränge werden als
  // Abwertung gelesen … Am echten Bild zu prüfen, nicht theoretisch").
  // Befund Patrick am echten Bild, 22.08.2026: „mir gefällt nicht, dass manche
  // Posts runde Kacheln haben und manche nicht."
  //
  // Vereinheitlicht wird deshalb die GEOMETRIE, nicht die Fläche – beide Ränge
  // sind dieselbe Kachel (`rounded-md`, `border-navy-600`, `p-4`), und der Rang
  // trägt sich über die FLÄCHENSTUFE:
  //   Rang A – Ereignis (`kind === "auto"`): das BELEUCHTETE Segment (navy-800).
  //   Rang B – Wort (`kind === "user"`): das unbeleuchtete – ohne eigene
  //     Fläche, der navy-950-Grund scheint durch.
  //
  // Das ist wörtlich der Tiefenmechanismus der visuellen Richtung
  // („Tiefe entsteht aus Flächenstufe + 1px-Haarlinie", keine Schatten,
  // keine Verläufe) und weiterhin ein GEWICHTS-Unterschied, keine Abwertung:
  // Die Textgröße bleibt unverändert.
  //
  // ⚠️ VERWORFEN, mit Begründung, damit es niemand nachträglich „verbessert":
  // eine 2-px-Akzentkante in brand-500 nur bei Ereignissen. Die Signaturleiste
  // ist laut Spezifikation auf GENAU DREI Stellen limitiert; auf jedem zweiten
  // Feed-Element wird die Signatur zur Tapete. Ebenso verworfen: der Rang über
  // die Rahmenfarbe – navy-600 ist die eine Rahmenfarbe, und 1 px Farbunter-
  // schied auf dunklem Grund trägt keinen Rangunterschied.
  const rang = isAuto
    ? "bg-navy-800 rounded-md border border-navy-600 p-4"
    : "rounded-md border border-navy-600 p-4";

  // Der Fokusring braucht den Grund, auf dem er wirklich liegt – auf der
  // unbeleuchteten Kachel ist das navy-950, nicht navy-800. Sonst steht ein
  // heller Ring auf der falschen Fläche.
  const ringGrund = isAuto ? "focus-visible:ring-offset-navy-800" : "focus-visible:ring-offset-navy-950";

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
      {/* ⚠️ DIE INNENLINIE GILT NUR AUF DER BELEUCHTETEN KACHEL (22.08.2026).
          Auf der unbeleuchteten Kachel stehen sonst zwei Haarlinien derselben
          Farbe wenige Pixel übereinander – die Trennlinie und der Kachelrahmen.
          Am Stück Feed angesehen (390 px, drei Wort-Beiträge hintereinander)
          las sich das als leerer Drahtrahmen statt als ruhiger Beitrag.
          Die Korrektur ist WENIGER LINIE, nicht mehr Fläche: Eine zweite
          Flächenstufe für Rang B gäbe es im System nicht (navy-900 ist die
          Rolle der Navigationsleiste), und sie würde genau den Rangunterschied
          wieder einebnen, um den es hier geht.
          Auf der beleuchteten Kachel bleibt die Linie – dort trennt sie Inhalt
          von Aktion INNERHALB einer gefüllten Fläche und hat keinen Rahmen
          direkt daneben. */}
      <div
        className={`mt-3 flex items-center gap-5 text-sm text-mist-400 ${
          isAuto ? "border-t border-navy-600 pt-3" : "pt-1"
        }`}
      >
        <button
          onClick={toggleLike}
          aria-pressed={liked}
          className={`inline-flex items-center gap-1.5 -my-1.5 -mx-2 px-2 py-1.5 rounded-sm transition-colors hover:bg-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 ${ringGrund} ${
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
          className={`inline-flex items-center gap-1.5 -my-1.5 -mx-2 px-2 py-1.5 rounded-sm transition-colors hover:bg-navy-700 hover:text-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 ${ringGrund}`}
        >
          <PiChatCircleBold aria-hidden="true" />{" "}
          <span className="sr-only">Kommentare: </span>
          {commentTotal}
        </button>

        {/* ⚠️ `ml-auto` und nicht ein weiterer Platz in der `gap-5`-Reihe:
            Der Löschknopf soll NICHT neben den Like-Knopf rutschen. Die beiden
            linken Knöpfe sind das, was man oft tut; dieser ist das, was man
            selten tut und nie versehentlich. Der Abstand ist die Sicherung.
            Er trägt denselben negativen Außenabstand wie die anderen, damit die
            Aktionszeile ihre Höhe behält (bewacht in
            `tests/e2e/newsfeed-mobil.spec.mjs`: Zeile ≤ 34 px, Karte ≤ 160). */}
        {darfLoeschen && (
          <div className="ml-auto">
            <LoeschKnopf
              was="Beitrag"
              hinweis={
                commentTotal
                  ? `Diesen Beitrag löschen? Die ${commentTotal} Kommentar${
                      commentTotal === 1 ? "" : "e"
                    } darunter verschwinden mit.`
                  : "Diesen Beitrag löschen?"
              }
              busy={loeschBusy}
              onConfirm={beitragLoeschen}
            />
          </div>
        )}
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
              onDeleted={(id) =>
                setComments((liste) => liste.filter((x) => String(x._id) !== String(id)))
              }
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
              className="w-full rounded-sm border border-navy-600 bg-navy-700 px-4 py-2 text-sm text-paper-50 placeholder:text-mist-400 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            <button
              onClick={addComment}
              disabled={commenting || !commentText.trim()}
              className="bg-brand-500 hover:bg-brand-400 disabled:bg-navy-600 disabled:text-mist-300 text-navy-950 rounded-sm px-4 py-2 text-sm font-medium transition-colors"
            >
              Senden
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
