"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaBasketballBall, FaTrophy, FaExchangeAlt, FaNewspaper } from "react-icons/fa";
import { useCurrentPlayer } from "@/lib/useCurrentPlayer";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { getPlayerToken } from "@/lib/clientAuth";
import PlayerNav from "@/components/layout/PlayerNav";
import PostComposer from "@/components/posts/PostComposer";
import PostCard from "@/components/posts/PostCard";
import TeamMatchesWidget from "@/components/feed/TeamMatchesWidget";
import TopTeamsWidget from "@/components/feed/TopTeamsWidget";
import TransferFeedWidget from "@/components/feed/TransferFeedWidget";
import CollapsibleWidget from "@/components/feed/CollapsibleWidget";
import NewsWidget from "@/components/NewsWidget";
import OnboardingChecklist from "@/components/onboarding/OnboardingChecklist";

const TABS = [
  { key: "discover", label: "Entdecken" },
  { key: "following", label: "Folge ich" },
];

export default function PlayerNewsfeedPage() {
  const { player, status } = useCurrentPlayer();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [posts, setPosts] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [mode, setMode] = useState("discover");

  const feedUrl = (which) =>
    which === "following" ? "/api/player/getfollowingposts" : "/api/posts/feed";

  const loadFeed = useCallback(async (which) => {
    setFeedLoading(true);
    setHasMore(false);
    try {
      const token = getPlayerToken();
      const { data } = await axios.post(feedUrl(which), { token });
      setPosts(data.posts || []);
      setHasMore(!!data.hasMore);
    } catch {
      setPosts([]);
      setHasMore(false);
    } finally {
      setFeedLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed(mode);
  }, [mode, loadFeed]);

  // Ältere Beiträge nachladen (Cursor = createdAt des ältesten geladenen Posts).
  const loadingMoreRef = useRef(false);
  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const token = getPlayerToken();
      const before = posts[posts.length - 1]?.createdAt;
      const { data } = await axios.post(feedUrl(mode), { token, before });
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p._id));
        const fresh = (data.posts || []).filter((p) => !seen.has(p._id));
        return [...prev, ...fresh];
      });
      setHasMore(!!data.hasMore);
    } catch {
      /* Bestand belassen */
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, mode, posts]);

  // Infinite Scroll: nachladen, sobald der Sentinel sichtbar wird.
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!hasMore || feedLoading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, feedLoading, loadMore]);

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
        <OnboardingChecklist player={player} />
        {(() => {
          const composer = <PostComposer player={player} onCreated={handleCreated} />;
          const feed = (
            <>
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
              <>
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} currentPlayerId={player?._id} />
                ))}

                {hasMore ? (
                  <div ref={sentinelRef} className="flex justify-center py-2">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 disabled:opacity-60"
                    >
                      {loadingMore ? (
                        <>
                          <FaBasketballBall className="animate-bounce" /> Lädt…
                        </>
                      ) : (
                        "Mehr laden"
                      )}
                    </button>
                  </div>
                ) : (
                  <p className="text-center text-xs text-gray-400 py-2">
                    Das war alles.
                  </p>
                )}
              </>
            )}
            </>
          );

          if (isDesktop) {
            return (
              <div className="grid lg:grid-cols-[260px_minmax(0,1fr)_300px] gap-6 items-start">
                {/* Linke Leiste: Spiele von eigenem/gefolgten Teams */}
                <aside className="space-y-4 lg:sticky lg:top-24">
                  <TeamMatchesWidget />
                  <TopTeamsWidget />
                </aside>

                {/* Mitte: Composer + Feed */}
                <main className="space-y-6 min-w-0">
                  {composer}
                  {feed}
                </main>

                {/* Rechte Leiste: News (Sponsorfläche folgt mit #6) */}
                <aside className="space-y-4 lg:sticky lg:top-24">
                  <TransferFeedWidget />
                  <NewsWidget compact />
                </aside>
              </div>
            );
          }

          // Mobil: Widgets als einklappbare Akkordeons über dem Feed,
          // damit sie nicht hinter dem Infinite-Scroll-Feed verschwinden.
          return (
            <div className="space-y-6">
              {composer}
              <div className="space-y-3">
                <CollapsibleWidget
                  icon={<FaBasketballBall className="text-brand-500" />}
                  title="Spiele"
                  defaultOpen
                >
                  <TeamMatchesWidget />
                </CollapsibleWidget>
                <CollapsibleWidget
                  icon={<FaTrophy className="text-brand-500" />}
                  title="Top-Teams"
                >
                  <TopTeamsWidget />
                </CollapsibleWidget>
                <CollapsibleWidget
                  icon={<FaExchangeAlt className="text-brand-500" />}
                  title="Transfers"
                >
                  <TransferFeedWidget />
                </CollapsibleWidget>
                <CollapsibleWidget
                  icon={<FaNewspaper className="text-brand-500" />}
                  title="Basketball-News"
                >
                  <NewsWidget compact />
                </CollapsibleWidget>
              </div>
              {feed}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
