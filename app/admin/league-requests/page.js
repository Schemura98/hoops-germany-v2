"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { PiCheckBold, PiXBold, PiWarningBold } from "react-icons/pi";
import AdminShell from "@/components/layout/AdminShell";
import { getAdminToken } from "@/lib/clientAuth";

const STATUS_LABEL = { ausstehend: "Ausstehend", genehmigt: "Genehmigt", abgelehnt: "Abgelehnt", storniert: "Storniert" };
const STATUS_CLS = {
  ausstehend: "bg-signal-wait/10 text-signal-wait",
  genehmigt: "bg-signal-ok/10 text-signal-ok",
  abgelehnt: "bg-signal-error/10 text-signal-error",
  storniert: "bg-ink-700 text-mist-400",
};

function leagueLabel(l) {
  if (!l) return "–";
  return [l.name, l.season ? `Saison ${l.season}` : null, l.region].filter(Boolean).join(" · ");
}

export default function AdminLeagueRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [noteDraft, setNoteDraft] = useState({}); // requestId -> reviewNote-Entwurf

  const load = useCallback(async () => {
    const token = getAdminToken();
    const { data } = await axios.post("/api/admin/league-change-requests", { token });
    setRequests(data.requests || []);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await load();
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  async function review(id, approve) {
    setBusyId(id);
    try {
      const token = getAdminToken();
      await axios.post("/api/admin/review-league-change-request", {
        token,
        requestId: id,
        approve,
        reviewNote: noteDraft[id] || "",
      });
      await load();
    } catch (err) {
      window.alert(err.response?.data?.message || "Aktion fehlgeschlagen.");
    } finally {
      setBusyId(null);
    }
  }

  const pending = requests.filter((r) => r.status === "ausstehend");
  const decided = requests.filter((r) => r.status !== "ausstehend");

  return (
    <AdminShell title="Liga-Zuordnungsanfragen">
      <p className="mb-6 text-sm text-mist-400">
        Team-Admins können offizielle Ligazuordnungen nicht mehr direkt ändern – hier
        genehmigst oder lehnst du ihre Anfragen ab. Betrifft Tabelle, Spielplan,
        Statistiken und Saisonhistorie, deshalb vor der Genehmigung prüfen.
      </p>

      {loading ? (
        <p className="text-mist-400">Lädt…</p>
      ) : (
        <>
          <h2 className="mb-3 text-sm font-bold text-paper-50">
            Ausstehend ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <p className="mb-8 text-sm text-mist-400">Keine offenen Anfragen.</p>
          ) : (
            <div className="mb-8 space-y-4">
              {pending.map((r) => {
                const hasWarning = r.currentLeagueMatchCount > 0 || r.requestedLeagueMatchCount > 0;
                return (
                  <div key={r._id} className="bg-ink-800 rounded-md border border-ink-600 p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link
                        href={`/team/team-detail/${r.team?.slug || ""}`}
                        className="font-semibold text-paper-50 hover:text-brand-400"
                      >
                        {r.team?.teamName || "Team"}
                      </Link>
                      <span className="text-xs text-mist-400">
                        {new Date(r.createdAt).toLocaleDateString("de-DE")}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 text-sm">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-mist-400">
                          Aktuelle Liga
                        </p>
                        <p className="text-mist-300">{leagueLabel(r.currentLeagueId)}</p>
                        {r.currentLeagueMatchCount > 0 && (
                          <p className="text-xs text-signal-wait">{r.currentLeagueMatchCount} Spiel(e) vorhanden</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-mist-400">
                          Gewünschte Liga
                        </p>
                        <p className="text-mist-300">{leagueLabel(r.requestedLeagueId)}</p>
                        {r.requestedLeagueMatchCount > 0 && (
                          <p className="text-xs text-signal-wait">{r.requestedLeagueMatchCount} Spiel(e) vorhanden</p>
                        )}
                      </div>
                    </div>

                    {r.note && (
                      <p className="text-sm text-mist-400 bg-ink-950 rounded-sm px-3 py-2">
                        „{r.note}“ – {r.requestedBy?.firstName} {r.requestedBy?.lastName}
                      </p>
                    )}

                    {hasWarning && (
                      <div className="flex items-start gap-2 rounded-sm bg-signal-wait/10 border border-signal-wait/50 px-3 py-2 text-xs text-signal-wait">
                        <PiWarningBold className="mt-0.5 shrink-0" />
                        <span>
                          Mindestens eine der beiden Ligen hat bereits Spiele/Ergebnisse. Vor der
                          Genehmigung prüfen, ob das gewollt ist (Tabelle/Statistiken ändern sich).
                        </span>
                      </div>
                    )}

                    <input
                      value={noteDraft[r._id] || ""}
                      onChange={(e) => setNoteDraft((d) => ({ ...d, [r._id]: e.target.value }))}
                      placeholder="Notiz für den Team-Admin (optional)"
                      className="w-full rounded-sm border border-ink-600 px-3 py-2 text-sm outline-none focus:border-brand-400"
                    />

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => review(r._id, true)}
                        disabled={busyId === r._id}
                        className="inline-flex items-center gap-1.5 bg-signal-ok hover:brightness-110 disabled:opacity-60 text-paper-50 rounded-sm px-4 py-2 text-sm font-medium"
                      >
                        <PiCheckBold className="text-xs" /> Genehmigen
                      </button>
                      <button
                        onClick={() => review(r._id, false)}
                        disabled={busyId === r._id}
                        className="inline-flex items-center gap-1.5 bg-signal-error/10 hover:bg-signal-error/15 disabled:opacity-60 text-signal-error rounded-sm px-4 py-2 text-sm font-medium"
                      >
                        <PiXBold className="text-xs" /> Ablehnen
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <h2 className="mb-3 text-sm font-bold text-paper-50">Bearbeitet</h2>
          {decided.length === 0 ? (
            <p className="text-sm text-mist-400">Noch keine bearbeiteten Anfragen.</p>
          ) : (
            <div className="space-y-2">
              {decided.map((r) => (
                <div
                  key={r._id}
                  className="flex flex-wrap items-center justify-between gap-2 bg-ink-800 rounded-md border border-ink-600 px-4 py-3 text-sm"
                >
                  <span className="text-mist-300">
                    {r.team?.teamName} → {leagueLabel(r.requestedLeagueId)}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLS[r.status]}`}>
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}
