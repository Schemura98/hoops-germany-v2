"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { PiBasketballBold, PiTableBold, PiCalendarBlankBold } from "react-icons/pi";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import BestenlistenWechsel from "@/components/layout/BestenlistenWechsel";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { positionLabel } from "@/lib/constants";
import { inputClassSm } from "@/lib/ui";
import { getPlayerToken } from "@/lib/clientAuth";
import DemoBadge from "@/components/DemoBadge";
import ScrollTable from "@/components/ui/ScrollTable";
import CountUp from "@/components/ui/CountUp";
import Reveal from "@/components/ui/Reveal";

// Tabellenzeilen-Skeleton im Format der echten Topscorer-Tabelle.
function TopscorerSkeleton() {
  return (
    <div className="bg-navy-800 rounded-md border border-navy-600 overflow-hidden">
      <div className="divide-y divide-navy-600">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-4 w-4 rounded" />
            <div className="flex-1">
              <Skeleton className="h-3.5 w-1/3 mb-1.5" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

const RANK_COLOR = {
  1: "text-signal-wait",
  2: "text-mist-400",
  3: "text-brand-400",
};

const selectClass = `${inputClassSm} sm:w-auto`;

// Die eigene Platzierung, bevor die Liste kommt. Für einen eingeloggten Spieler
// ist das die einzige Zahl der Seite, die ihn wirklich betrifft – sie darf nicht
// erst nach 40 fremden Zeilen auftauchen. Der Satz sagt nur, was ohnehin in der
// Tabelle steht; nichts wird zugespitzt, nichts verknappt.
function EigenePlatzierung({ viewer, ligaName, onSpringen }) {
  if (!viewer) return null;

  if (!viewer.rank) {
    return (
      <div className="mb-5 rounded-md border border-navy-600 border-t-2 border-t-brand-500 bg-navy-800 px-4 py-4">
        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-mist-600">
          Deine Platzierung
        </p>
        <p className="mt-1 text-sm text-mist-300">
          Für diese Auswahl ist noch kein bestätigtes Spiel mit deinen Zahlen
          erfasst.
        </p>
      </div>
    );
  }

  const fuehrend = viewer.rank === 1;
  return (
    <Reveal className="mb-5 rounded-md border border-navy-600 border-t-2 border-t-brand-500 bg-navy-800 px-4 py-4">
      <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-mist-600">
        Deine Platzierung{ligaName ? ` · ${ligaName}` : ""}
      </p>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-display text-3xl font-black uppercase leading-none text-paper-50">
          Platz{" "}
          <span className="font-mono tabular-nums text-brand-400">
            <CountUp value={viewer.rank} />
          </span>
        </p>
        <p className="text-sm text-mist-400">
          von {viewer.total} · {viewer.points} Punkte
        </p>
      </div>
      <p className="mt-2 text-sm text-mist-300">
        {fuehrend
          ? "Du führst diese Wertung an."
          : viewer.gapAhead === 0
          ? `Punktgleich mit Platz ${viewer.rank - 1}.`
          : `${viewer.gapAhead} Punkte hinter Platz ${viewer.rank - 1}.`}
      </p>
      {viewer.rank > 8 && (
        <button
          type="button"
          onClick={onSpringen}
          className="mt-3 text-sm font-semibold text-brand-400 hover:text-brand-300"
        >
          Zu deiner Zeile
        </button>
      )}
    </Reveal>
  );
}

function TopscorerInhalt() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [scorers, setScorers] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [viewer, setViewer] = useState(null);
  const [season, setSeason] = useState(() => searchParams.get("season") || "");
  const [league, setLeague] = useState(() => searchParams.get("league") || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const eigeneZeile = useRef(null);

  // Zustand → URL (teilbarer Link, z.B. von der Liga-Seite hierher).
  const zuletztGeschrieben = useRef(null);
  useEffect(() => {
    const qs = new URLSearchParams();
    if (league) qs.set("league", league);
    if (season) qs.set("season", season);
    const next = qs.toString();
    if (next === zuletztGeschrieben.current) return;
    zuletztGeschrieben.current = next;
    if (next === searchParams.toString()) return;
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [league, season, pathname, router]);

  // URL → Zustand (Zurück-Taste, Link auf dieselbe Seite mit anderem Filter).
  useEffect(() => {
    const cur = searchParams.toString();
    if (cur === zuletztGeschrieben.current) return;
    zuletztGeschrieben.current = cur;
    setLeague(searchParams.get("league") || "");
    setSeason(searchParams.get("season") || "");
  }, [searchParams]);

  // Was zuletzt tatsächlich geladen wurde. Verhindert die zweite, identische
  // Anfrage, nachdem der Server uns beim ersten Aufruf „deine Liga" als Filter
  // zurückgegeben hat und wir ihn in den Zustand übernehmen.
  const geladeneAnfrage = useRef(null);
  const ersterAufruf = useRef(true);

  useEffect(() => {
    const schluessel = `${league}|${season}`;
    if (geladeneAnfrage.current === schluessel) return;
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const token = getPlayerToken();
        const { data } = await axios.post("/api/player/topscorer", {
          ...(season ? { season } : {}),
          ...(league ? { leagueId: league } : {}),
          ...(token ? { token } : {}),
          // Nur beim allerersten Aufruf ohne gesetzten Filter: der Server darf
          // die eigene Liga vorauswählen.
          ...(ersterAufruf.current && !league ? { ownLeague: true } : {}),
        });
        if (!active) return;
        ersterAufruf.current = false;
        setScorers(data.scorers || []);
        if (data.seasons) setSeasons(data.seasons);
        if (data.leagues) setLeagues(data.leagues);
        setViewer(data.viewer || null);
        const angewandt = data.appliedLeagueId || "";
        geladeneAnfrage.current = `${angewandt}|${season}`;
        if (angewandt !== league) setLeague(angewandt);
        setError(false);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [season, league]);

  const aktiveLiga = leagues.find((l) => l._id === league) || null;
  const ligaLabel = aktiveLiga
    ? `${aktiveLiga.name}${aktiveLiga.season ? ` · ${aktiveLiga.season}` : ""}`
    : "";

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar />

      <PageHeader
        eyebrow="Bestenliste"
        title="Topscorer"
        subtitle={
          ligaLabel || "Rangliste nach erzielten Punkten (bestätigte Spiele)."
        }
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <BestenlistenWechsel className="mb-5" />

        {(leagues.length > 0 || seasons.length > 0) && (
          <div className="mb-5 grid grid-cols-1 sm:flex sm:flex-wrap gap-2">
            {leagues.length > 0 && (
              <select
                value={league}
                onChange={(e) => setLeague(e.target.value)}
                className={selectClass}
                aria-label="Liga"
              >
                <option value="">Alle Ligen</option>
                {leagues.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name}
                    {l.season ? ` · ${l.season}` : ""}
                  </option>
                ))}
              </select>
            )}
            {seasons.length > 0 && (
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className={selectClass}
                aria-label="Saison"
                // Bei gewählter Liga steht die Saison bereits fest – ein zweiter,
                // wirkungsloser Filter daneben wäre nur verwirrend.
                disabled={!!league}
                title={league ? "Die Liga legt die Saison bereits fest" : undefined}
              >
                <option value="">Alle Saisons</option>
                {seasons.map((s) => (
                  <option key={s} value={s}>
                    Saison {s}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {loading ? (
          <TopscorerSkeleton />
        ) : error ? (
          <EmptyState title="Tabelle konnte nicht geladen werden." />
        ) : scorers.length === 0 ? (
          <EmptyState
            icon={PiBasketballBold}
            title="Noch keine Statistiken erfasst"
            text="Sobald Teams Spieler-Stats eintragen, erscheint hier die Rangliste."
          />
        ) : (
          <>
            <EigenePlatzierung
              viewer={viewer}
              ligaName={aktiveLiga?.name || ""}
              onSpringen={() =>
                eigeneZeile.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                })
              }
            />

            <div className="bg-navy-800 rounded-md border border-navy-600 overflow-hidden">
              <ScrollTable label="Topscorer-Liste, seitlich scrollbar">
                <table className="w-full text-sm">
                  <thead>
                    {/* Rang und Spieler bleiben beim seitlichen Wischen stehen (Welle 3) */}
                    <tr className="bg-navy-800 text-xs text-mist-400 text-left border-b border-navy-600">
                      <th className="sticky left-0 z-10 bg-inherit font-medium py-3 pl-4 w-12">#</th>
                      <th className="sticky left-12 z-10 bg-inherit font-medium py-3">Spieler</th>
                      <th className="font-medium py-3 text-center w-12">Sp.</th>
                      <th className="font-medium py-3 text-center w-14">Ø</th>
                      <th className="font-medium py-3 text-center w-16 pr-4">PKT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scorers.map((s, i) => {
                      const rank = i + 1;
                      // Dieselbe Markierung wie in der Liga-Tabelle: die eigene
                      // Zeile trägt die 2px-Markenkante an der Oberkante.
                      const eigene =
                        viewer?.playerId &&
                        String(s.playerId) === String(viewer.playerId);
                      return (
                        <tr
                          key={s.playerId}
                          ref={eigene ? eigeneZeile : null}
                          className={`border-b border-navy-600 last:border-0 hover:bg-navy-700 ${
                            eigene
                              ? "bg-navy-700 shadow-[inset_0_2px_0_0_#F07A27]"
                              : "bg-navy-800"
                          }`}
                        >
                          <td
                            className={`sticky left-0 z-10 bg-inherit py-3 pl-4 w-12 font-bold ${
                              RANK_COLOR[rank] || "text-mist-400"
                            }`}
                          >
                            {rank}
                          </td>
                          <td className="sticky left-12 z-10 bg-inherit py-3">
                            <Link
                              href={`/player/view-player/${s.slug || s.playerId}`}
                              className="font-medium text-paper-50 hover:text-brand-400"
                            >
                              {s.firstName} {s.lastName}
                            </Link>
                            {eigene && (
                              <span className="ml-2 align-middle text-[10px] font-bold uppercase tracking-wide text-brand-400">
                                Du
                              </span>
                            )}
                            {s.isDemo && <DemoBadge className="ml-2 align-middle" />}
                            <div className="text-xs text-mist-400">
                              {positionLabel(s.position) || "—"}
                              {s.teamName ? " · " : ""}
                              {/* Der Verein war bisher toter Text – dabei ist
                                  „wer ist das eigentlich?" die zweite Frage
                                  nach jedem Namen in einer Bestenliste. */}
                              {s.teamName &&
                                (s.teamSlug ? (
                                  <Link
                                    href={`/team/team-detail/${s.teamSlug}`}
                                    className="hover:text-brand-400"
                                  >
                                    {s.teamName}
                                  </Link>
                                ) : (
                                  s.teamName
                                ))}
                            </div>
                          </td>
                          <td className="font-mono tabular-nums py-3 text-center text-mist-400">
                            {s.games}
                          </td>
                          {/* Nur das Podium zaehlt hoch: verstaerkt die vorhandene
                              Hierarchie (Rang 1-3 sind schon farblich hervorgehoben),
                              statt 60+ Beobachter fuer die ganze Liste anzulegen
                              (Entscheid Vivien, Design-Review Befund 11). */}
                          <td className="font-mono tabular-nums py-3 text-center text-mist-400">
                            {rank <= 3 ? <CountUp value={s.ppg} decimals={1} /> : s.ppg.toFixed(1)}
                          </td>
                          <td className="font-mono tabular-nums py-3 text-center font-semibold text-paper-50 pr-4">
                            {rank <= 3 ? <CountUp value={s.points} /> : s.points}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </ScrollTable>
            </div>

            {/* Der Weg weiter: Wer eine Liga-Bestenliste liest, will als
                Nächstes die Tabelle oder den Spielplan derselben Liga. */}
            {aktiveLiga && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/ligen/${aktiveLiga._id}`}
                  className="inline-flex items-center gap-2 rounded-md border border-navy-600 bg-navy-800 px-4 py-2.5 text-sm font-semibold text-paper-50 hover:border-brand-500 hover:text-brand-300 transition-colors duration-150"
                >
                  <PiTableBold className="text-brand-400" /> Tabelle
                </Link>
                <Link
                  href={`/spiele?league=${aktiveLiga._id}`}
                  className="inline-flex items-center gap-2 rounded-md border border-navy-600 bg-navy-800 px-4 py-2.5 text-sm font-semibold text-paper-50 hover:border-brand-500 hover:text-brand-300 transition-colors duration-150"
                >
                  <PiCalendarBlankBold className="text-brand-400" /> Spielplan
                </Link>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function TopscorerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy-950 flex flex-col">
          <Navbar />
          <PageHeader
            eyebrow="Bestenliste"
            title="Topscorer"
            subtitle="Rangliste nach erzielten Punkten (bestätigte Spiele)."
          />
          <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
            <BestenlistenWechsel className="mb-5" />
            <TopscorerSkeleton />
          </main>
          <Footer />
        </div>
      }
    >
      <TopscorerInhalt />
    </Suspense>
  );
}
