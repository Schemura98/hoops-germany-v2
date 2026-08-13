"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { PiPlusBold, PiUsersThreeBold } from "react-icons/pi";
import { getPlayerToken } from "@/lib/clientAuth";
import BaseAvatar from "@/components/Avatar";

// „Vorschläge für dich" – Spieler/Vereine aus der eigenen Region/Liga zum Folgen.
// Hilft neuen Nutzern gegen den leeren Feed. Blendet sich aus, wenn nichts (mehr)
// vorzuschlagen ist. Die Vorschläge sind per Definition ungefolgt → kein
// checkfollowing nötig; gefolgte Einträge verschwinden direkt aus der Liste.
// fallbackText: Standardmäßig blendet sich der Baustein bei leerer Liste aus.
// In einem vom Nutzer selbst geöffneten Akkordeon (Mobil-Ansicht des Feeds)
// wäre das eine leere Fläche ohne Erklärung – dort zeigt der Text ehrlich,
// dass es gerade nichts vorzuschlagen gibt.
export default function FollowSuggestions({ fallbackText }) {
  const [items, setItems] = useState([]); // {key,type,id,name,subtitle,img,square,href,busy}
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const token = getPlayerToken();
    if (!token) return;
    let active = true;
    (async () => {
      try {
        const { data } = await axios.post("/api/player/suggestions", { token });
        if (!active) return;
        const players = (data.players || []).map((p) => ({
          key: `p_${p._id}`,
          type: "player",
          id: p._id,
          name: `${p.firstName || ""} ${p.lastName || ""}`.trim(),
          subtitle: p.subtitle,
          img: p.profileImage,
          square: false,
          href: `/player/view-player/${p.slug || p._id}`,
        }));
        const teams = (data.teams || []).map((t) => ({
          key: `t_${t._id}`,
          type: "team",
          id: t._id,
          name: t.teamName,
          subtitle: t.subtitle,
          img: t.logo,
          square: true,
          href: `/team/team-detail/${t.slug || t._id}`,
        }));
        // Spieler und Vereine abwechselnd anbieten.
        const merged = [];
        const max = Math.max(players.length, teams.length);
        for (let i = 0; i < max; i++) {
          if (players[i]) merged.push(players[i]);
          if (teams[i]) merged.push(teams[i]);
        }
        setItems(merged);
      } catch {
        /* still */
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function follow(item) {
    const token = getPlayerToken();
    if (!token) return;
    // Optimistisch aus der Liste entfernen.
    setItems((list) => list.filter((x) => x.key !== item.key));
    try {
      const endpoint = item.type === "team" ? "followteam" : "followplayer";
      const payload =
        item.type === "team"
          ? { token, teamId: item.id }
          : { token, targetId: item.id };
      await axios.post(`/api/player/${endpoint}`, payload);
    } catch {
      /* bei Fehler wieder einfügen */
      setItems((list) => [item, ...list]);
    }
  }

  if (!loaded) return null;
  if (items.length === 0) {
    if (!fallbackText) return null;
    return (
      <div className="bg-navy-800 rounded-md border border-navy-600 p-4">
        <p className="text-xs text-mist-400">{fallbackText}</p>
      </div>
    );
  }

  return (
    <div className="bg-navy-800 rounded-md border border-navy-600 p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-paper-50 mb-3">
        <PiUsersThreeBold className="text-brand-400" /> Vorschläge für dich
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-3">
            <Link href={item.href}>
              <BaseAvatar
                name={item.name}
                src={item.img}
                square={item.square}
                className="h-10 w-10"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={item.href}
                className="block truncate text-sm font-medium text-paper-50 hover:text-brand-400"
              >
                {item.name}
              </Link>
              <p className="truncate text-xs text-mist-400">
                {item.type === "team" ? "Verein" : "Spieler"}
                {item.subtitle ? ` · ${item.subtitle}` : ""}
              </p>
            </div>
            <button
              onClick={() => follow(item)}
              className="inline-flex items-center gap-1.5 flex-shrink-0 bg-brand-500 hover:bg-brand-400 text-navy-950 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors"
            >
              <PiPlusBold className="text-[10px]" /> Folgen
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
