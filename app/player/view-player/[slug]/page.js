"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { PiBasketballBold } from "react-icons/pi";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PlayerProfileView from "@/components/player/PlayerProfileView";
import Loading from "@/components/ui/Loading";
import FollowButton from "@/components/FollowButton";
import { getStoredPlayer } from "@/lib/clientAuth";

export default function PlayerViewPlayerSlugPage({ params }) {
  const slug = params.slug;
  const [player, setPlayer] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | notfound
  const [viewerId, setViewerId] = useState(null);

  useEffect(() => {
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
    // Ladezustand MIT stehender Navigationsleiste: Vorher ersetzte der Spinner
    // die ganze Seite inklusive Chrome – beim Wechsel „blinkte" die Leiste
    // (Befund Vivien B6, 23.08.2026; Muster der Team-Detailseite).
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col">
        <Navbar />
        <main id="hauptinhalt" tabIndex={-1} className="flex-1 flex items-center justify-center">
          <Loading />
        </main>
      </div>
    );
  }

  if (state === "notfound") {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col">
        <Navbar />
        <main id="hauptinhalt" tabIndex={-1} className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-xl font-bold text-paper-50">Spieler nicht gefunden</h1>
          <Link href="/spieler" className="mt-4 text-brand-400 hover:underline">
            Zurück zur Spielerübersicht
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PlayerProfileView
          player={player}
          viewerId={viewerId}
          actions={
            viewerId !== String(player._id) ? (
              <FollowButton
                type="player"
                targetId={player._id}
                onCountChange={(count) =>
                  typeof count === "number" &&
                  setPlayer((p) => ({ ...p, followersCount: count }))
                }
              />
            ) : null
          }
        />
      </div>
      <Footer />
    </div>
  );
}
