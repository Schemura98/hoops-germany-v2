"use client";

import { PiPencilSimpleBold } from "react-icons/pi";
import { useCurrentPlayer } from "@/lib/useCurrentPlayer";
import PlayerNav from "@/components/layout/PlayerNav";
import Footer from "@/components/layout/Footer";
import PlayerProfileView from "@/components/player/PlayerProfileView";
import TransferControl from "@/components/player/TransferControl";
import Loading from "@/components/ui/Loading";
import Button from "@/components/ui/Button";

export default function PlayerPlayerDetailPage() {
  const { player, status } = useCurrentPlayer();

  if (status === "loading") {
    return (
      <main id="hauptinhalt" tabIndex={-1} className="min-h-screen flex items-center justify-center">
        <Loading />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main id="hauptinhalt" tabIndex={-1} className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <p className="text-mist-300">Profil konnte nicht geladen werden.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Erneut versuchen
        </Button>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950">
      <PlayerNav player={player} />

      <PlayerProfileView
        player={player}
        viewerId={player?._id}
        actions={
          <>
            <Button href="/player/edit-profile">
              <PiPencilSimpleBold className="text-xs" /> Profil bearbeiten
            </Button>
            <Button
              href="/player/update-password"
              variant="ghost"
              className="!bg-navy-800/10 hover:!bg-navy-800/20 !text-paper-50"
            >
              Passwort
            </Button>
          </>
        }
      />

      {/* Eigentümer-Extra: Transfermarkt-Status */}
      <div className="max-w-4xl mx-auto px-4 pb-10 -mt-2">
        <TransferControl player={player} />
      </div>

      <Footer />
    </div>
  );
}
