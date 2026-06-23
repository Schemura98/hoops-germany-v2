"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaUsers, FaBasketballBall } from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";

export default function LigaDetailPage({ params }) {
  const id = params.id;
  const [data, setData] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | notfound

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await axios.get(`/api/leagues/${id}`);
        if (active) {
          setData(res.data);
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

  if (state === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <FaBasketballBall className="text-brand-500 text-3xl animate-bounce" />
      </main>
    );
  }

  if (state === "notfound") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900">Liga nicht gefunden</h1>
          <Link href="/ligen" className="mt-4 text-brand-600 hover:underline">
            Zurück zur Liga-Übersicht
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const { league, standings } = data;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <PageHeader eyebrow="Liga-Tabelle" title={league.name} subtitle={league.season} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 text-left border-b border-gray-100">
                  <th className="font-medium py-3 pl-4 w-8">#</th>
                  <th className="font-medium py-3">Team</th>
                  <th className="font-medium py-3 text-center w-12">Sp</th>
                  <th className="font-medium py-3 text-center w-10">S</th>
                  <th className="font-medium py-3 text-center w-10">N</th>
                  <th className="font-medium py-3 text-center w-16 pr-4">Diff</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, i) => (
                  <tr
                    key={s.teamId}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                  >
                    <td className="py-3 pl-4 font-semibold text-gray-400">{i + 1}</td>
                    <td className="py-3">
                      <Link
                        href={`/team/team-detail/${s.slug}`}
                        className="flex items-center gap-2 font-medium text-gray-900 hover:text-brand-600"
                      >
                        {s.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.logo} alt="" className="h-6 w-6 rounded-full object-cover" />
                        ) : (
                          <span className="h-6 w-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
                            <FaUsers className="text-[10px]" />
                          </span>
                        )}
                        <span className="truncate">{s.teamName}</span>
                      </Link>
                    </td>
                    <td className="py-3 text-center text-gray-600">{s.games}</td>
                    <td className="py-3 text-center text-gray-600">{s.wins}</td>
                    <td className="py-3 text-center text-gray-600">{s.losses}</td>
                    <td
                      className={`py-3 text-center font-medium pr-4 ${
                        s.diff > 0 ? "text-green-600" : s.diff < 0 ? "text-red-600" : "text-gray-500"
                      }`}
                    >
                      {s.diff > 0 ? `+${s.diff}` : s.diff}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {standings.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-gray-400">
              Noch keine Teams in dieser Liga.
            </p>
          )}
        </div>

        <p className="mt-3 text-xs text-gray-400">
          Sp = Spiele · S = Siege · N = Niederlagen · Diff = Korbdifferenz. Tabelle aus
          bestätigten Ergebnissen.
        </p>
      </main>

      <Footer />
    </div>
  );
}
