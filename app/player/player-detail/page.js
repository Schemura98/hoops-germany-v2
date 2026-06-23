"use client";

import Link from "next/link";
import {
  FaBasketballBall,
  FaInstagram,
  FaExternalLinkAlt,
  FaPen,
} from "react-icons/fa";
import { useCurrentPlayer } from "@/lib/useCurrentPlayer";
import PlayerNav from "@/components/layout/PlayerNav";
import CareerStats from "@/components/player/CareerStats";
import TransferControl from "@/components/player/TransferControl";
import FollowList from "@/components/player/FollowList";
import PlayerPosts from "@/components/posts/PlayerPosts";

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}

export default function PlayerPlayerDetailPage() {
  const { player, status } = useCurrentPlayer();

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

  const initials =
    `${player?.firstName?.[0] || ""}${player?.lastName?.[0] || ""}`.toUpperCase() ||
    "?";

  return (
    <div className="min-h-screen bg-gray-50">
      <PlayerNav player={player} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Kopf */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            {player?.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={player.profileImage}
                alt={initials}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <span className="h-20 w-20 rounded-full bg-brand-100 text-brand-700 text-2xl font-bold flex items-center justify-center">
                {initials}
              </span>
            )}
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 truncate">
                {player?.firstName} {player?.lastName}
              </h1>
              <p className="text-sm text-gray-500">
                {player?.position || "Position nicht angegeben"}
                {player?.nationality ? ` · ${player.nationality}` : ""}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Link
              href="/player/edit-profile"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              <FaPen className="text-xs" /> Profil bearbeiten
            </Link>
            {player?.instagram && (
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

          <div className="mt-3">
            <Link
              href="/player/update-password"
              className="text-sm text-gray-500 hover:text-brand-600"
            >
              Passwort ändern
            </Link>
          </div>
        </div>

        {/* Follower / Folgt */}
        <div className="mt-6">
          <FollowList playerId={player?._id} />
        </div>

        {/* Karriere-Statistik */}
        <div className="mt-6">
          <CareerStats playerId={player?._id} />
        </div>

        {/* Transfermarkt */}
        <div className="mt-6">
          <TransferControl player={player} />
        </div>

        {/* Über mich */}
        {player?.aboutPlayer && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Über mich</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {player.aboutPlayer}
            </p>
          </div>
        )}

        {/* Details */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Steckbrief</h2>
          <InfoRow label="Größe" value={player?.height} />
          <InfoRow label="Gewicht" value={player?.weight} />
          <InfoRow label="Alter" value={player?.age} />
          <InfoRow label="Geburtsdatum" value={player?.birthdate} />
          <InfoRow label="Nationalität" value={player?.nationality} />
          <InfoRow label="Land" value={player?.country} />
          <InfoRow label="Heimatstadt" value={player?.hometown} />
          <InfoRow label="Bevorzugte Liga" value={player?.preferredLeague} />
          {player?.fibaLink && (
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

        {/* Eigene Beiträge */}
        <div className="mt-6">
          <PlayerPosts playerId={player?._id} currentPlayerId={player?._id} />
        </div>
      </main>
    </div>
  );
}
