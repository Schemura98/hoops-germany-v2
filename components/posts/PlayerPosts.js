"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { PiBasketballBold } from "react-icons/pi";
import PostCard from "@/components/posts/PostCard";

// Zeigt die Beiträge eines Spielers (für Profilseiten).
export default function PlayerPosts({ playerId, currentPlayerId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerId) {
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      try {
        const { data } = await axios.post("/api/player/fetchposts", { playerId });
        if (active) setPosts(data.posts || []);
      } catch {
        if (active) setPosts([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [playerId]);

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-paper-50">Beiträge</h2>

      {loading ? (
        <div className="flex justify-center py-6">
          <PiBasketballBold className="text-brand-400 text-2xl animate-bounce" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-ink-800 rounded-md border border-ink-600 p-6 text-center">
          <p className="text-sm text-mist-400">Noch keine Beiträge.</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard key={post._id} post={post} currentPlayerId={currentPlayerId} />
        ))
      )}
    </div>
  );
}
