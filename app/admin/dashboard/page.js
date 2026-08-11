"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { PiUsersBold, PiUsersThreeBold, PiBasketballBold, PiTrophyBold, PiChatCircleDotsBold } from "react-icons/pi";
import AdminShell from "@/components/layout/AdminShell";
import { getAdminToken } from "@/lib/clientAuth";

function StatCard({ icon: Icon, label, value, href }) {
  const inner = (
    <div className="bg-ink-800 rounded-md border border-ink-600 p-5 transition-shadow">
      <Icon className="text-brand-400 text-xl" />
      <p className="mt-3 text-2xl font-bold text-paper-50">{value ?? "—"}</p>
      <p className="text-sm text-mist-400">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const token = getAdminToken();
        const { data } = await axios.post("/api/admin/stats", { token });
        setStats(data.stats || {});
      } catch {
        /* ignorieren */
      }
    })();
  }, []);

  return (
    <AdminShell title="Übersicht">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={PiUsersThreeBold} label="Spieler" value={stats.players} href="/admin/players" />
        <StatCard icon={PiUsersBold} label="Teams" value={stats.teams} href="/admin/teams" />
        <StatCard icon={PiBasketballBold} label="Spiele" value={stats.matches} />
        <StatCard icon={PiTrophyBold} label="Ligen" value={stats.leagues} />
        <StatCard icon={PiChatCircleDotsBold} label="Neues Feedback" value={stats.feedbackNew} href="/admin/feedback" />
      </div>
    </AdminShell>
  );
}
