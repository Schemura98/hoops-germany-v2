"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FaBasketballBall } from "react-icons/fa";
import { useCurrentPlayer } from "@/lib/useCurrentPlayer";
import { getPlayerToken } from "@/lib/clientAuth";
import PlayerNav from "@/components/layout/PlayerNav";
import PostComposer from "@/components/posts/PostComposer";
import PostCard from "@/components/posts/PostCard";
import TeamMatchesWidget from "@/components/feed/TeamMatchesWidget";
import NewsWidget from "@/components/NewsWidget";

const TABS = [
  { key: "discover", label: "Entdecken" },
  { key: "following", label: "Folge ich" },
];

export default function PlayerNewsfeedPage() {
  const { player, status } = useCurrentPlayer();
  const [posts, setPosts] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [mode, setMode] = useState("discover");

  const loadFeed = useCallback(async (which) => {
    setFeedLoading(true);
    try {
      const token = getPlayerToken();
      const url =
        which === "following"
          ? "/api/player/getfollowingposts"
          : "/api/posts/feed";
      const { data } = await axios.post(url, { token });
      setPosts(data.posts || []);
    } catch {
      setPosts([]);
    } finally {
      setFeedLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed(mode);
  }, [mode, loadFeed]);

  function handleCreated(post) {
    setPosts((p) => [post, ...p]);
  }

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <FaBasketballBall className="text-brand-500 text-3xl animate-bounce" />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <p className="text-gray-700">Profil konnte nicht geladen werden.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 font-medium"
        >
          Erneut versuchen
        </button>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PlayerNav player={player} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[260px_minmax(0,1fr)_300px] gap-6 items-start">
          {/* Linke Leiste: Spiele von eigenem/gefolgten Teams */}
          <aside className="space-y-4 order-2 lg:order-1 lg:sticky lg:top-24">
            <TeamMatchesWidget />
          </aside>

          {/* Mitte: Composer + Feed */}
          <main className="order-1 lg:order-2 space-y-6 min-w-0">
            <PostComposer player={player} onCreated={handleCreated} />

            {/* Feed-Umschaltung */}
            <div className="flex gap-1 border-b border-gray-200">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setMode(t.key)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    mode === t.key
                      ? "border-brand-500 text-brand-600"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {feedLoading ? (
              <div className="flex justify-center py-10">
                <FaBasketballBall className="text-brand-500 text-2xl animate-bounce" />
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                <p className="text-gray-400 text-sm">
                  {mode === "following"
                    ? "Du folgst noch niemandem – oder es gibt noch keine Beiträge. Entdecke Spieler und folge ihnen!"
                    : "Noch keine Beiträge. Sei der Erste und teile etwas mit der Community!"}
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post._id} post={post} currentPlayerId={player?._id} />
              ))
            )}
          </main>

          {/* Rechte Leiste: News (Sponsorfläche folgt mit #6) */}
          <aside className="space-y-4 order-3 lg:sticky lg:top-24">
            <NewsWidget compact />
          </aside>
        </div>
      </div>
    </div>
  );
}
