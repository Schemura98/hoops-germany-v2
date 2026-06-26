import { connectDB } from "@/lib/db";
import AnalyticsEvent from "@/models/AnalyticsEvent";
import Player from "@/models/Player";
import Team from "@/models/Team";
import League from "@/models/League";
import Match from "@/models/Match";

const DAY = 24 * 60 * 60 * 1000;
export const PERIODS = [7, 30, 90, 365];

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

async function entityStats(Model, d30, d60, monthStart, base = {}) {
  const [total, newLast30, prevLast30, newThisMonth] = await Promise.all([
    Model.countDocuments(base),
    Model.countDocuments({ ...base, createdAt: { $gte: d30 } }),
    Model.countDocuments({ ...base, createdAt: { $gte: d60, $lt: d30 } }),
    Model.countDocuments({ ...base, createdAt: { $gte: monthStart } }),
  ]);
  return { total, newLast30, prevLast30, newThisMonth, growth: growth(newLast30, prevLast30) };
}

// Liefert das aggregierte Analytics-Summary (keine personenbezogenen Daten).
// Wird vom Admin-Dashboard UND vom öffentlichen Sponsor-Report genutzt.
export async function computeAnalyticsSummary(periodInput) {
  await connectDB();

  const now = new Date();
  const periodDays = PERIODS.includes(Number(periodInput)) ? Number(periodInput) : 30;
  const winStart = new Date(now.getTime() - periodDays * DAY);
  const prevStart = new Date(now.getTime() - 2 * periodDays * DAY);
  const d7 = new Date(now.getTime() - 7 * DAY);
  const d30 = new Date(now.getTime() - 30 * DAY);
  const d60 = new Date(now.getTime() - 60 * DAY);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const SESSION_GAP = 30 * 60 * 1000;

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

  const devices = { mobile: 0, desktop: 0, tablet: 0, unbekannt: 0 };
  devAgg.forEach((d) => {
    const k = devices[d._id] !== undefined ? d._id : "unbekannt";
    devices[k] += d.count;
  });

  const sections = sectionsAgg.map((s) => ({ section: s._id, count: s.count }));
  const secVal = (name) => sections.find((s) => s.section === name)?.count || 0;
  const sectionViews = {
    profiles: secVal("Spielerprofile"),
    teams: secVal("Teams"),
    leagues: secVal("Ligen"),
    newsfeed: secVal("Newsfeed"),
    transfermarkt: secVal("Transfermarkt"),
  };

  const viewsMap = Object.fromEntries(viewsDaily.map((d) => [d._id, d.c]));
  const visMap = Object.fromEntries(visDaily.map((d) => [d._id, d.c]));
  const timeseries = [];
  for (let t = winStart.getTime(); t <= now.getTime(); t += DAY) {
    const key = new Date(t).toISOString().slice(0, 10);
    timeseries.push({ date: key, views: viewsMap[key] || 0, visitors: visMap[key] || 0 });
  }

  // ---- Phase 2: Regionen, Content-Performance, Sitzungen ----
  const [
    usersByStateAgg,
    usersByCityAgg,
    teamsByCityAgg,
    visitorsByStateAgg,
    topPlayerPaths,
    topTeamPaths,
    topLeaguePaths,
    sessionAgg,
  ] = await Promise.all([
    Player.aggregate([
      { $match: { bundesland: { $nin: [null, ""] } } },
      { $group: { _id: "$bundesland", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Player.aggregate([
      { $match: { hometown: { $nin: [null, ""] } } },
      { $group: { _id: "$hometown", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    Team.aggregate([
      { $match: { region: { $nin: [null, ""] } } },
      { $group: { _id: "$region", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    AE.aggregate([
      { $match: { createdAt: { $gte: winStart }, playerId: { $ne: null } } },
      { $group: { _id: "$playerId" } },
      { $lookup: { from: "players", localField: "_id", foreignField: "_id", as: "p" } },
      { $unwind: "$p" },
      { $match: { "p.bundesland": { $nin: [null, ""] } } },
      { $group: { _id: "$p.bundesland", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    AE.aggregate([
      { $match: { ...pv, createdAt: { $gte: winStart }, path: { $regex: "^/player/view-player/" } } },
      { $group: { _id: "$path", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    AE.aggregate([
      { $match: { ...pv, createdAt: { $gte: winStart }, path: { $regex: "^/team/team-detail/" } } },
      { $group: { _id: "$path", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    AE.aggregate([
      { $match: { ...pv, createdAt: { $gte: winStart }, path: { $regex: "^/ligen/[a-fA-F0-9]{24}" } } },
      { $group: { _id: "$path", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    AE.aggregate([
      { $match: { ...pv, createdAt: { $gte: winStart }, sessionId: { $nin: ["", null] } } },
      { $setWindowFields: { partitionBy: "$sessionId", sortBy: { createdAt: 1 }, output: { prevTime: { $shift: { output: "$createdAt", by: -1 } } } } },
      { $set: { isNew: { $or: [{ $eq: ["$prevTime", null] }, { $gt: [{ $subtract: ["$createdAt", "$prevTime"] }, SESSION_GAP] }] } } },
      { $setWindowFields: { partitionBy: "$sessionId", sortBy: { createdAt: 1 }, output: { sIdx: { $sum: { $cond: ["$isNew", 1, 0] }, window: { documents: ["unbounded", "current"] } } } } },
      { $group: { _id: { sid: "$sessionId", s: "$sIdx" }, first: { $min: "$createdAt" }, last: { $max: "$createdAt" }, pages: { $sum: 1 } } },
      { $group: { _id: null, sessions: { $sum: 1 }, totalPages: { $sum: "$pages" }, totalDurSec: { $sum: { $divide: [{ $subtract: ["$last", "$first"] }, 1000] } } } },
    ]),
  ]);

  const slugFrom = (prefix, p) => p.slice(prefix.length).split("/")[0];
  const playerSlugs = topPlayerPaths.map((x) => slugFrom("/player/view-player/", x._id));
  const teamSlugs = topTeamPaths.map((x) => slugFrom("/team/team-detail/", x._id));
  const leagueIds = topLeaguePaths.map((x) => slugFrom("/ligen/", x._id));

  const [playerDocs, teamDocs, leagueDocs] = await Promise.all([
    Player.find({ slug: { $in: playerSlugs } }).select("slug firstName lastName"),
    Team.find({ slug: { $in: teamSlugs } }).select("slug teamName"),
    League.find({ _id: { $in: leagueIds.filter((id) => /^[a-fA-F0-9]{24}$/.test(id)) } }).select("name"),
  ]);
  const playerName = Object.fromEntries(playerDocs.map((d) => [d.slug, `${d.firstName} ${d.lastName}`.trim()]));
  const teamNameMap = Object.fromEntries(teamDocs.map((d) => [d.slug, d.teamName]));
  const leagueName = Object.fromEntries(leagueDocs.map((d) => [String(d._id), d.name]));

  const topPlayers = topPlayerPaths
    .map((x) => ({ label: playerName[slugFrom("/player/view-player/", x._id)], count: x.count }))
    .filter((x) => x.label);
  const topTeamsContent = topTeamPaths
    .map((x) => ({ label: teamNameMap[slugFrom("/team/team-detail/", x._id)], count: x.count }))
    .filter((x) => x.label);
  const topLeagues = topLeaguePaths
    .map((x) => ({ label: leagueName[slugFrom("/ligen/", x._id)], count: x.count }))
    .filter((x) => x.label);

  const sess = sessionAgg[0] || { sessions: 0, totalPages: 0, totalDurSec: 0 };
  const engagement = {
    sessions: sess.sessions,
    pagesPerSession: sess.sessions ? Math.round((sess.totalPages / sess.sessions) * 10) / 10 : 0,
    avgDurationSec: sess.sessions ? Math.round(sess.totalDurSec / sess.sessions) : 0,
  };

  const region = {
    usersByState: usersByStateAgg.map((x) => ({ label: x._id, value: x.count })),
    usersByCity: usersByCityAgg.map((x) => ({ label: x._id, value: x.count })),
    teamsByCity: teamsByCityAgg.map((x) => ({ label: x._id, value: x.count })),
    visitorsByState: visitorsByStateAgg.map((x) => ({ label: x._id, value: x.count })),
  };
  const content = { topPlayers, topTeams: topTeamsContent, topLeagues };

  return {
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
    engagement,
    region,
    content,
    devices,
    timeseries,
    topPaths: topPaths.map((p) => ({ path: p._id, count: p.count })),
    sections,
    sectionViews,
    platform: {
      users: usersStats,
      teams: teamsStats,
      matches: matchesStats,
      leagues: { total: leaguesTotal },
      transferAvailable,
      recruitingTeams,
    },
  };
}
