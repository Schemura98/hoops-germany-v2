"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { PiPencilSimpleBold } from "react-icons/pi";
import AdminShell from "@/components/layout/AdminShell";
import { getAdminToken } from "@/lib/clientAuth";
import { teamScores } from "@/lib/matchScore";

const STATUS_BADGE = {
  scheduled: { label: "Geplant", cls: "bg-navy-700 text-mist-300" },
  completed: { label: "Beendet", cls: "bg-signal-ok/15 text-signal-ok" },
  cancelled: { label: "Abgesagt", cls: "bg-signal-error/15 text-signal-error" },
};

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = getAdminToken();
        const { data } = await axios.post("/api/admin/matches", { token });
        setMatches(data.matches || []);
      } catch {
        /* ignorieren */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AdminShell title="Spiele verwalten">
      {loading ? (
        <p className="text-mist-400">Lädt…</p>
      ) : matches.length === 0 ? (
        <p className="text-mist-400">Keine Spiele vorhanden.</p>
      ) : (
        <div className="bg-navy-800 rounded-md border border-navy-600 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-mist-400 text-left border-b border-navy-600">
                <th className="font-medium py-3 pl-4">Datum</th>
                <th className="font-medium py-3">Partie</th>
                <th className="font-medium py-3 text-center">Ergebnis</th>
                <th className="font-medium py-3">Status</th>
                <th className="font-medium py-3 pr-4 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m) => {
                const score = teamScores(m);
                const badge = STATUS_BADGE[m.status] || STATUS_BADGE.scheduled;
                return (
                  <tr key={m._id} className="border-b border-navy-600 last:border-0">
                    <td className="py-3 pl-4 text-mist-400">{formatDate(m.date)}</td>
                    <td className="py-3 text-paper-50">
                      {m.teamA?.teamName || "?"} <span className="text-mist-400">vs</span>{" "}
                      {m.teamB?.teamName || "?"}
                    </td>
                    <td className="py-3 text-center font-semibold text-paper-50">
                      {score ? `${score.a} : ${score.b}` : "–"}
                    </td>
                    <td className="py-3">
                      <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${badge.cls}`}>
                        {badge.label}
                      </span>
                      {m.resultStatus === "mismatch" && (
                        <span className="ml-1.5 text-xs font-medium rounded-sm px-2 py-0.5 bg-signal-error/15 text-signal-error">
                          Strittig
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <Link
                        href={`/admin/update-match/${m._id}`}
                        className="inline-flex items-center gap-1.5 text-xs border border-navy-600 hover:border-brand-500 text-mist-400 rounded-sm px-3 py-1.5"
                      >
                        <PiPencilSimpleBold /> Bearbeiten
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
