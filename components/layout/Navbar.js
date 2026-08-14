"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  PiMagnifyingGlassBold,
  PiBellBold,
  PiXBold,
  PiListBold,
  PiUserBold,
  PiUsersBold,
  PiShieldCheckBold,
  PiTrophyBold,
  PiBasketballBold,
  PiCalendarBlankBold,
  PiCaretDownBold,
  PiNewspaperClippingBold,
  PiArrowsLeftRightBold,
  PiMegaphoneBold,
  PiRankingBold,
} from "react-icons/pi";
import {
  getPlayerToken,
  clearPlayerToken,
  clearTeamToken,
  clearAdminToken,
  setStoredPlayer,
} from "@/lib/clientAuth";
import useMenuHoehe from "@/lib/useMenuHoehe";
import { timeAgo } from "@/lib/timeAgo";
import { notificationHref, GLOCKE_LEER } from "@/lib/notifications";
import { trackEvent } from "@/lib/trackEvent";
import Avatar from "@/components/Avatar";
import DemoBadge from "@/components/DemoBadge";
import Reveal from "@/components/ui/Reveal";
import FeedbackLink from "@/components/layout/FeedbackLink";

// Öffentliche, login-bewusste Navigation auf navy-900 mit Wortmarken-Logo.
// Der aktive Punkt wird durch die 2px-Brand-Leiste markiert – dasselbe Signal
// wie am aktiven Tab (visuelle Richtung „Anzeigetafel", Abschnitt 4).
// Saubere Neuimplementierung in v2-Architektur (Original-Design, ohne Altlasten).
//
// Struktur statt Länge (13.08.2026, Ronjas Befund R7/K8):
// Die Leiste hatte sieben gleichrangige Punkte – und /rangliste kam trotzdem
// nicht vor. Ein achter Punkt wäre die billige Antwort gewesen. Stattdessen:
//   • Topscorer (Spieler) und Rangliste (Teams) sind EIN Gedanke – sie heißen
//     jetzt gemeinsam „Bestenlisten" und teilen sich einen Navigationspunkt.
//     Der Umschalter auf beiden Seiten (components/ui/Tabs) macht die jeweils
//     andere Liste sichtbar; deshalb ist der Punkt auch auf /rangliste aktiv.
//   • Im Mobil-Menü tragen die Punkte Gruppentitel. Eine senkrechte Liste kann
//     sich das leisten, und aus einer Wand aus sieben Zeilen werden drei kurze.
// Ergebnis: gleich viele Punkte wie vorher, eine erreichbare Seite mehr.
//
const NAV_GRUPPEN = [
  {
    titel: "Wettbewerb",
    links: [
      { href: "/ligen", label: "Ligen", icon: PiTrophyBold },
      { href: "/spiele", label: "Spiele", icon: PiCalendarBlankBold },
      {
        href: "/topscorer",
        label: "Bestenlisten",
        icon: PiRankingBold,
        auchAktivAuf: ["/rangliste"],
      },
    ],
  },
  {
    titel: "Wer spielt",
    links: [
      { href: "/teams", label: "Teams", icon: PiUsersBold },
      { href: "/spieler", label: "Spieler", icon: PiUserBold },
    ],
  },
  {
    titel: "Wechseln",
    links: [
      { href: "/transfermarkt", label: "Transfermarkt", icon: PiArrowsLeftRightBold },
      { href: "/tryouts", label: "Tryouts", icon: PiMegaphoneBold },
    ],
  },
];

const PUBLIC_LINKS = NAV_GRUPPEN.flatMap((g) => g.links);

