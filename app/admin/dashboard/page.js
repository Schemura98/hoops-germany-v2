"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaUsers, FaUserFriends, FaBasketballBall, FaTrophy, FaCommentDots } from "react-icons/fa";
import AdminShell from "@/components/layout/AdminShell";
import { getAdminToken } from "@/lib/clientAuth";

function StatCard({ icon: Icon, label, value, href }) {
  const inner = (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <Icon className="text-brand-500 text-xl" />
      <p className="mt-3 text-2xl font-bold text-gray-900">{value ?? "—"}</p>
      <p className="text-sm text-gray-500">{label}</p>
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
        <StatCard icon={FaUserFriends} label="Spieler" value={stats.players} href="/admin/players" />
        <StatCard icon={FaUsers} label="Teams" value={stats.teams} href="/admin/teams" />
        <StatCard icon={FaBasketballBall} label="Spiele" value={stats.matches} />
        <StatCard icon={FaTrophy} label="Ligen" value={stats.leagues} />
        <StatCard icon={FaCommentDots} label="Neues Feedback" value={stats.feedbackNew} href="/admin/feedback" />
      </div>
    </AdminShell>
  );
}
