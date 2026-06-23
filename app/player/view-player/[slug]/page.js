"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  FaBasketballBall,
  FaInstagram,
  FaExternalLinkAlt,
} from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CareerStats from "@/components/player/CareerStats";
import ProfileHero from "@/components/player/ProfileHero";
import FollowButton from "@/components/FollowButton";
import FollowList from "@/components/player/FollowList";
import PlayerPosts from "@/components/posts/PlayerPosts";
import { getStoredPlayer } from "@/lib/clientAuth";

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}

export default function PlayerViewPlayerSlugPage({ params }) {
  const slug = params.slug;
  const [player, setPlayer] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | notfound
  const [viewerId, setViewerId] = useState(null);

  useEffect(() => {
    // Eigene ID (clientseitig) ermitteln, um den Folgen-Button bei sich selbst auszublenden
    const stored = getStoredPlayer();
    setViewerId(stored?._id || stored?.id || null);

    let active = true;
    (async () => {
      try {
        const { data } = await axios.post("/api/player/fetchsingleplayerinfo", { slug });
        if (active) {
          setPlayer(data.player);
          setState("ready");
        }
      } catch {
        if (active) setState("notfound");
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  if (state === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <FaBasketballBall className="text-brand-500 text-3xl animate-bounce" />
      </main>
    );
  }

  if (state === "notfound") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900">Spieler nicht gefunden</h1>
          <Link href="/spieler" className="mt-4 text-brand-600 hover:underline">
            Zurück zur Spielerübersicht
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <ProfileHero
        player={player}
        actions={
          <>
            {viewerId !== String(player._id) && (
              <FollowButton type="player" targetId={player._id} />
            )}
            {player.instagram && (
              <a
                href={`https://instagram.com/${player.instagram.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                <FaInstagram /> Instagram
              </a>
            )}
          </>
        }
      />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Follower / Folgt */}
        <div>
          <FollowList playerId={player._id} />
        </div>

        {/* Karriere-Statistik */}
        <div className="mt-6">
          <CareerStats playerId={player._id} />
        </div>

        {/* Über mich */}
        {player.aboutPlayer && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Über</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line">{player.aboutPlayer}</p>
          </div>
        )}

        {/* Steckbrief */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Steckbrief</h2>
          <InfoRow label="Größe" value={player.height} />
          <InfoRow label="Gewicht" value={player.weight} />
          <InfoRow label="Alter" value={player.age} />
          <InfoRow label="Nationalität" value={player.nationality} />
          <InfoRow label="Land" value={player.country} />
          <InfoRow label="Heimatstadt" value={player.hometown} />
          <InfoRow label="Bevorzugte Liga" value={player.preferredLeague} />
          {player.fibaLink && (
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-500">FIBA-Profil</span>
              <a
                href={player.fibaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-brand-600 inline-flex items-center gap-1"
              >
                Öffnen <FaExternalLinkAlt className="text-xs" />
              </a>
            </div>
          )}
        </div>

        {/* Beiträge des Spielers */}
        <div className="mt-6">
          <PlayerPosts playerId={player._id} currentPlayerId={viewerId} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