export default function Navbar() {
  const [me, setMe] = useState(null); // null = unbekannt/ausgeloggt
  const [checked, setChecked] = useState(false);

  // Suche
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [searchData, setSearchData] = useState(null); // {players, teams}
  const searchInputRef = useRef(null);

  // Benachrichtigungen
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const notifRef = useRef(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);
  const menuMaxHoehe = useMenuHoehe(menuRef, mobileOpen);

  const isLoggedIn = !!me;

  const pathname = usePathname();
  // Aktive Seite markieren (exakt oder als Unterpfad).
  const isActive = (href) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  // Ein Punkt kann für mehrere Seiten stehen („Bestenlisten" = Topscorer + Rangliste).
  const linkAktiv = (l) =>
    isActive(l.href) || (l.auchAktivAuf || []).some((h) => isActive(h));
  // Klassen-Helfer (konsistente Borders → kein Layout-Shift zwischen aktiv/inaktiv).
  // `shrink-0 whitespace-nowrap` (13.08.2026, Fund von Tobias): Eingeloggt
  // traegt die oeffentliche Leiste zusaetzlich Feed, Team-Admin, Mein Team und
  // Mein Profil — elf Punkte. Ohne diese beiden Klassen schrumpften die
  // Beschriftungen und brachen zweizeilig um („Team-Admin", „Mein Team", „Mein
  // Profil"), waehrend die Nachbarn einzeilig blieben. Ausgeloggt faellt es
  // nicht auf, weil dort vier Punkte weniger stehen.
  const deskClassAktiv = (aktiv) =>
    `shrink-0 whitespace-nowrap text-sm transition-colors border-b-2 pb-0.5 ${
      aktiv
        ? "text-paper-50 font-semibold border-brand-500"
        : "text-mist-300 hover:text-paper-50 border-transparent"
    }`;
  const deskClass = (href) => deskClassAktiv(isActive(href));
  // Dieselbe Regel wie oben — dieser Punkt traegt zusaetzlich ein Symbol und
  // brach als einziger noch zweizeilig um.
  const deskAdminClass = (href) =>
    `flex shrink-0 whitespace-nowrap items-center gap-1.5 text-sm font-medium border-b-2 pb-0.5 ${
      isActive(href)
        ? "text-brand-300 border-brand-500"
        : "text-brand-400 hover:text-brand-300 border-transparent"
    }`;
  const mobClassAktiv = (aktiv) =>
    `flex items-center gap-3 px-5 py-3.5 border-l-4 transition-colors ${
      aktiv
        ? "bg-navy-800 text-paper-50 border-brand-500"
        : "text-paper-50 hover:bg-navy-700 border-transparent"
    }`;
  const mobClass = (href) => mobClassAktiv(isActive(href));
  const mobAdminClass = (href) =>
    `flex items-center gap-3 px-5 py-3.5 border-l-4 transition-colors ${
      isActive(href)
        ? "bg-navy-800 text-brand-300 border-brand-500"
        : "text-brand-400 hover:bg-navy-700 border-transparent"
    }`;

  // Eigenes Profil + Benachrichtigungen laden
  useEffect(() => {
    const token = getPlayerToken();
    if (!token) {
      setChecked(true);
      return;
    }
    let active = true;
    (async () => {
      try {
        const { data } = await axios.post("/api/player/getmyinfo", { token });
        if (active) setMe(data.player || null);
        // Den vollstaendigen Spieler auch zurueckschreiben: Die Anmelde-Antwort
        // enthaelt kein `teamId`, und bislang reicherte nur `useCurrentPlayer`
        // den Zwischenspeicher an. Seiten, die ihn nur lesen (z.B. die
        // Liga-Tabelle fuer die eigene Zeile), standen deshalb ohne Team da,
        // wenn sie die erste Seite nach dem Anmelden waren (Befund Tobias,
        // 12.08.2026). Die Navbar laeuft auf jeder Seite - hier gehoert es hin.
        if (active && data.player) setStoredPlayer(data.player);
      } catch {
        if (active) setMe(null);
      } finally {
        if (active) setChecked(true);
      }
      try {
        const { data } = await axios.post("/api/player/getnotifications", { token });
        if (active) {
          setNotifs(data.notifications || []);
          setUnread(data.unreadCount || 0);
        }
      } catch {
        /* ignorieren */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Klick außerhalb schließt Dropdowns
  useEffect(() => {
    const onClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function logout() {
    clearPlayerToken();
    clearTeamToken();
    clearAdminToken();
    window.location.href = "/";
  }

  const openSearch = useCallback(async () => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
    if (!searchData) {
      try {
        // Ligen sind seit 13.08.2026 mit dabei (Ronjas R8). Vorher fand die
        // Suche Spieler und Teams, aber keine Liga – ausgerechnet der Begriff,
        // den ein Vereinsspieler am ehesten eintippt („Bezirksliga", „Kreis
        // Niers"). Der Katalog ist mit 57 offiziellen Einträgen klein genug,
        // um wie Spieler und Teams einmal geladen und im Browser gefiltert zu
        // werden.
        const [p, t, l] = await Promise.all([
          axios.post("/api/player/fetchall"),
          axios.post("/api/team/fetchteams"),
          axios.get("/api/leagues"),
        ]);
        setSearchData({
          players: p.data.players || [],
          teams: t.data.teams || [],
          leagues: l.data.leagues || l.data || [],
        });
      } catch {
        setSearchData({ players: [], teams: [], leagues: [] });
      }
    }
  }, [searchData]);

  // Filterung als reine Funktion, damit sie aus zwei Richtungen aufrufbar ist:
  // beim Tippen UND sobald die Daten nachträglich eintreffen (s. Effekt unten).
  function trefferBerechnen(term, daten) {
    if (!term || !daten) return [];
    const q = term.toLowerCase();
    const players = (daten.players || [])
      .filter((p) => `${p.firstName} ${p.lastName}`.toLowerCase().includes(q))
      .slice(0, 5)
      .map((p) => ({ ...p, _type: "player" }));
    const teams = (daten.teams || [])
      .filter((t) => t.teamName?.toLowerCase().includes(q))
      .slice(0, 3)
      .map((t) => ({ ...t, _type: "team" }));
    // Auch Region und Spielklasse durchsuchen: Wer „Niers" oder „Bezirksliga"
    // eintippt, meint eine Liga, kennt aber selten ihren vollen Namen.
    const leagues = (daten.leagues || [])
      .filter((l) =>
        [l.name, l.region, l.bundesland, l.level, l.season]
          .filter(Boolean)
          .some((feld) => String(feld).toLowerCase().includes(q)),
      )
      .slice(0, 3)
      .map((l) => ({ ...l, _type: "league" }));
    return [...players, ...teams, ...leagues];
  }

  function onSearchChange(e) {
    const term = e.target.value;
    setSearchTerm(term);
    setResults(trefferBerechnen(term, searchData));
  }

  // Nachfiltern, sobald die Daten da sind (Fund beim Schreiben des E2E-Tests
  // am 14.08.2026). Die Suche lädt Spieler, Teams und Ligen erst beim Öffnen –
  // wer sofort lostippt, tat das gegen ein leeres `searchData`. Der alte
  // Zweig `if (!searchData) { setResults([]); return; }` verwarf die Eingabe
  // dann stillschweigend, und da danach nichts mehr neu filterte, blieb es bei
  // „Keine Ergebnisse", bis man ein weiteres Zeichen tippte. Genau der
  // schnelle Tipper – jemand, der weiß, wonach er sucht – bekam also die
  // Antwort „gibt es nicht" auf etwas, das es gibt.
  useEffect(() => {
    if (!searchOpen || !searchData || !searchTerm) return;
    setResults(trefferBerechnen(searchTerm, searchData));
    // Absichtlich nur an `searchData`/`searchTerm`: Beim Tippen erledigt das
    // schon `onSearchChange`, dieser Effekt fängt nur das Nachladen ab.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchData, searchTerm, searchOpen]);

  function closeSearch() {
    setSearchOpen(false);
    setSearchTerm("");
    setResults([]);
  }

  // Escape schließt die Suche (Gate-Befund 13.08.2026, nachgezogen am 14.08.).
  // Vorher führte aus dem Overlay genau ein Weg heraus: das kleine ×. Wer
  // reflexhaft Escape drückt – und das tut jeder, der einmal eine Suche in
  // einem Browser oder Editor benutzt hat – blieb im Dialog stehen und hielt
  // ihn für hängend. Für Tastaturnutzer war das ein echter Ausweg-Mangel, kein
  // Komfortthema. Der Effekt hängt nur an `searchOpen`, der Listener existiert
  // also ausschließlich, solange das Overlay offen ist.
  useEffect(() => {
    if (!searchOpen) return;
    // `closeSearch` aufrufen statt seinen Rumpf zu kopieren (Befund A12 von
    // Kai): Zwei Stellen mit derselben Aufgabe laufen irgendwann auseinander –
    // genau der Defekt, den `GLOCKE_LEER` im selben Commit für die Glocke
    // behebt. `closeSearch` ist eine Funktionsdeklaration (hoisted) und ruft
    // nur Setter, die React stabil hält; eine veraltete Closure kann hier
    // nichts anrichten.
    function onKeyDown(e) {
      if (e.key === "Escape") closeSearch();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchOpen]);

  async function toggleNotif() {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next && unread > 0) {
      setUnread(0);
      setNotifs((list) => list.map((n) => ({ ...n, read: true })));
      try {
        const token = getPlayerToken();
        await axios.post("/api/player/marknotificationsread", { token });
      } catch {
        /* ignorieren */
      }
    }
  }

  const teamSlug = me?.team?.slug || null;
  const teamName = me?.team?.teamName || null;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-navy-900 text-paper-50 border-b border-navy-600">
        {/* `gap-4`: Ohne Mindestabstand stiessen Wortmarke und erster Punkt
            direkt aneinander („HOOPS GERMANYLigen"), sobald die eingeloggte
            Fassung die Leiste fuellt — justify-between verteilt nur den REST,
            es haelt keinen Abstand frei. */}
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img
              src="/images/logo.svg"
              alt="Hoops Germany"
              className="h-9 sm:h-11 w-auto object-contain"
            />
          </Link>

          {/* Desktop-Navigation */}
          <div className="hidden lg:flex items-center gap-5">
            {PUBLIC_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={linkAktiv(l) ? "page" : undefined}
                className={deskClassAktiv(linkAktiv(l))}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Aktionen rechts */}
          <div className="flex items-center gap-4">
            {/* Feedback fest im Chrome statt als schwebender Knopf – Herkunft
                und Begründung in components/layout/FeedbackLink.js. */}
            <FeedbackLink />
            <button
              onClick={openSearch}
              className="p-2 -m-1 text-paper-50 hover:text-brand-400 transition-colors"
              aria-label="Suche öffnen"
            >
              <PiMagnifyingGlassBold className="w-5 h-5" />
            </button>

            {isLoggedIn && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={toggleNotif}
                  className="p-2 -m-1 text-paper-50 hover:text-brand-400 transition-colors"
                  aria-label="Benachrichtigungen"
                >
                  {/* Das innere `relative span` trägt jetzt den Bezugsrahmen des
                      Zählers, nicht mehr der Button: Sobald der Button Padding
                      für die Trefferfläche bekommt, säße ein am Button
                      verankertes Badge 8 px zu weit außen. So bleibt es am
                      Symbol kleben, wo es hingehört – dasselbe Muster wie in
                      components/layout/NotificationBell.js. */}
                  <span className="relative block">
                    <PiBellBold className="w-5 h-5" />
                    {unread > 0 && (
                      <Reveal
                        key={unread}
                        as="span"
                        direction="pop"
                        duration={200}
                        className="absolute -top-1.5 -right-1.5 bg-signal-error text-paper-50 text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center leading-none"
                      >
                        {unread > 9 ? "9+" : unread}
                      </Reveal>
                    )}
                  </span>
                </button>

                {notifOpen && (
                  <div className="fixed left-2 right-2 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-9 sm:w-80 bg-navy-800 border border-navy-600 rounded-md z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-navy-600">
                      <h3 className="font-bold text-paper-50 text-sm">Benachrichtigungen</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-navy-600">
                      {notifs.length === 0 ? (
                        <p className="px-4 py-8 text-center text-mist-400 text-sm">
                          {GLOCKE_LEER}
                        </p>
                      ) : (
                        notifs.map((n, i) => {
                          const href = notificationHref(n, me);
                          const inner = (
                            <div
                              className={`flex gap-3 px-4 py-3 ${n.read ? "" : "bg-brand-500/10"} ${
                                href ? "hover:bg-navy-700 transition-colors" : ""
                              }`}
                            >
                              <span className="h-8 w-8 flex-shrink-0 rounded-full bg-brand-500/15 text-brand-400 flex items-center justify-center">
                                <PiBasketballBold className="text-sm" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm text-paper-50 leading-snug">{n.message}</p>
                                <p className="text-xs text-mist-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                              </div>
                            </div>
                          );
                          return href ? (
                            <Link
                              key={n._id || i}
                              href={href}
                              onClick={() => {
                                setNotifOpen(false);
                                // „Deine Zahlen stehen" – Öffnen messen (Gegenstück
                                // zu `own_stats_notified`, s. lib/statsNotify.js).
                                if (n.type === "own_stats" && n.matchId) {
                                  trackEvent("own_stats_opened", `/match/${n.matchId}`);
                                }
                              }}
                            >
                              {inner}
                            </Link>
                          ) : (
                            <div key={n._id || i}>{inner}</div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Desktop: Login-State */}
            {checked && (
              <div className="hidden lg:flex items-center gap-4">
                {isLoggedIn ? (
                  <>
                    {me?.isSuperAdmin && (
                      <Link
                        href="/admin/dashboard"
                        aria-current={isActive("/admin/dashboard") ? "page" : undefined}
                        className={deskAdminClass("/admin/dashboard")}
                      >
                        <PiShieldCheckBold className="w-4 h-4" /> Admin
                      </Link>
                    )}
                    {me?.isTeamAdmin && !me?.isSuperAdmin && (
                      <Link
                        href="/team/admin"
                        aria-current={isActive("/team/admin") ? "page" : undefined}
                        className={deskAdminClass("/team/admin")}
                      >
                        <PiTrophyBold className="w-4 h-4" /> Team-Admin
                      </Link>
                    )}
                    {!me?.isTeamAdmin && !me?.isSuperAdmin && (
                      <Link
                        href="/team/create"
                        aria-current={isActive("/team/create") ? "page" : undefined}
                        className={deskClass("/team/create")}
                      >
                        Team gründen
                      </Link>
                    )}
                    {teamSlug && (
                      <Link
                        href={`/team/team-detail/${teamSlug}`}
                        aria-current={isActive(`/team/team-detail/${teamSlug}`) ? "page" : undefined}
                        className={deskClass(`/team/team-detail/${teamSlug}`)}
                        title={teamName || "Mein Team"}
                      >
                        Mein Team
                      </Link>
                    )}
                    <Link
                      href="/player/newsfeed"
                      aria-current={isActive("/player/newsfeed") ? "page" : undefined}
                      className={deskClass("/player/newsfeed")}
                    >
                      Feed
                    </Link>
                    <Link
                      href="/player/player-detail"
                      aria-current={isActive("/player/player-detail") ? "page" : undefined}
                      className={deskClass("/player/player-detail")}
                    >
                      Mein Profil
                    </Link>
                    <button
                      onClick={logout}
                      className="text-sm text-mist-300 hover:text-paper-50 transition-colors"
                    >
                      Abmelden
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      aria-current={isActive("/login") ? "page" : undefined}
                      className={deskClass("/login")}
                    >
                      Anmelden
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-brand-500 hover:bg-brand-400 text-navy-950 rounded-md px-4 py-1.5 text-sm font-semibold transition-colors"
                    >
                      Registrieren
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* Mobile-Toggle */}
            {/* `p-2 -m-1` wie bei den Nachbarn. Er war der letzte 20×20-Knopf
                dieser Leiste – und ausgerechnet der einzige Zugang zur
                gesamten mobilen Navigation auf öffentlichen Seiten (gemessen
                von Tobias, 14.08.2026). Er rutschte durch, weil die Prüfung
                Feedback, Lupe und Glocke abdeckte und ihn nicht; ein Test
                misst jetzt ALLE Icon-Knöpfe der Leiste, nicht eine Auswahl. */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 -m-1 text-paper-50 hover:text-brand-400 transition-colors"
              aria-label="Menü öffnen"
            >
              {mobileOpen ? <PiXBold className="w-5 h-5" /> : <PiListBold className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile-Menü. `max-h` + eigenes Scrollen (13.08.2026): Das Menü ist
            Teil der Sticky-Leiste – ist es höher als der Viewport, kann der
            Seiten-Scroll seine unteren Zeilen NIE erreichen (sticky scrollt
            nicht mit). Eingeloggt war „Abmelden" auf kleinen Displays genau
            deshalb unerreichbar. Jetzt scrollt das Menü selbst.

            7rem statt 4rem (Fund von Tobias, 13.08.2026): Abgezogen wurden
            bisher nur die 64 px der Leiste. Der nicht schließbare
            Testphase-Banner steht bei Scroll 0 darüber und schiebt das Menü um
            45 px nach unten – die letzte Zeile („Feedback geben") stand
            dadurch 4,5 px im Bild und war per Touch nicht erreichbar, weil
            `overscroll-contain` die Weitergabe an die Seite blockt.
            Bewusst großzügig gerechnet: Fällt der Banner nach der Testphase
            weg, ist das Menü 48 px kürzer als möglich – das kostet etwas
            Innenscroll, aber nie eine unerreichbare Zeile. */}
        {mobileOpen && (
          <div
            ref={menuRef}
            style={menuMaxHoehe ? { maxHeight: menuMaxHoehe } : undefined}
            className="lg:hidden bg-navy-900 border-t border-navy-600 divide-y divide-navy-600/60 max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain"
          >
            {NAV_GRUPPEN.map((g) => (
              <div key={g.titel}>
                <p className="bg-navy-950 px-5 py-2 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-mist-600">
                  {g.titel}
                </p>
                <div className="divide-y divide-navy-600/60">
                  {g.links.map((l) => {
                    const Icon = l.icon;
                    const aktiv = linkAktiv(l);
                    return (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={() => setMobileOpen(false)}
                        aria-current={aktiv ? "page" : undefined}
                        className={mobClassAktiv(aktiv)}
                      >
                        <Icon className="text-brand-400 w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium">{l.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
            <p className="bg-navy-950 px-5 py-2 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-mist-600">
              {isLoggedIn ? "Mein Bereich" : "Konto"}
            </p>
            {isLoggedIn ? (
              <>
                {teamSlug && (
                  <Link
                    href={`/team/team-detail/${teamSlug}`}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive(`/team/team-detail/${teamSlug}`) ? "page" : undefined}
                    className={mobClass(`/team/team-detail/${teamSlug}`)}
                  >
                    <PiBasketballBold className="text-brand-400 w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">Mein Team</span>
                  </Link>
                )}
                <Link
                  href="/player/newsfeed"
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive("/player/newsfeed") ? "page" : undefined}
                  className={mobClass("/player/newsfeed")}
                >
                  <PiNewspaperClippingBold className="text-brand-400 w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">Feed</span>
                </Link>
                <Link
                  href="/player/player-detail"
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive("/player/player-detail") ? "page" : undefined}
                  className={mobClass("/player/player-detail")}
                >
                  <PiUserBold className="text-brand-400 w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">Mein Profil</span>
                </Link>
                {me?.isSuperAdmin && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive("/admin/dashboard") ? "page" : undefined}
                    className={mobAdminClass("/admin/dashboard")}
                  >
                    <PiShieldCheckBold className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">Super Admin</span>
                  </Link>
                )}
                {me?.isTeamAdmin && !me?.isSuperAdmin && (
                  <Link
                    href="/team/admin"
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive("/team/admin") ? "page" : undefined}
                    className={mobAdminClass("/team/admin")}
                  >
                    <PiTrophyBold className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">Team-Admin</span>
                  </Link>
                )}
                {!me?.isTeamAdmin && !me?.isSuperAdmin && (
                  <Link
                    href="/team/create"
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive("/team/create") ? "page" : undefined}
                    className={mobClass("/team/create")}
                  >
                    <PiUsersBold className="text-brand-400 w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">Team gründen</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-3 px-5 py-3.5 w-full text-left text-mist-600 hover:bg-navy-700 transition-colors"
                >
                  <PiXBold className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">Abmelden</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive("/login") ? "page" : undefined}
                  className={mobClass("/login")}
                >
                  <PiUserBold className="text-brand-400 w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">Anmelden</span>
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-5 py-3.5 text-brand-400 hover:bg-navy-700 transition-colors"
                >
                  <PiBasketballBold className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-bold">Registrieren</span>
                </Link>
              </>
            )}
            <FeedbackLink variant="row" onNavigate={() => setMobileOpen(false)} />
          </div>
        )}
      </nav>

      {/* Such-Overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[999] bg-black/60 flex items-start justify-center pt-20 px-4"
          // Klick auf den abgedunkelten Grund schließt – der zweite Ausweg
          // neben Escape und ×. `e.target === e.currentTarget` stellt sicher,
          // dass nur der Grund selbst zählt: Ohne diese Prüfung würde jeder
          // Klick ins Suchfeld nach oben durchblubbern und den Dialog beim
          // Tippen schließen.
          onClick={(e) => {
            if (e.target === e.currentTarget) closeSearch();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Suche"
            className="bg-navy-800 border border-navy-600 rounded-md w-full max-w-lg overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-navy-600">
              <PiMagnifyingGlassBold className="text-mist-600 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                // Ligen sind seit dem 13.08.2026 mitdurchsucht (Ronjas R8), der
                // Platzhalter nannte sie aber weiter nicht. Damit versteckte
                // ausgerechnet die Beschriftung die Neuerung: Wer „Bezirksliga"
                // sucht, tippt es nicht ein, wenn dort „Spieler oder Team" steht.
                placeholder="Spieler, Team oder Liga suchen…"
                className="flex-1 outline-none text-sm text-paper-50 placeholder-navy-500"
                value={searchTerm}
                onChange={onSearchChange}
              />
              <button
                onClick={closeSearch}
                className="p-2 -m-1 text-mist-400 hover:text-mist-300 transition-colors"
                aria-label="Suche schließen"
              >
                <PiXBold className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-navy-600">
              {searchTerm && results.length === 0 && (
                <div className="px-4 py-6 text-center text-mist-400 text-sm">
                  {searchData ? "Keine Ergebnisse" : "Lädt…"}
                </div>
              )}
              {results.map((item) =>
                item._type === "league" ? (
                  <Link
                    key={`l-${item._id}`}
                    href={`/ligen/${item._id}`}
                    onClick={closeSearch}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-navy-700 transition-colors"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-navy-700 text-mist-300">
                      <PiTrophyBold />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-paper-50 truncate">{item.name}</p>
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-mist-400 bg-navy-700 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                          Liga{item.season ? ` · ${item.season}` : ""}
                        </span>
                        {/* Ohne diese Kennzeichnung war die Suche die einzige
                            Flaeche, auf der Demo-Ligen wie echte aussahen
                            (Fund von Kai, 13.08.2026) — ausgerechnet der
                            prominenteste Einstieg fuer genau die Begriffe, auf
                            die dieser Umbau zielt („Kreisliga", „Niers").
                            /ligen markiert sie seit jeher; die Regel steht im
                            Kopf von components/DemoBadge.js. */}
                        {item.isDemo && <DemoBadge />}
                      </span>
                    </div>
                  </Link>
                ) : item._type === "team" ? (
                  <Link
                    key={`t-${item._id}`}
                    href={`/team/team-detail/${item.slug}`}
                    onClick={closeSearch}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-navy-700 transition-colors"
                  >
                    <Avatar name={item.teamName} src={item.logo} className="w-9 h-9" textClass="text-xs" square />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-paper-50 truncate">{item.teamName}</p>
                      <span className="text-[10px] font-bold text-mist-400 bg-navy-700 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                        Team
                      </span>
                    </div>
                  </Link>
                ) : (
                  <Link
                    key={`p-${item._id}`}
                    href={item.slug ? `/player/view-player/${item.slug}` : "#"}
                    onClick={closeSearch}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-navy-700 transition-colors"
                  >
                    <Avatar
                      name={`${item.firstName} ${item.lastName}`}
                      src={item.profileImage}
                      className="w-9 h-9"
                      textClass="text-xs"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-paper-50 truncate">
                        {item.firstName} {item.lastName}
                      </p>
                      <span className="text-[10px] font-bold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                        Spieler
                      </span>
                    </div>
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
