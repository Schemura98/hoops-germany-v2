"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  PiBellBold,
  PiUserPlusBold,
  PiUsersBold,
  PiCheckCircleBold,
  PiBasketballBold,
  PiWarningBold,
  PiArrowsLeftRightBold,
  PiHeartFill,
  PiChatCircleBold,
  PiArrowBendUpLeftBold,
  PiAtBold,
  PiEnvelopeOpenBold,
  PiCheckBold,
  PiXBold,
  PiChartLineUpBold,
} from "react-icons/pi";
import { getPlayerToken, getStoredPlayer } from "@/lib/clientAuth";
import { notificationHref } from "@/lib/notifications";
import { trackEvent } from "@/lib/trackEvent";
import { timeAgo } from "@/lib/timeAgo";
import Reveal from "@/components/ui/Reveal";

const ICON = {
  follow: PiUserPlusBold,
  join_request: PiUsersBold,
  join_approved: PiCheckCircleBold,
  member_joined: PiUserPlusBold,
  team_invite: PiEnvelopeOpenBold,
  match_result: PiBasketballBold,
  own_stats: PiChartLineUpBold,
  pending_result: PiBasketballBold,
  result_mismatch: PiWarningBold,
  transfer: PiArrowsLeftRightBold,
  post_like: PiHeartFill,
  post_comment: PiChatCircleBold,
  comment_reply: PiArrowBendUpLeftBold,
  mention: PiAtBold,
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

  // Klick auf eine Benachrichtigung. Für „Deine Zahlen stehen" zusätzlich messen,
  // ob die Nachricht wirklich geöffnet wird (Gegenstück zu `own_stats_notified`).
  function handleOpenNotification(n) {
    setOpen(false);
    if (n.type === "own_stats" && n.matchId) {
      trackEvent("own_stats_opened", `/match/${n.matchId}`);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="p-2 -m-1 text-paper-50/80 hover:text-brand-400 transition-colors"
        aria-label="Benachrichtigungen"
      >
        <span className="relative block">
          <PiBellBold className="text-lg" />
          {unread > 0 && (
            <Reveal
              key={unread}
              as="span"
              direction="pop"
              duration={200}
              className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-brand-500 text-navy-950 text-[10px] font-bold flex items-center justify-center"
            >
              {unread > 9 ? "9+" : unread}
            </Reveal>
          )}
        </span>
      </button>

      {open && (
        <>
          {/* Klick-außerhalb-Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="fixed left-2 right-2 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 max-h-[70vh] sm:max-h-96 overflow-y-auto bg-navy-800 rounded-md border border-navy-600 z-50">
            <div className="px-4 py-3 border-b border-navy-600">
              <h3 className="text-sm font-semibold text-paper-50">Benachrichtigungen</h3>
            </div>

            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-mist-400">
                Keine Benachrichtigungen.
              </p>
            ) : (
              <ul className="divide-y divide-navy-600">
                {items.map((n) => {
                  const Icon = ICON[n.type] || PiBellBold;
                  const isInvite = n.type === "team_invite";
                  const href = isInvite ? null : notificationHref(n, me);
                  const status = isInvite ? responded[String(n.teamId)] : null;
                  const busy = isInvite && respondingTeam === String(n.teamId);
                  const inner = (
                    <div
                      className={`flex gap-3 px-4 py-3 ${
                        n.read ? "" : "bg-brand-500/50"
                      } ${href ? "hover:bg-navy-700" : ""}`}
                    >
                      <span className="h-8 w-8 flex-shrink-0 rounded-full bg-brand-500/15 text-brand-400 flex items-center justify-center">
                        <Icon className="text-sm" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-paper-50">{n.message}</p>
                        <p className="text-xs text-mist-400 mt-0.5">{timeAgo(n.createdAt)}</p>

                        {/* Kader-Einladung: annehmen / ablehnen */}
                        {isInvite && (
                          status ? (
                            <p
                              className={`mt-2 text-xs font-semibold ${
                                status === "accepted" ? "text-signal-ok" : "text-mist-400"
                              }`}
                            >
                              {status === "accepted" ? "✓ Angenommen" : "Abgelehnt"}
                            </p>
                          ) : (
                            <div className="mt-2 flex items-center gap-2">
                              <button
                                onClick={() => respondInvite(n, true)}
                                disabled={busy}
                                className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-400 disabled:opacity-60 text-navy-950 rounded-sm px-3 py-1.5 text-xs font-semibold"
                              >
                                <PiCheckBold className="text-[10px]" /> Annehmen
                              </button>
                              <button
                                onClick={() => respondInvite(n, false)}
                                disabled={busy}
                                className="inline-flex items-center gap-1.5 border border-navy-600 hover:border-navy-500 text-mist-400 rounded-sm px-3 py-1.5 text-xs font-medium"
                              >
                                <PiXBold className="text-[10px]" /> Ablehnen
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
                        <Link href={href} onClick={() => handleOpenNotification(n)}>
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
