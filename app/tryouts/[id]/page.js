"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  PiUsersBold,
  PiMapPinBold,
  PiCalendarBlankBold,
  PiCaretLeftBold,
  PiArrowRightBold,
} from "react-icons/pi";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import { getPlayerToken } from "@/lib/clientAuth";
import { positionLabel } from "@/lib/constants";

function formatDate(d) {
  try {
    return new Date(d).toLocaleString("de-DE", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function TryoutDetailPage({ params }) {
  const id = params.id;
  const [tryout, setTryout] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | notfound
  const [loggedIn, setLoggedIn] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState(null);

  useEffect(() => {
    setLoggedIn(!!getPlayerToken());
    let active = true;
    (async () => {
      try {
        const { data } = await axios.get(`/api/tryouts/${id}`);
        if (active) {
          setTryout(data.tryout);
          setState("ready");
        }
      } catch {
        if (active) setState("notfound");
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  async function apply() {
    setApplying(true);
    setApplyMsg(null);
    try {
      const token = getPlayerToken();
      const { data } = await axios.post(`/api/tryouts/${id}/apply`, { token });
      setApplyMsg({ type: "ok", text: data.message });
    } catch (err) {
      setApplyMsg({ type: "err", text: err.response?.data?.message || "Bewerbung fehlgeschlagen." });
    } finally {
      setApplying(false);
    }
  }

  if (state === "loading") {
    return (
      <main id="hauptinhalt" tabIndex={-1} className="min-h-screen flex items-center justify-center">
        <Loading />
      </main>
    );
  }

  if (state === "notfound") {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col">
        <Navbar />
        <main id="hauptinhalt" tabIndex={-1} className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-xl font-bold text-paper-50">Tryout nicht gefunden</h1>
          <Link href="/tryouts" className="mt-4 text-brand-400 hover:underline">
            Zurück zur Übersicht
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const team = tryout.team;
  const closed = tryout.status !== "active";

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar />

      <PageHeader eyebrow="Probetraining" title={`Tryout bei ${team?.teamName || "Team"}`} />

      <main id="hauptinhalt" tabIndex={-1} className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="bg-navy-800 rounded-md border border-navy-600 p-6">
          {/* Team */}
          <Link
            href={team?.slug ? `/team/team-detail/${team.slug}` : "#"}
            className="flex items-center gap-3"
          >
            {team?.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={team.logo} alt="" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <span className="h-12 w-12 rounded-full bg-brand-500/15 text-brand-400 flex items-center justify-center">
                <PiUsersBold />
              </span>
            )}
            <div>
              <p className="font-semibold text-paper-50">{team?.teamName}</p>
              {team?.region && <p className="text-xs text-mist-400">{team.region}</p>}
            </div>
          </Link>

          <div className="mt-5 space-y-2 text-sm text-mist-400">
            <p className="flex items-center gap-2">
              <PiCalendarBlankBold className="text-mist-400" /> {formatDate(tryout.date)}
            </p>
            {tryout.location && (
              <p className="flex items-center gap-2">
                <PiMapPinBold className="text-mist-400" /> {tryout.location}
              </p>
            )}
            <p className="flex items-center gap-2">
              <PiUsersBold className="text-mist-400" /> {tryout.applicantCount} Bewerber
            </p>
          </div>

          {tryout.positions?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-mist-400 mb-1">Gesuchte Positionen</p>
              <div className="flex flex-wrap gap-1">
                {tryout.positions.map((p) => (
                  <span
                    key={p}
                    className="text-xs font-medium bg-brand-500/10 text-brand-400 rounded-sm px-2 py-0.5"
                  >
                    {positionLabel(p)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {tryout.description && (
            <div className="mt-4">
              <p className="text-xs font-medium text-mist-400 mb-1">Beschreibung</p>
              <p className="text-sm text-mist-400 whitespace-pre-line">
                {tryout.description}
              </p>
            </div>
          )}

          {/* Bewerben */}
          <div className="mt-6">
            {applyMsg ? (
              <div
                className={`rounded-sm border px-4 py-3 text-sm ${
                  applyMsg.type === "ok"
                    ? "bg-signal-ok/10 border-signal-ok/50 text-signal-ok"
                    : "bg-signal-error/10 border-signal-error/50 text-signal-error"
                }`}
              >
                {applyMsg.text}
              </div>
            ) : closed ? (
              <p className="text-sm text-mist-400">Dieses Tryout ist geschlossen.</p>
            ) : loggedIn ? (
              <Button onClick={apply} disabled={applying}>
                {applying ? "Senden…" : "Jetzt bewerben"}
              </Button>
            ) : (
              <Button href="/login" variant="secondary">
                Zum Bewerben anmelden
              </Button>
            )}
          </div>
        </div>

        {/* Wer sich hier gegen das Probetraining entscheidet – falscher Ort,
            falsches Datum, falsche Position –, hatte bisher keinen Weg zurück:
            die Seite kannte weder die Liste, aus der sie kam, noch den
            Transfermarkt. Zwei Zeilen, damit die Reise nicht hier endet. */}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-navy-600 pt-5 text-sm">
          <Link
            href="/tryouts"
            className="inline-flex items-center gap-1.5 rounded-sm font-medium text-mist-300 transition-colors duration-150 hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
          >
            <PiCaretLeftBold aria-hidden="true" className="text-xs" />
            Alle Probetrainings
          </Link>
          <Link
            href="/transfermarkt"
            className="inline-flex items-center gap-1.5 rounded-sm font-medium text-mist-300 transition-colors duration-150 hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
          >
            Vereine, die jemanden suchen
            <PiArrowRightBold aria-hidden="true" className="text-xs" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
