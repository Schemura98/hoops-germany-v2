"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { FaArrowLeft, FaNewspaper } from "react-icons/fa";
import { useCurrentPlayer } from "@/lib/useCurrentPlayer";
import PlayerNav from "@/components/layout/PlayerNav";
import PostCard from "@/components/posts/PostCard";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";

// Permalink-Ansicht eines einzelnen Beitrags – Ziel der Like-/Kommentar-Benachrichtigungen
// und teilbare URL.
export default function PostDetailPage() {
  const { id } = useParams();
  const { player } = useCurrentPlayer();
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await axios.post("/api/posts/single", { postId: id });
        if (active) {
          setPost(data.post);
          setStatus("ready");
        }
      } catch {
        if (active) setStatus("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

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

        {status === "loading" ? (
          <Loading className="py-10" />
        ) : status === "error" || !post ? (
          <EmptyState
            icon={FaNewspaper}
            title="Beitrag nicht gefunden"
            text="Dieser Beitrag existiert nicht mehr oder wurde entfernt."
          />
        ) : (
          <PostCard post={post} currentPlayerId={player?._id} />
        )}
      </div>
    </div>
  );
}
