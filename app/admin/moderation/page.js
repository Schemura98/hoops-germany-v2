"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { PiTrashBold, PiHeartBold, PiChatCircleBold } from "react-icons/pi";
import AdminShell from "@/components/layout/AdminShell";
import { getAdminToken } from "@/lib/clientAuth";
import { timeAgo } from "@/lib/timeAgo";
import Avatar from "@/components/posts/Avatar";

export default function AdminModerationPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.post("/api/posts/feed", {});
        setPosts(data.posts || []);
      } catch {
        /* ignorieren */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function remove(id) {
    if (!window.confirm("Diesen Beitrag wirklich löschen?")) return;
    setBusyId(id);
    try {
      const token = getAdminToken();
      await axios.post("/api/admin/deletepost", { token, postId: id });
      setPosts((p) => p.filter((x) => x._id !== id));
    } catch {
      /* ignorieren */
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminShell title="Moderation">
      <p className="text-sm text-mist-400 -mt-4 mb-6">Neueste Beiträge der Community.</p>

      {loading ? (
        <p className="text-mist-400">Lädt…</p>
      ) : posts.length === 0 ? (
        <p className="text-mist-400">Keine Beiträge vorhanden.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const a = post.player;
            return (
              <div
                key={post._id}
                className="bg-ink-800 rounded-md border border-ink-600 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar player={a} className="h-9 w-9" />
                    <div className="min-w-0">
                      <Link
                        href={a?.slug || a?._id ? `/player/view-player/${a.slug || a._id}` : "#"}
                        className="text-sm font-medium text-paper-50 hover:text-brand-400"
                      >
                        {a?.firstName} {a?.lastName}
                      </Link>
                      <p className="text-xs text-mist-400">{timeAgo(post.createdAt)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(post._id)}
                    disabled={busyId === post._id}
                    className="text-mist-400 hover:text-signal-error disabled:opacity-60 p-1.5 flex-shrink-0"
                    title="Beitrag löschen"
                  >
                    <PiTrashBold />
                  </button>
                </div>

                {post.content && (
                  <p className="mt-2 text-sm text-paper-50 whitespace-pre-line">{post.content}</p>
                )}
                {post.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.image}
                    alt=""
                    className="mt-2 rounded-md max-h-60 w-full object-cover"
                  />
                )}

                <div className="mt-3 flex items-center gap-5 text-xs text-mist-400">
                  <span className="inline-flex items-center gap-1">
                    <PiHeartBold /> {(post.likes || []).length}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <PiChatCircleBold /> {(post.comments || []).length}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
