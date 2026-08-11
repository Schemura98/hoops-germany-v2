"use client";

import { useEffect, useRef, useState } from "react";
import {
  PiUsersBold,
  PiUserPlusBold,
  PiCalendarBlankBold,
  PiClipboardTextBold,
  PiMegaphoneBold,
  PiGearBold,
  PiBasketballBold,
} from "react-icons/pi";
import { useCurrentTeam } from "@/lib/useCurrentTeam";
import { useCurrentPlayer } from "@/lib/useCurrentPlayer";
import { hasTeamPermission, TAB_PERMISSION } from "@/lib/teamPermissions";
import TeamNav from "@/components/layout/TeamNav";
import Footer from "@/components/layout/Footer";
import Loading from "@/components/ui/Loading";
import Button from "@/components/ui/Button";
import KaderTab from "@/components/team/tabs/KaderTab";
import AnfragenTab from "@/components/team/tabs/AnfragenTab";
import SpielplanTab from "@/components/team/tabs/SpielplanTab";
import ErgebnisseTab from "@/components/team/tabs/ErgebnisseTab";
import TryoutsTab from "@/components/team/tabs/TryoutsTab";
import EinstellungenTab from "@/components/team/tabs/EinstellungenTab";

const TABS = [
  { key: "kader", label: "Kader", icon: PiUsersBold, Comp: KaderTab },
  { key: "anfragen", label: "Anfragen", icon: PiUserPlusBold, Comp: AnfragenTab },
  { key: "spielplan", label: "Spielplan", icon: PiCalendarBlankBold, Comp: SpielplanTab },
  { key: "ergebnisse", label: "Ergebnisse", icon: PiClipboardTextBold, Comp: ErgebnisseTab },
  { key: "tryouts", label: "Tryouts", icon: PiMegaphoneBold, Comp: TryoutsTab },
  { key: "einstellungen", label: "Einstellungen", icon: PiGearBold, Comp: EinstellungenTab },
];

export default function TeamAdminPage() {
  const { team, status, reload } = useCurrentTeam();
  const { player } = useCurrentPlayer();
  const [active, setActive] = useState("kader");
  const tabBarRef = useRef(null);
  const tabRefs = useRef({});

  // Eigene Rolle/Rechte: Haupt-Admin sieht alles, Co-Admin nur erlaubte Tabs.
  const myId = player?._id || player?.id || null;
  const isMainAdmin = !myId || String(team?.adminPlayerId || "") === String(myId);
  const visibleTabs = TABS.filter((t) =>
    hasTeamPermission(team || {}, myId, TAB_PERMISSION[t.key])
  );
  const visibleKeys = visibleTabs.map((t) => t.key).join(",");

  // Tab-Deeplink: ?tab=ergebnisse (z.B. aus Mail/Benachrichtigung).
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t && TABS.some((x) => x.key === t)) setActive(t);
  }, []);

  // Falls der aktive Tab nicht (mehr) erlaubt ist → ersten erlaubten wählen.
  useEffect(() => {
    if (visibleKeys && !visibleKeys.split(",").includes(active)) {
      setActive(visibleKeys.split(",")[0]);
    }
  }, [visibleKeys, active]);

  // Aktiven Tab im scrollbaren Balken zentrieren (nur horizontal). Leicht
  // verzögert, damit auch der Deeplink-Fall (?tab=…) nach dem Mount greift.
  useEffect(() => {
    const t = setTimeout(() => {
      const bar = tabBarRef.current;
      const btn = tabRefs.current[active];
      if (!bar || !btn) return;
      const target = btn.offsetLeft - bar.clientWidth / 2 + btn.clientWidth / 2;
      bar.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
    }, 80);
    return () => clearTimeout(t);
    // status: nach dem Laden ist die Tab-Leiste erst gerendert (Refs vorhanden).
  }, [active, status]);

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loading />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <p className="text-mist-300">Team-Daten konnten nicht geladen werden.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Erneut versuchen
        </Button>
      </main>
    );
  }

  const ActiveComp = TABS.find((t) => t.key === active)?.Comp || KaderTab;

  return (
    <div className="min-h-screen bg-ink-950">
      <TeamNav team={team} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-display uppercase tracking-tight text-2xl font-black text-paper-50">Team-Verwaltung</h1>
          <p className="text-sm text-mist-400">
            {team?.teamName}
            {team?.region ? ` · ${team.region}` : ""}
          </p>
        </div>

        {team?.approved === false && (
          <div className="mb-6 rounded-md bg-signal-wait/10 border border-signal-wait/50 p-4">
            <p className="text-sm font-semibold text-signal-wait">⏳ Dein Team wird gerade geprüft</p>
            <p className="text-sm text-signal-wait mt-1">
              Du kannst dein Team schon einrichten (Kader, Logo, Spiele vorbereiten). Öffentlich
              sichtbar wird es, sobald ein Administrator es freigegeben hat – du bekommst dann eine
              Benachrichtigung.
            </p>
          </div>
        )}

        {/* Tab-Navigation (einheitlicher Pill-Stil; Refs für Auto-Scroll/Deeplink bleiben) */}
        <div ref={tabBarRef} className="relative flex gap-1 overflow-x-auto bg-ink-700 rounded-md p-1 mb-6">
          {visibleTabs.map((t) => {
            const Icon = t.icon;
            const isActive = t.key === active;
            return (
              <button
                key={t.key}
                ref={(el) => {
                  tabRefs.current[t.key] = el;
                }}
                onClick={() => setActive(t.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-sm text-sm font-medium transition ${
                  isActive
                    ? "bg-ink-800 text-paper-50"
                    : "text-mist-400 hover:text-paper-50"
                }`}
              >
                <Icon className="text-xs" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab-Inhalt */}
        <ActiveComp team={team} reload={reload} isMainAdmin={isMainAdmin} />
      </main>

      <Footer />
    </div>
  );
}
