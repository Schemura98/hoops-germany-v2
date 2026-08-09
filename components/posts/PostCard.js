"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  FaRegHeart,
  FaHeart,
  FaRegComment,
  FaBasketballBall,
  FaExchangeAlt,
  FaUsers,
  FaBullhorn,
  FaSearch,
  FaUserPlus,
} from "react-icons/fa";
import { getPlayerToken } from "@/lib/clientAuth";
import { timeAgo } from "@/lib/timeAgo";
import Avatar from "./Avatar";
import BaseAvatar from "@/components/Avatar";
import RichText from "./RichText";
import PostEmbed from "./PostEmbed";
import MentionTextarea from "./MentionTextarea";

// Darstellung der automatischen Ereignis-Beiträge (Icon + Badge je Typ).
const AUTO = {
  match_result: { Icon: FaBasketballBall, label: "Spielergebnis", color: "bg-brand-100 text-brand-600" },
  transfer: { Icon: FaExchangeAlt, label: "Transfer", color: "bg-blue-100 text-blue-600" },
  team_founded: { Icon: FaUsers, label: "Neues Team", color: "bg-green-100 text-green-600" },
  tryout: { Icon: FaBullhorn, label: "Tryout", color: "bg-purple-100 text-purple-600" },
  recruiting: { Icon: FaSearch, label: "Spieler gesucht", color: "bg-indigo-100 text-indigo-600" },
  transfer_available: { Icon: FaUserPlus, label: "Auf Vereinssuche", color: "bg-teal-100 text-teal-600" },
};
const AUTO_FALLBACK = { Icon: FaBasketballBall, label: "Update", color: "bg-gray-100 text-gray-600" };

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
        liked ? "text-brand-600" : "text-gray-500 hover:text-brand-600"
      }`}
    >
      {liked ? <FaHeart /> : <FaRegHeart />}
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
        <div className="bg-gray-50 rounded-2xl px-3 py-2">
          <Link
            href={authorLink(reply.player)}
            className="text-sm font-medium text-gray-900 hover:text-brand-600"
          >
            {reply.player?.firstName} {reply.player?.lastName}
          </Link>
          <p className="text-sm text-gray-700 whitespace-pre-line break-words">
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
        <div className="bg-gray-50 rounded-2xl px-3 py-2">
          <Link
            href={authorLink(comment.player)}
            className="text-sm font-medium text-gray-900 hover:text-brand-600"
          >
            {comment.player?.firstName} {comment.player?.lastName}
          </Link>
          <p className="text-sm text-gray-700 whitespace-pre-line break-words">
            <RichText text={comment.text} mentions={comment.mentions} />
          </p>
        </div>

        {/* Aktionen */}
        <div className="mt-1 pl-3 flex items-center gap-4">
          <LikeButton liked={liked} count={likeCount} busy={likeBusy} onToggle={toggleLike} />
          <button
            onClick={() => setShowReply((v) => !v)}
            className="text-xs font-medium text-gray-500 hover:text-brand-600"
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
              className="w-full rounded-full border border-gray-200 px-4 py-1.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            <button
              onClick={addReply}
              disabled={replying || !replyText.trim()}
              className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-full px-4 py-1.5 text-sm font-medium"
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
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
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {auto.label}
              </span>
              <p className="text-xs text-gray-500">{timeAgo(post.createdAt)}</p>
            </div>
          </div>

          {/* Inhalt (verlinkt aufs Ereignis) */}
          {post.meta?.href ? (
            <Link href={post.meta.href} className="block mt-3 group">
              <p className="font-semibold text-gray-900 group-hover:text-brand-600">
                {post.content}
              </p>
              {post.meta?.note && (
                <p className="text-xs text-gray-500 mt-0.5">{post.meta.note}</p>
              )}
            </Link>
          ) : (
            <div className="mt-3">
              <p className="font-semibold text-gray-900">{post.content}</p>
              {post.meta?.note && (
                <p className="text-xs text-gray-500 mt-0.5">{post.meta.note}</p>
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
                  className="font-medium text-gray-900 hover:text-brand-600"
                >
                  {teamAuthor.teamName}
                </Link>
                <p className="text-xs text-gray-500">
                  <span className="text-brand-600 font-medium">Verein</span> ·{" "}
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
                  className="font-medium text-gray-900 hover:text-brand-600"
                >
                  {author?.firstName} {author?.lastName}
                </Link>
                <p className="text-xs text-gray-500">{timeAgo(post.createdAt)}</p>
              </div>
            </div>
          )}

          {/* Inhalt */}
          {post.content && (
            <p className="mt-3 text-gray-800 whitespace-pre-line">
              <RichText text={post.content} mentions={post.mentions} />
            </p>
          )}
          {post.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.image}
              alt=""
              className="mt-3 rounded-xl max-h-96 w-full object-cover"
            />
          )}
          <PostEmbed embed={post.embed} />
        </>
      )}

      {/* Aktionen */}
      <div className="mt-3 flex items-center gap-5 text-sm text-gray-500 border-t border-gray-100 pt-3">
        <button
          onClick={toggleLike}
          className={`inline-flex items-center gap-1.5 ${
            liked ? "text-brand-600" : "hover:text-brand-600"
          }`}
        >
          {liked ? <FaHeart /> : <FaRegHeart />} {likeCount}
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="inline-flex items-center gap-1.5 hover:text-brand-600"
        >
          <FaRegComment /> {commentTotal}
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
              className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            <button
              onClick={addComment}
              disabled={commenting || !commentText.trim()}
              className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-full px-4 py-2 text-sm font-medium"
            >
              Senden
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
