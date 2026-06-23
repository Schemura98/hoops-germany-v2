"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  FaBasketballBall,
  FaUsers,
  FaInstagram,
  FaExternalLinkAlt,
} from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CareerStats from "@/components/player/CareerStats";
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

  const initials =
    `${player.firstName?.[0] || ""}${player.lastName?.[0] || ""}`.toUpperCase();
  const team = player.teamId;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Kopf */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            {player.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={player.profileImage}
                alt={initials}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <span className="h-20 w-20 rounded-full bg-brand-100 text-brand-700 text-2xl font-bold flex items-center justify-center">
                {initials || "?"}
              </span>
            )}
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 truncate">
                {player.firstName} {player.lastName}
              </h1>
              <p className="text-sm text-gray-500">
                {player.position || "Position nicht angegeben"}
                {player.nationality ? ` · ${player.nationality}` : ""}
              </p>
              {player.transferStatus === "verfuegbar" && (
                <span className="mt-1 inline-block text-xs font-medium bg-green-100 text-green-700 rounded-full px-2 py-0.5">
                  Transferbereit
                </span>
              )}
            </div>
          </div>

          {/* Folgen + Team + Socials */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {viewerId !== String(player._id) && (
              <FollowButton type="player" targetId={player._id} />
            )}
            {team && (
              <Link
                href={`/team/team-detail/${team.slug}`}
                className="inline-flex items-center gap-2 border border-gray-300 hover:border-brand-500 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium"
              >
                {team.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={team.logo} alt="" className="h-5 w-5 rounded-full object-cover" />
                ) : (
                  <FaUsers className="text-brand-500" />
                )}
                {team.teamName}
              </Link>
            )}
            {player.instagram && (
              <a
                href={`https://instagram.com/${player.instagram.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-gray-300 hover:border-brand-500 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium"
              >
                <FaInstagram /> Instagram
              </a>
            )}
          </div>
        </div>

        {/* Follower / Folgt */}
        <div className="mt-6">
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
