"use client";

import { useEffect, useState } from "react";
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

  // Tab-Deeplink: ?tab=ergebnisse (z.B. aus Mail/Benachrichtigung).
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t && TABS.some((x) => x.key === t)) setActive(t);
  }, []);

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
        <p className="text-gray-700">Team-Daten konnten nicht geladen werden.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 font-medium"
        >
          Erneut versuchen
        </button>
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

        {/* Tab-Navigation */}
        <div className="flex gap-1 overflow-x-auto border-b border-gray-200 mb-6">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = t.key === active;
            return (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  isActive
                    ? "border-brand-500 text-brand-600"
                    : "border-transparent text-gray-500 hover:text-gray-800"
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
