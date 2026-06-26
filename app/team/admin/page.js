"use client";

import { useEffect, useRef, useState } from "react";
import {
  FaUsers,
  FaUserPlus,
  FaCalendarAlt,
  FaClipboardList,
  FaBullhorn,
  FaCog,
  FaBasketballBall,
} from "react-icons/fa";
import { useCurrentTeam } from "@/lib/useCurrentTeam";
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
  { key: "kader", label: "Kader", icon: FaUsers, Comp: KaderTab },
  { key: "anfragen", label: "Anfragen", icon: FaUserPlus, Comp: AnfragenTab },
  { key: "spielplan", label: "Spielplan", icon: FaCalendarAlt, Comp: SpielplanTab },
  { key: "ergebnisse", label: "Ergebnisse", icon: FaClipboardList, Comp: ErgebnisseTab },
  { key: "tryouts", label: "Tryouts", icon: FaBullhorn, Comp: TryoutsTab },
  { key: "einstellungen", label: "Einstellungen", icon: FaCog, Comp: EinstellungenTab },
];

export default function TeamAdminPage() {
  const { team, status, reload } = useCurrentTeam();
  const [active, setActive] = useState("kader");
  const tabBarRef = useRef(null);
  const tabRefs = useRef({});

  // Tab-Deeplink: ?tab=ergebnisse (z.B. aus Mail/Benachrichtigung).
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t && TABS.some((x) => x.key === t)) setActive(t);
  }, []);

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
        <p className="text-gray-700">Team-Daten konnten nicht geladen werden.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Erneut versuchen
        </Button>
      </main>
    );
  }

  const ActiveComp = TABS.find((t) => t.key === active)?.Comp || KaderTab;

  return (
    <div className="min-h-screen bg-gray-50">
      <TeamNav team={team} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Team-Verwaltung</h1>
          <p className="text-sm text-gray-500">
            {team?.teamName}
            {team?.region ? ` · ${team.region}` : ""}
          </p>
        </div>

        {team?.approved === false && (
          <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm font-semibold text-amber-800">⏳ Dein Team wird gerade geprüft</p>
            <p className="text-sm text-amber-700 mt-1">
              Du kannst dein Team schon einrichten (Kader, Logo, Spiele vorbereiten). Öffentlich
              sichtbar wird es, sobald ein Administrator es freigegeben hat – du bekommst dann eine
              Benachrichtigung.
            </p>
          </div>
        )}

        {/* Tab-Navigation (einheitlicher Pill-Stil; Refs für Auto-Scroll/Deeplink bleiben) */}
        <div ref={tabBarRef} className="relative flex gap-1 overflow-x-auto bg-gray-100 rounded-xl p-1 mb-6">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = t.key === active;
            return (
              <button
                key={t.key}
                ref={(el) => {
                  tabRefs.current[t.key] = el;
                }}
                onClick={() => setActive(t.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Icon className="text-xs" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab-Inhalt */}
        <ActiveComp team={team} reload={reload} />
      </main>

      <Footer />
    </div>
  );
}
