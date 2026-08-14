"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { PiArrowsLeftRightBold } from "react-icons/pi";
import { getPlayerToken } from "@/lib/clientAuth";
import Avatar from "@/components/Avatar";
import { timeAgo } from "@/lib/timeAgo";

function playerLink(p) {
  return p?.slug || p?._id ? `/player/view-player/${p.slug || p._id}` : "#";
}
function teamLink(t) {
  return t?.slug ? `/team/team-detail/${t.slug}` : "#";
}

function TeamTag({ team }) {
  if (!team) return null;
  return (
    <Link href={teamLink(team)} className="font-medium text-mist-300 hover:text-brand-400">
      {team.teamName}
    </Link>
  );
}

// Beschreibt den Transfer als Satzfragment je nach Typ.
function TransferText({ t }) {
  switch (t.type) {
    case "found":
      return (
        <>
          hat <TeamTag team={t.toTeam} /> gegründet
        </>
      );
    case "move":
      return (
        <>
          wechselte von <TeamTag team={t.fromTeam} /> zu <TeamTag team={t.toTeam} />
        </>
      );
    case "leave":
      // ⚠️ Muss mit `transferMessage` in lib/recordTransfer.js gleichlauten.
      // Dieses Widget baut den Satz aus den Rohdaten selbst – als der Wortlaut
      // dort am 14.08.2026 geändert wurde, blieb er hier stehen, und auf
      // /player/newsfeed standen zwei verschiedene Sätze über dasselbe
      // Ereignis (Befund Kai B2). Ausgelöst wird `leave` von
      // `app/api/team/remove-member/route.js` – also genau vom Fall „ein
      // Team-Admin hat ihn entfernt". „hat verlassen" behauptete dort eine
      // Handlung des Spielers, die es nie gab.
      return (
        <>
          steht nicht mehr im Kader von <TeamTag team={t.fromTeam} />
        </>
      );
    case "join":
    default:
      return (
        <>
          ist <TeamTag team={t.toTeam} /> beigetreten
        </>
      );
  }
}

export default function TransferFeedWidget() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const token = getPlayerToken();
        const { data } = await axios.post("/api/player/transfer-feed", { token });
        if (active) setTransfers(data.transfers || []);
      } catch {
        if (active) setTransfers([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Leer (keine relevanten Transfers) → Widget ausblenden, nicht stören.
  if (!loading && transfers.length === 0) return null;

  return (
    <div className="bg-navy-800 rounded-md border border-navy-600 p-4">
      <h3 className="text-sm font-bold text-paper-50 flex items-center gap-2">
        <PiArrowsLeftRightBold className="text-brand-400" /> Transfers
      </h3>

      <div className="mt-3 max-h-80 overflow-y-auto -mr-1 pr-1">
        {loading ? (
          <p className="text-xs text-mist-400 py-2">Lädt…</p>
        ) : (
          <ul className="space-y-3">
            {transfers.map((t) => (
              <li key={t._id} className="flex gap-2">
                <Link href={playerLink(t.player)}>
                  <Avatar player={t.player} className="h-8 w-8" />
                </Link>
                <div className="min-w-0 text-sm leading-snug">
                  <p className="text-mist-400">
                    <Link
                      href={playerLink(t.player)}
                      className="font-medium text-paper-50 hover:text-brand-400"
                    >
                      {t.player?.firstName} {t.player?.lastName}
                    </Link>{" "}
                    <TransferText t={t} />
                  </p>
                  <p className="text-[11px] text-mist-400">{timeAgo(t.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
