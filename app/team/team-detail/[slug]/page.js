"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaUsers, FaMapMarkerAlt, FaBasketballBall } from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FollowButton from "@/components/FollowButton";
import { getPlayerToken } from "@/lib/clientAuth";

const SLOT_BADGE = {
  pending: { label: "Ausstehend", cls: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Bestätigt", cls: "bg-green-100 text-green-700" },
};

export default function TeamTeamDetailSlugPage({ params }) {
  const slug = params.slug;

  const [data, setData] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | notfound
  const [loggedIn, setLoggedIn] = useState(false);

  const [joining, setJoining] = useState(false);
  const [joinMsg, setJoinMsg] = useState(null);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    setLoggedIn(!!getPlayerToken());
    let active = true;
    (async () => {
      try {
        const res = await axios.post("/api/team/fetchsingleteaminfo", { slug });
        if (active) {
          setData(res.data);
          setFollowerCount(res.data.team.followersCount || 0);
          setState("ready");
        }
      } catch {
        if (active) setState("notfound");
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  async function join() {
    setJoining(true);
    setJoinMsg(null);
    try {
      const token = getPlayerToken();
      const res = await axios.post("/api/team/requestjoin", {
        token,
        teamId: data.team._id,
      });
      setJoinMsg({ type: "ok", text: res.data.message });
    } catch (err) {
      setJoinMsg({
        type: "err",
        text: err.response?.data?.message || "Anfrage fehlgeschlagen.",
      });
    } finally {
      setJoining(false);
    }
  }

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
          <h1 className="text-xl font-bold text-gray-900">Team nicht gefunden</h1>
          <Link href="/teams" className="mt-4 text-brand-600 hover:underline">
            Zurück zur Team-Übersicht
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const { team, members } = data;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {/* Banner + Kopf */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-brand-400 to-brand-600">
            {team.banner && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={team.banner} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10">
              {team.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={team.logo}
                  alt={team.teamName}
                  className="h-20 w-20 rounded-2xl object-cover border-4 border-white bg-white"
                />
              ) : (
                <span className="h-20 w-20 rounded-2xl bg-brand-100 text-brand-600 text-2xl flex items-center justify-center border-4 border-white">
                  <FaUsers />
                </span>
              )}
              <div className="pb-1">
                <h1 className="text-2xl font-bold text-gray-900">{team.teamName}</h1>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  {team.region && (
                    <span className="flex items-center gap-1">
                      <FaMapMarkerAlt /> {team.region}
                    </span>
                  )}
                  <span>{followerCount} Follower</span>
                </div>
              </div>
            </div>

            {team.about && (
              <p className="mt-4 text-sm text-gray-600 whitespace-pre-line">{team.about}</p>
            )}

            {/* Folgen + Beitreten */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <FollowButton
                type="team"
                targetId={team._id}
                onCountChange={setFollowerCount}
              />
              {joinMsg ? (
                <div
                  className={`rounded-lg border px-4 py-3 text-sm ${
                    joinMsg.type === "ok"
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  {joinMsg.text}
                </div>
              ) : loggedIn ? (
                <button
                  onClick={join}
                  disabled={joining}
                  className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
                >
                  {joining ? "Senden…" : "Team beitreten"}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="inline-block border border-gray-300 hover:border-brand-500 text-gray-700 rounded-lg px-5 py-2.5 text-sm font-medium"
                >
                  Zum Beitreten anmelden
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Kader */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Kader</h2>

          {team.rosterSlots.length === 0 && members.length === 0 ? (
            <p className="text-sm text-gray-500">Noch keine Kaderinformationen.</p>
          ) : (
            <div className="space-y-2">
              {team.rosterSlots.map((slot) => {
                const badge = SLOT_BADGE[slot.status];
                return (
                  <div
                    key={slot._id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold flex items-center justify-center">
                        {slot.number || "–"}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {slot.name || "Unbenannt"}
                        </p>
                        <p className="text-xs text-gray-500">{slot.position || "—"}</p>
                      </div>
                    </div>
                    {badge && (
                      <span className={`text-xs font-medium rounded-full px-3 py-1 ${badge.cls}`}>
                        {badge.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
