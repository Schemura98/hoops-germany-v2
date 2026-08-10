"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaUsers, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
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
      <main className="min-h-screen flex items-center justify-center">
        <Loading />
      </main>
    );
  }

  if (state === "notfound") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900">Tryout nicht gefunden</h1>
          <Link href="/tryouts" className="mt-4 text-brand-600 hover:underline">
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <PageHeader eyebrow="Probetraining" title={`Tryout bei ${team?.teamName || "Team"}`} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* Team */}
          <Link
            href={team?.slug ? `/team/team-detail/${team.slug}` : "#"}
            className="flex items-center gap-3"
          >
            {team?.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={team.logo} alt="" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <span className="h-12 w-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
                <FaUsers />
              </span>
            )}
            <div>
              <p className="font-semibold text-gray-900">{team?.teamName}</p>
              {team?.region && <p className="text-xs text-gray-500">{team.region}</p>}
            </div>
          </Link>

          <div className="mt-5 space-y-2 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <FaCalendarAlt className="text-gray-500" /> {formatDate(tryout.date)}
            </p>
            {tryout.location && (
              <p className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-gray-500" /> {tryout.location}
              </p>
            )}
            <p className="flex items-center gap-2">
              <FaUsers className="text-gray-500" /> {tryout.applicantCount} Bewerber
            </p>
          </div>

          {tryout.positions?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Gesuchte Positionen</p>
              <div className="flex flex-wrap gap-1">
                {tryout.positions.map((p) => (
                  <span
                    key={p}
                    className="text-xs font-medium bg-brand-50 text-brand-700 rounded-full px-2 py-0.5"
                  >
                    {positionLabel(p)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {tryout.description && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Beschreibung</p>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {tryout.description}
              </p>
            </div>
          )}

          {/* Bewerben */}
          <div className="mt-6">
            {applyMsg ? (
              <div
                className={`rounded-lg border px-4 py-3 text-sm ${
                  applyMsg.type === "ok"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {applyMsg.text}
              </div>
            ) : closed ? (
              <p className="text-sm text-gray-500">Dieses Tryout ist geschlossen.</p>
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
      </main>

      <Footer />
    </div>
  );
}
