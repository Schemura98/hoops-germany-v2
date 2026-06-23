"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaRegHeart, FaHeart, FaRegComment } from "react-icons/fa";
import { getPlayerToken } from "@/lib/clientAuth";
import { timeAgo } from "@/lib/timeAgo";
import Avatar from "./Avatar";

function authorLink(player) {
  return player?.slug || player?._id
    ? `/player/view-player/${player.slug || player._id}`
    : "#";
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      {/* Kopf */}
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
          <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
        </div>
      </div>

      {/* Inhalt */}
      {post.content && (
        <p className="mt-3 text-gray-800 whitespace-pre-line">{post.content}</p>
      )}
      {post.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.image}
          alt=""
          className="mt-3 rounded-xl max-h-96 w-full object-cover"
        />
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
          <FaRegComment /> {comments.length}
        </button>
      </div>

      {/* Kommentare */}
      {showComments && (
        <div className="mt-3 space-y-3">
          {comments.map((c) => (
            <div key={c._id} className="flex gap-2">
              <Link href={authorLink(c.player)}>
                <Avatar player={c.player} className="h-8 w-8" />
              </Link>
              <div className="bg-gray-50 rounded-2xl px-3 py-2 flex-1">
                <Link
                  href={authorLink(c.player)}
                  className="text-sm font-medium text-gray-900 hover:text-brand-600"
                >
                  {c.player?.firstName} {c.player?.lastName}
                </Link>
                <p className="text-sm text-gray-700">{c.text}</p>
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addComment()}
              placeholder="Kommentieren…"
              className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
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
