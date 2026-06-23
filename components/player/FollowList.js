"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import Avatar from "@/components/posts/Avatar";

function PlayerRow({ p }) {
  return (
    <Link
      href={`/player/view-player/${p.slug || p._id}`}
      className="flex items-center gap-3 py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2"
    >
      <Avatar player={p} className="h-9 w-9" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {p.firstName} {p.lastName}
        </p>
        <p className="text-xs text-gray-500">{p.position || "Position offen"}</p>
      </div>
    </Link>
  );
}

// Zeigt Follower-/Folgt-Zahlen mit aufklappbaren Listen.
export default function FollowList({ playerId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(null); // null | "followers" | "following"

  useEffect(() => {
    if (!playerId) {
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await axios.post("/api/player/getfollowlist", { playerId });
        if (active) setData(res.data);
      } catch {
        if (active) setData(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [playerId]);

  if (loading || !data) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-16 animate-pulse" />
    );
  }

  function toggle(which) {
    setTab((t) => (t === which ? null : which));
  }

  const list = tab === "followers" ? data.followers : tab === "following" ? data.following : [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex">
        <button
          onClick={() => toggle("followers")}
          className={`flex-1 text-center py-1.5 rounded-lg transition-colors ${
            tab === "followers" ? "bg-brand-50 text-brand-700" : "hover:bg-gray-50"
          }`}
        >
          <span className="block text-lg font-bold text-gray-900">{data.followersCount}</span>
          <span className="block text-xs text-gray-500">Follower</span>
        </button>
        <button
          onClick={() => toggle("following")}
          className={`flex-1 text-center py-1.5 rounded-lg transition-colors ${
            tab === "following" ? "bg-brand-50 text-brand-700" : "hover:bg-gray-50"
          }`}
        >
          <span className="block text-lg font-bold text-gray-900">{data.followingCount}</span>
          <span className="block text-xs text-gray-500">Folgt</span>
        </button>
      </div>

      {tab && (
        <div className="mt-3 border-t border-gray-100 pt-2">
          {list.length === 0 ? (
            <p className="text-sm text-gray-400 py-2 text-center">
              {tab === "followers" ? "Noch keine Follower." : "Folgt noch niemandem."}
            </p>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              {list.map((p) => (
                <PlayerRow key={p._id} p={p} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
