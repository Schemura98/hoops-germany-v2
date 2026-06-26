import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import AnalyticsEvent from "@/models/AnalyticsEvent";
import Player from "@/models/Player";
import Team from "@/models/Team";
import League from "@/models/League";
import Match from "@/models/Match";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

const DAY = 24 * 60 * 60 * 1000;
const PERIODS = [7, 30, 90, 365];

// Wachstum in % (gerundet). prev=0 → 100 % wenn es jetzt etwas gibt, sonst 0.
function growth(cur, prev) {
  if (!prev) return cur > 0 ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 100);
}

// Pfade in sinnvolle Bereiche bündeln (dynamische Routen sonst verstreut).
const sectionExpr = {
  $switch: {
    branches: [
      { case: { $eq: ["$path", "/"] }, then: "Startseite" },
      { case: { $regexMatch: { input: "$path", regex: "^/player/view-player/" } }, then: "Spielerprofile" },
      { case: { $regexMatch: { input: "$path", regex: "^/spieler" } }, then: "Spielerliste" },
      { case: { $regexMatch: { input: "$path", regex: "^/(player/newsfeed|home)" } }, then: "Newsfeed" },
      { case: { $regexMatch: { input: "$path", regex: "^/team/team-detail" } }, then: "Teams" },
      { case: { $regexMatch: { input: "$path", regex: "^/teams" } }, then: "Teams" },
      { case: { $regexMatch: { input: "$path", regex: "^/team/" } }, then: "Team-Verwaltung" },
      { case: { $regexMatch: { input: "$path", regex: "^/(spiele|match/)" } }, then: "Spiele & Ergebnisse" },
      { case: { $regexMatch: { input: "$path", regex: "^/ligen" } }, then: "Ligen" },
      { case: { $regexMatch: { input: "$path", regex: "^/topscorer" } }, then: "Topscorer" },
      { case: { $regexMatch: { input: "$path", regex: "^/rangliste" } }, then: "Rangliste" },
      { case: { $regexMatch: { input: "$path", regex: "^/tryouts" } }, then: "Tryouts" },
      { case: { $regexMatch: { input: "$path", regex: "^/transfermarkt" } }, then: "Transfermarkt" },
      { case: { $regexMatch: { input: "$path", regex: "^/(login|signup|reset-password|oauth)" } }, then: "Login & Registrierung" },
      { case: { $regexMatch: { input: "$path", regex: "^/player/" } }, then: "Mein Profil & Einstellungen" },
      { case: { $regexMatch: { input: "$path", regex: "^/(about|impressum|datenschutz|kontakt|feedback)" } }, then: "Info & Rechtliches" },
    ],
    default: "Sonstiges",
  },
};

// Kennzahlen einer Entität: gesamt, neu (letzte 30 / Vormonatsfenster) + Wachstum + neu diesen Monat.
async function entityStats(Model, d30, d60, monthStart, base = {}) {
  const [total, newLast30, prevLast30, newThisMonth] = await Promise.all([
    Model.countDocuments(base),
    Model.countDocuments({ ...base, createdAt: { $gte: d30 } }),
    Model.countDocuments({ ...base, createdAt: { $gte: d60, $lt: d30 } }),
    Model.countDocuments({ ...base, createdAt: { $gte: monthStart } }),
  ]);
  return { total, newLast30, prevLast30, newThisMonth, growth: growth(newLast30, prevLast30) };
}

