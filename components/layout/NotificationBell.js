"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  FaBell,
  FaUserPlus,
  FaUsers,
  FaCheckCircle,
  FaBasketballBall,
} from "react-icons/fa";
import { getPlayerToken } from "@/lib/clientAuth";
import { timeAgo } from "@/lib/timeAgo";

const ICON = {
  follow: FaUserPlus,
  join_request: FaUsers,
  join_approved: FaCheckCircle,
  match_result: FaBasketballBall,
  pending_result: FaBasketballBall,
};

function targetHref(n) {
  if (n.teamSlug) return `/team/team-detail/${n.teamSlug}`;
  if (n.type === "follow" && n.fromPlayerId) {
    return `/player/view-player/${n.fromPlayerId}`;
  }
  return null;
}

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  async function load() {
    try {
      const token = getPlayerToken();
      if (!token) return;
      const { data } = await axios.post("/api/player/getnotifications", { token });
      setItems(data.notifications || []);
      setUnread(data.unreadCount || 0);
    } catch {
      /* ignorieren */
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      // Beim Öffnen als gelesen markieren
      setUnread(0);
      setItems((list) => list.map((n) => ({ ...n, read: true })));
      try {
        const token = getPlayerToken();
        await axios.post("/api/player/marknotificationsread", { token });
      } catch {
        /* ignorieren */
      }
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="relative text-gray-400 hover:text-brand-600 transition-colors"
        aria-label="Benachrichtigungen"
      >
        <FaBell className="text-lg" />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Klick-außerhalb-Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-2xl shadow-lg border border-gray-100 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Benachrichtigungen</h3>
            </div>

            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">
                Keine Benachrichtigungen.
              </p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {items.map((n) => {
                  const Icon = ICON[n.type] || FaBell;
                  const href = targetHref(n);
                  const inner = (
                    <div
                      className={`flex gap-3 px-4 py-3 ${
                        n.read ? "" : "bg-brand-50/50"
                      } ${href ? "hover:bg-gray-50" : ""}`}
                    >
                      <span className="h-8 w-8 flex-shrink-0 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
                        <Icon className="text-sm" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-800">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                  return (
                    <li key={n._id}>
                      {href ? (
                        <Link href={href} onClick={() => setOpen(false)}>
                          {inner}
                        </Link>
                      ) : (
                        inner
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
