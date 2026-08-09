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
  FaExclamationTriangle,
  FaExchangeAlt,
  FaHeart,
  FaRegComment,
  FaReply,
  FaAt,
  FaEnvelopeOpenText,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { getPlayerToken, getStoredPlayer } from "@/lib/clientAuth";
import { notificationHref } from "@/lib/notifications";
import { timeAgo } from "@/lib/timeAgo";

const ICON = {
  follow: FaUserPlus,
  join_request: FaUsers,
  join_approved: FaCheckCircle,
  member_joined: FaUserPlus,
  team_invite: FaEnvelopeOpenText,
  match_result: FaBasketballBall,
  pending_result: FaBasketballBall,
  result_mismatch: FaExclamationTriangle,
  transfer: FaExchangeAlt,
  post_like: FaHeart,
  post_comment: FaRegComment,
  comment_reply: FaReply,
  mention: FaAt,
};

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [respondingTeam, setRespondingTeam] = useState(null);
  const [responded, setResponded] = useState({}); // teamId -> "accepted" | "declined"

  async function respondInvite(n, accept) {
    if (!n.teamId) return;
    setRespondingTeam(String(n.teamId));
    try {
      const token = getPlayerToken();
      await axios.post("/api/team/respond-invite", { token, teamId: n.teamId, accept });
      setResponded((r) => ({ ...r, [String(n.teamId)]: accept ? "accepted" : "declined" }));
      load();
    } catch {
      /* Fehler ignorieren – Einladung evtl. nicht mehr gültig */
      load();
    } finally {
      setRespondingTeam(null);
    }
  }

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

  const me = getStoredPlayer();

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="p-2 -m-1 text-white/80 hover:text-orange-400 transition-colors"
        aria-label="Benachrichtigungen"
      >
        <span className="relative block">
          <FaBell className="text-lg" />
          {unread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </span>
      </button>

      {open && (
        <>
          {/* Klick-außerhalb-Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="fixed left-2 right-2 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 max-h-[70vh] sm:max-h-96 overflow-y-auto bg-white rounded-2xl shadow-lg border border-gray-100 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Benachrichtigungen</h3>
            </div>

            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500">
                Keine Benachrichtigungen.
              </p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {items.map((n) => {
                  const Icon = ICON[n.type] || FaBell;
                  const isInvite = n.type === "team_invite";
                  const href = isInvite ? null : notificationHref(n, me);
                  const status = isInvite ? responded[String(n.teamId)] : null;
                  const busy = isInvite && respondingTeam === String(n.teamId);
                  const inner = (
                    <div
                      className={`flex gap-3 px-4 py-3 ${
                        n.read ? "" : "bg-brand-50/50"
                      } ${href ? "hover:bg-gray-50" : ""}`}
                    >
                      <span className="h-8 w-8 flex-shrink-0 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
                        <Icon className="text-sm" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-800">{n.message}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{timeAgo(n.createdAt)}</p>

                        {/* Kader-Einladung: annehmen / ablehnen */}
                        {isInvite && (
                          status ? (
                            <p
                              className={`mt-2 text-xs font-semibold ${
                                status === "accepted" ? "text-green-600" : "text-gray-500"
                              }`}
                            >
                              {status === "accepted" ? "✓ Angenommen" : "Abgelehnt"}
                            </p>
                          ) : (
                            <div className="mt-2 flex items-center gap-2">
                              <button
                                onClick={() => respondInvite(n, true)}
                                disabled={busy}
                                className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-3 py-1.5 text-xs font-semibold"
                              >
                                <FaCheck className="text-[10px]" /> Annehmen
                              </button>
                              <button
                                onClick={() => respondInvite(n, false)}
                                disabled={busy}
                                className="inline-flex items-center gap-1.5 border border-gray-300 hover:border-gray-400 text-gray-600 rounded-lg px-3 py-1.5 text-xs font-medium"
                              >
                                <FaTimes className="text-[10px]" /> Ablehnen
                              </button>
                            </div>
                          )
                        )}
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