// POST /api/analytics/summary – Auswertung für das Admin-Dashboard (intern + Sponsor).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  await connectDB();

  const now = new Date();
  const periodDays = PERIODS.includes(Number(body.period)) ? Number(body.period) : 30;
  const winStart = new Date(now.getTime() - periodDays * DAY);
  const prevStart = new Date(now.getTime() - 2 * periodDays * DAY);
  const d7 = new Date(now.getTime() - 7 * DAY);
  const d30 = new Date(now.getTime() - 30 * DAY);
  const d60 = new Date(now.getTime() - 60 * DAY);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const AE = AnalyticsEvent;
  const pv = { eventType: "pageview" };

  const [
    viewsCur,
    viewsPrev,
    viewsAllTime,
    visCurArr,
    visPrevArr,
    visAllArr,
    newVisAgg,
    active7Arr,
    active30Arr,
    devAgg,
    topPaths,
    sectionsAgg,
    viewsDaily,
    visDaily,
    usersStats,
    teamsStats,
    matchesStats,
    leaguesTotal,
    transferAvailable,
    recruitingTeams,
  ] = await Promise.all([
    AE.countDocuments({ ...pv, createdAt: { $gte: winStart } }),
    AE.countDocuments({ ...pv, createdAt: { $gte: prevStart, $lt: winStart } }),
    AE.countDocuments(pv),
    AE.distinct("sessionId", { createdAt: { $gte: winStart } }),
    AE.distinct("sessionId", { createdAt: { $gte: prevStart, $lt: winStart } }),
    AE.distinct("sessionId", {}),
    AE.aggregate([
      { $match: { sessionId: { $nin: ["", null] } } },
      { $group: { _id: "$sessionId", first: { $min: "$createdAt" } } },
      { $match: { first: { $gte: winStart } } },
      { $count: "n" },
    ]),
    AE.distinct("playerId", { playerId: { $ne: null }, createdAt: { $gte: d7 } }),
    AE.distinct("playerId", { playerId: { $ne: null }, createdAt: { $gte: d30 } }),
    AE.aggregate([
      { $match: { ...pv, createdAt: { $gte: winStart } } },
      { $group: { _id: "$device", count: { $sum: 1 } } },
    ]),
    AE.aggregate([
      { $match: { ...pv, createdAt: { $gte: winStart } } },
      { $group: { _id: "$path", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 12 },
    ]),
    AE.aggregate([
      { $match: { ...pv, createdAt: { $gte: winStart } } },
      { $group: { _id: sectionExpr, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    AE.aggregate([
      { $match: { ...pv, createdAt: { $gte: winStart } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, c: { $sum: 1 } } },
    ]),
    AE.aggregate([
      { $match: { createdAt: { $gte: winStart }, sessionId: { $nin: ["", null] } } },
      { $group: { _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, s: "$sessionId" } } },
      { $group: { _id: "$_id.date", c: { $sum: 1 } } },
    ]),
    entityStats(Player, d30, d60, monthStart),
    entityStats(Team, d30, d60, monthStart),
    entityStats(Match, d30, d60, monthStart),
    League.countDocuments({ official: true }),
    Player.countDocuments({ transferStatus: "verfuegbar" }),
    Team.countDocuments({ recruiting: true }),
  ]);

  const visCur = visCurArr.filter(Boolean).length;
  const visPrev = visPrevArr.filter(Boolean).length;
  const visAllTime = visAllArr.filter(Boolean).length;
  const newVisitors = newVisAgg[0]?.n || 0;
  const returningVisitors = Math.max(0, visCur - newVisitors);

  // Geräte
  const devices = { mobile: 0, desktop: 0, tablet: 0, unbekannt: 0 };
  devAgg.forEach((d) => {
    const k = devices[d._id] !== undefined ? d._id : "unbekannt";
    devices[k] += d.count;
  });

  // Sektionen + abgeleitete Einzel-KPIs
  const sections = sectionsAgg.map((s) => ({ section: s._id, count: s.count }));
  const secVal = (name) => sections.find((s) => s.section === name)?.count || 0;
  const sectionViews = {
    profiles: secVal("Spielerprofile"),
    teams: secVal("Teams"),
    leagues: secVal("Ligen"),
    newsfeed: secVal("Newsfeed"),
    transfermarkt: secVal("Transfermarkt"),
  };

  // Zeitreihe (Aufrufe + Besucher pro Tag), Lücken mit 0 gefüllt
  const viewsMap = Object.fromEntries(viewsDaily.map((d) => [d._id, d.c]));
  const visMap = Object.fromEntries(visDaily.map((d) => [d._id, d.c]));
  const timeseries = [];
  for (let t = winStart.getTime(); t <= now.getTime(); t += DAY) {
    const key = new Date(t).toISOString().slice(0, 10);
    timeseries.push({ date: key, views: viewsMap[key] || 0, visitors: visMap[key] || 0 });
  }

  return ok({
    summary: {
      period: periodDays,
      reach: {
        views: { current: viewsCur, previous: viewsPrev, growth: growth(viewsCur, viewsPrev) },
        visitors: { current: visCur, previous: visPrev, growth: growth(visCur, visPrev) },
        viewsAllTime,
        visitorsAllTime: visAllTime,
        newVisitors,
        returningVisitors,
      },
      activeUsers: { d7: active7Arr.length, d30: active30Arr.length },
      devices,
      timeseries,
      topPaths: topPaths.map((p) => ({ path: p._id, count: p.count })),
      sections,
      sectionViews,
      platform: {
        users: usersStats, // = registrierte Nutzer (jeder Account ist ein Spieler)
        teams: teamsStats, // Teams = Vereine (eine Entität)
        matches: matchesStats,
        leagues: { total: leaguesTotal },
        transferAvailable,
        recruitingTeams,
      },
    },
  });
}

export const POST = withErrorHandling(handler);
