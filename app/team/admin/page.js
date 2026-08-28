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
  PiXBold,
} from "react-icons/pi";
import { useCurrentTeam } from "@/lib/useCurrentTeam";
import { useCurrentPlayer } from "@/lib/useCurrentPlayer";
import { useTeamAufgaben } from "@/lib/useTeamAufgaben";
import { hasTeamPermission, TAB_PERMISSION } from "@/lib/teamPermissions";
import AufgabenLeiste from "@/components/team/AufgabenLeiste";
import AdminTour from "@/components/onboarding/AdminTour";
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
  // Was ist offen? – Zahlen aus denselben Endpunkten, die auch die Tabs füttern.
  const { aufgaben, status: aufgabenStatus, reload: reloadAufgaben } = useTeamAufgaben(team);
  const [active, setActive] = useState("kader");
  // Einmaliger Hinweis, wenn man über „Team gründen" hierher umgeleitet wurde
  // (Roadmap 35, Befund Patrick 22.08.2026): Die Weiterleitung selbst bleibt —
  // sie schützt vor versehentlichen Zweitvereinen —, aber sie erklärt sich
  // jetzt. Nur per Query-Param, wegklickbar, nicht persistent: Wer die Seite
  // normal aufruft, sieht nichts.
  const [schonAdminHinweis, setSchonAdminHinweis] = useState(false);
  const tabBarRef = useRef(null);
  const tabRefs = useRef({});

  // Eigene Rolle/Rechte: Haupt-Admin sieht alles, Co-Admin nur erlaubte Tabs.
  const myId = player?._id || player?.id || null;
  const isMainAdmin = !myId || String(team?.adminPlayerId || "") === String(myId);
  const visibleTabs = TABS.filter((t) =>
    hasTeamPermission(team || {}, myId, TAB_PERMISSION[t.key])
  );
  const visibleKeys = visibleTabs.map((t) => t.key).join(",");

  // Tab wechseln und dabei die Aufgabenzahlen auffrischen: Wer gerade eine
  // Anfrage bearbeitet hat, soll beim Zurückwechseln nicht die alte Zahl sehen.
  function wechsle(key) {
    setActive(key);
    reloadAufgaben();
  }

  // Tab-Deeplink: ?tab=ergebnisse (z.B. aus Mail/Benachrichtigung).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab");
    if (t && TABS.some((x) => x.key === t)) setActive(t);
    if (params.get("hinweis") === "schon-admin") setSchonAdminHinweis(true);
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
      <main id="hauptinhalt" tabIndex={-1} className="min-h-screen flex items-center justify-center">
        <Loading />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main id="hauptinhalt" tabIndex={-1} className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <p className="text-mist-300">Team-Daten konnten nicht geladen werden.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Erneut versuchen
        </Button>
      </main>
    );
  }

  const ActiveComp = TABS.find((t) => t.key === active)?.Comp || KaderTab;

  return (
    <div className="min-h-screen bg-navy-950">
      <TeamNav team={team} />

      <main id="hauptinhalt" tabIndex={-1} className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-display uppercase tracking-tight text-2xl font-black text-paper-50">Team-Verwaltung</h1>
          <p className="text-sm text-mist-400">
            {team?.teamName}
            {team?.region ? ` · ${team.region}` : ""}
          </p>
        </div>

        {/* Wortlaut Nele, 28.08.2026 — bewusst OHNE die Aufzählung
            „Kader, Spiele, Ergebnisse": Die Umleitung trifft auch Co-Admins
            mit Teilrechten, und der Kasten darf keine Fläche versprechen, die
            dieser Leser nicht hat (dieselbe Regel wie die Tour-Filterung). */}
        {schonAdminHinweis && (
          <div className="mb-6 flex items-start justify-between gap-3 rounded-md border border-navy-600 border-t-2 border-t-brand-500 bg-navy-800 px-4 py-3.5">
            <div>
              <p className="text-sm font-semibold text-paper-50">Du bist hier richtig</p>
              <p className="mt-1 text-sm text-mist-300">
                Du verwaltest bereits{" "}
                <span className="font-semibold text-paper-50">
                  {team?.teamName || "dein Team"}
                </span>{" "}
                – deshalb hat dich &bdquo;Team gründen&ldquo; direkt hierher gebracht, damit
                nicht versehentlich ein zweites Team entsteht. Alles rund um dein Team
                erledigst du auf dieser Seite.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSchonAdminHinweis(false)}
              aria-label="Hinweis schließen"
              className="-mr-1 -mt-1 flex-shrink-0 rounded-sm p-2 text-mist-400 transition-colors hover:text-paper-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <PiXBold />
            </button>
          </div>
        )}

        {team?.approved === false && (
          <div className="mb-6 rounded-md bg-signal-wait/10 border border-signal-wait/50 p-4">
            <p className="text-sm font-semibold text-signal-wait">⏳ Dein Team wird gerade geprüft</p>
            <p className="text-sm text-signal-wait mt-1">
              Du kannst dein Team schon einrichten (Kader, Logo, Spiele vorbereiten). Öffentlich
              sichtbar wird es, sobald das Hoops-Team es freigegeben hat – du bekommst dann eine
              Benachrichtigung.
            </p>
          </div>
        )}

        <AufgabenLeiste
          aufgaben={aufgaben}
          status={aufgabenStatus}
          sichtbareTabs={visibleTabs.map((t) => t.key)}
          onSpringen={wechsle}
        />

        {/* Tab-Navigation im Unterstreichungs-Stil des Tabs-Primitivs
            (components/ui/Tabs.js): Ein Umschalter ist eine Anzeige, keine
            schwebende Karte – die frühere Pillen-Wanne widersprach genau dem
            Kopfkommentar des eigenen Primitivs (Befund Vivien, 23.08.2026).
            Bewusst KEIN direkter Einsatz von <Tabs>: Auto-Scroll über die
            tabRefs, der ?tab=-Deeplink und die Aufgaben-Zähler brauchen je Tab
            eine Ref und einen Badge-Knoten, die das Primitiv nicht kennt –
            die KLASSEN sind deshalb mit Tabs.js identisch gehalten, nur um
            py-2.5 erhöht (Tippziel > 40 px statt 32, Familie Roadmap 32 b). */}
        <div ref={tabBarRef} className="relative flex gap-1 overflow-x-auto border-b border-navy-600 mb-6">
          {visibleTabs.map((t) => {
            const Icon = t.icon;
            const isActive = t.key === active;
            // Nur zeigen, wenn es wirklich etwas zu tun gibt. Die Zahl steht für
            // offene Aufgaben in diesem Tab – nicht für den Bestand. Was genau
            // gezählt wird, steht in lib/useTeamAufgaben.js; der Vorlesetext
            // sagt es zusätzlich aus, weil eine nackte Zahl am Reiter
            // mehrdeutig wäre.
            const offen = aufgabenStatus === "ready" ? aufgaben.proTab[t.key] || 0 : 0;
            return (
              <button
                key={t.key}
                ref={(el) => {
                  tabRefs.current[t.key] = el;
                }}
                onClick={() => wechsle(t.key)}
                aria-label={
                  offen > 0
                    ? `${t.label}, ${offen} ${offen === 1 ? "offene Aufgabe" : "offene Aufgaben"}`
                    : undefined
                }
                className={`flex items-center gap-1.5 whitespace-nowrap -mb-px border-b-2 px-3 sm:px-4 py-2.5 text-sm font-semibold tracking-tight transition-[color,border-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 ${
                  isActive
                    ? "border-brand-500 text-paper-50"
                    : "border-transparent text-mist-400 hover:text-paper-50 hover:border-navy-500"
                }`}
              >
                <Icon className="text-xs" />
                {t.label}
                {offen > 0 && (
                  <span
                    aria-hidden="true"
                    className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-signal-wait px-1.5 font-mono text-[11px] font-bold tabular-nums text-navy-950"
                  >
                    {offen}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab-Inhalt */}
        <ActiveComp team={team} reload={reload} isMainAdmin={isMainAdmin} />

        {/* Wiederaufruf der Admin-Tour – unaufdringlich unter den Inhalten.
            Bewusst NICHT der Footer-TourLink: Der öffnet die Spieler-Tour, und
            ein Link, der je nach Rolle etwas anderes öffnet, ist eine Falle
            (Konzept §3). */}
        <div className="mt-10 border-t border-navy-600 pt-4">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("hg:open-admin-tour"))}
            className="text-sm text-mist-400 hover:text-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            Kurz erklärt: deine Aufgaben als Team-Admin
          </button>
        </div>
      </main>

      {/* Erst hier (Status "ready") gemountet, damit der Auto-Start nie über
          einem Skeleton aufgeht – Bedingung (c) aus Konzept §3.
          `sichtbareTabs`: Der „Zeig mir das"-Knopf darf nur auf Reiter zeigen,
          die DIESE Person sehen darf – ein Co-Admin ohne Spielrecht landete
          sonst wortlos auf dem ersten erlaubten Reiter (Befund Lina M1). */}
      <AdminTour
        player={player}
        onTab={wechsle}
        sichtbareTabs={visibleTabs.map((t) => t.key)}
      />

      <Footer />
    </div>
  );
}
