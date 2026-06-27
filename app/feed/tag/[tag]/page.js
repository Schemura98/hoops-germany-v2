"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { FaArrowLeft, FaHashtag, FaNewspaper } from "react-icons/fa";
import { useCurrentPlayer } from "@/lib/useCurrentPlayer";
import PlayerNav from "@/components/layout/PlayerNav";
import PostCard from "@/components/posts/PostCard";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";

// Hashtag-Feed: alle Beiträge mit einem #Tag.
export default function HashtagFeedPage() {
  const { tag } = useParams();
  const decodedTag = decodeURIComponent(tag || "");
  const { player } = useCurrentPlayer();
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await axios.post("/api/posts/by-tag", { tag: decodedTag });
        if (!active) return;
        setPosts(data.posts || []);
        setHasMore(!!data.hasMore);
        setStatus("ready");
      } catch {
        if (active) setStatus("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [decodedTag]);

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const before = posts[posts.length - 1]?.createdAt;
      const { data } = await axios.post("/api/posts/by-tag", { tag: decodedTag, before });
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p._id));
        return [...prev, ...(data.posts || []).filter((p) => !seen.has(p._id))];
      });
      setHasMore(!!data.hasMore);
    } catch {
      /* belassen */
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PlayerNav player={player} />
      <div className="max-w-xl mx-auto px-4 py-8">
        <Link
          href="/player/newsfeed"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-4"
        >
          <FaArrowLeft /> Zum Feed
        </Link>

        <h1 className="flex items-center gap-2 text-2xl font-black text-gray-900 mb-5">
          <FaHashtag className="text-brand-500" />
          {decodedTag}
        </h1>

        {status === "loading" ? (
          <Loading className="py-10" />
        ) : status === "error" ? (
          <EmptyState icon={FaNewspaper} title="Konnte nicht geladen werden" />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={FaHashtag}
            title="Noch keine Beiträge"
            text={`Sei der Erste, der #${decodedTag} verwendet.`}
          />
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} currentPlayerId={player?._id} />
            ))}
            {hasMore && (
              <div className="flex justify-center py-2">
                <Button variant="ghost" size="sm" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? "Lädt…" : "Mehr laden"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
