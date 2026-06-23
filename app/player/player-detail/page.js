"use client";

import Link from "next/link";
import { FaBasketballBall, FaPen } from "react-icons/fa";
import { useCurrentPlayer } from "@/lib/useCurrentPlayer";
import PlayerNav from "@/components/layout/PlayerNav";
import PlayerProfileView from "@/components/player/PlayerProfileView";
import TransferControl from "@/components/player/TransferControl";

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

  return (
    <div className="min-h-screen bg-gray-50">
      <PlayerNav player={player} />

      <PlayerProfileView
        player={player}
        viewerId={player?._id}
        actions={
          <>
            <Link
              href="/player/edit-profile"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              <FaPen className="text-xs" /> Profil bearbeiten
            </Link>
            <Link
              href="/player/update-password"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              Passwort
            </Link>
          </>
        }
      />

      {/* Eigentümer-Extra: Transfermarkt-Status */}
      <div className="max-w-4xl mx-auto px-4 pb-10 -mt-2">
        <TransferControl player={player} />
      </div>
    </div>
  );
}
