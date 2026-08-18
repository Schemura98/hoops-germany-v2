import { connectDB } from "@/lib/db";
import AnalyticsEvent from "@/models/AnalyticsEvent";
import Player from "@/models/Player";
import Team from "@/models/Team";
import { NUR_ECHT, NUR_ECHTE_TEAMS } from "@/lib/echteZahlen";
import League from "@/models/League";
import Match from "@/models/Match";

const DAY = 24 * 60 * 60 * 1000;
export const PERIODS = [7, 30, 90, 365];

// Reihenfolge und Beschriftung der Schritte der Plattform-Tour
// (components/onboarding/WelcomeTour.js). Muss mit den dortigen `key`-Werten
// übereinstimmen – sonst fällt ein Schritt lautlos aus der Auswertung.
//
// ⚠️ Diese Ereignisse wurden zwar seit jeher gespeichert, aber nirgends
// ausgewertet (Befund 13.08.2026). Ohne die Abbruchkurve weiß man nur, DASS
// jemand aussteigt – nicht wo. Genau das ist die Zahl, die entscheidet, ob am
// Einstieg noch etwas zu holen ist.
const TOUR_SCHRITTE = [
  { key: "beweis", label: "1 · Beweis (bestätigte Zahlen)" },
  { key: "weg", label: "2 · Frage nach der Situation" },
  { key: "position", label: "3 · Position wählen" },
  { key: "stadt", label: "4 · Stadt & Bundesland" },
  { key: "start", label: "5 · Übergabe an die Checkliste" },
];
const TOUR_WEGE = {
  verein: "Spielt im Verein",
  suche: "Sucht ein Team",
  admin: "Organisiert ein Team",
};
const TOUR_AKTIONEN = {
  position: "Position gespeichert",
  stadt: "Stadt & Bundesland gespeichert",
  verfuegbar: "Als verfügbar eingetragen",
};

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
      // Eigener Eimer statt „Sonstiges": Die Installationsseite sagt mehr über
      // Wiederkehr aus als jede Aufrufzahl – sie war bisher unsichtbar in der
      // Messung (Befund Ronja R7, 13.08.2026).
      { case: { $regexMatch: { input: "$path", regex: "^/installieren" } }, then: "App-Installation" },
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
    externeUsersStats,
    externeTeamsStats,
    leaguesTotal,
    transferAvailable,
    recruitingTeams,
    signupSourcesAgg,
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
    // ⚠️ `own_stats_notified` ist ein SERVER-Ereignis (lib/statsNotify.js) und trägt eine
    // playerId, obwohl der Spieler gar nichts getan hat. Ohne diesen Ausschluss würde jede
    // versendete Benachrichtigung ihren Empfänger als „aktiven Nutzer" zählen – also genau
    // die Zahl aufblasen, die Ronja als die belastbarste im Report bezeichnet.
    // ⚠️ NUR KONTEN ZÄHLEN, DIE ES NOCH GIBT (18.08.2026).
    //
    // `distinct` zählte bisher jede Spieler-Kennung, die im Zeitraum ein
    // Ereignis erzeugt hat – auch die von längst gelöschten Konten. Die
    // Ereignisse bleiben ja stehen, wenn ein Profil verschwindet.
    //
    // Auf der Dev-DB gemessen: 20 Spieler vorhanden, **256** als „aktiv"
    // gezählt, davon existieren **3**. Also Faktor 85 zu hoch.
    // ⚠️ Auf `hoops_prod` heute unauffällig (5 gezählt, 5 existieren) – dort
    // wurde noch kaum gelöscht. Der Fehler ist also **latent, nicht akut**;
    // er wächst mit jedem gelöschten Konto. Genau deshalb jetzt beheben:
    // Diese Zahl steht im **Sponsor-Report** („Aktive Nutzer 30T"), und sie
    // gilt dort laut Ronja als die belastbarste Kennzahl überhaupt.
    // Ein `$lookup` gegen die Spieler kostet eine Abfrage und macht aus einer
    // Zahl, die nur wachsen kann, eine, die stimmt.
    AE.aggregate([
      { $match: { playerId: { $ne: null }, eventType: { $ne: "own_stats_notified" }, createdAt: { $gte: d7 } } },
      { $group: { _id: "$playerId" } },
      { $lookup: { from: "players", localField: "_id", foreignField: "_id", as: "p" } },
      { $match: { "p.0": { $exists: true } } },
    ]),
    AE.aggregate([
      { $match: { playerId: { $ne: null }, eventType: { $ne: "own_stats_notified" }, createdAt: { $gte: d30 } } },
      { $group: { _id: "$playerId" } },
      { $lookup: { from: "players", localField: "_id", foreignField: "_id", as: "p" } },
      { $match: { "p.0": { $exists: true } } },
    ]),
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
    // Ohne Demo-Daten UND ohne interne Testkonten: die einzige Zahl, die man
    // nach aussen zeigen duerfte (Neles Schwelle, docs/LANDING-COPY-2026-08-11.md §7).
    entityStats(Player, d30, d60, monthStart, NUR_ECHT),
    entityStats(Team, d30, d60, monthStart, NUR_ECHTE_TEAMS),
    League.countDocuments({ official: true }),
    Player.countDocuments({ transferStatus: "verfuegbar" }),
    Team.countDocuments({ recruiting: true }),
    // Kampagnen-Quellen-Tracking (?src= bei /signup) – nur echte Nutzer, keine Demo-Profile.
    Player.aggregate([
      { $match: { isDemo: { $ne: true }, signupSource: { $nin: [null, ""] } } },
      { $group: { _id: "$signupSource", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
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
    onboardingAgg,
    ownStatsAgg,
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
      // Server-Ereignis ausschließen – s. Kommentar bei activeUsers.
      { $match: { createdAt: { $gte: winStart }, playerId: { $ne: null }, eventType: { $ne: "own_stats_notified" } } },
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
    // Onboarding-Trichter. Gezählt werden SITZUNGEN, nicht Ereignisse: Wer über
    // „Zurück" zweimal auf denselben Schritt kommt, ist trotzdem eine Person.
    // Ohne das läge die Kurve genau dort am höchsten, wo jemand unsicher war –
    // also am Schritt, der das Problem IST.
    AE.aggregate([
      {
        $match: {
          eventType: {
            $in: [
              "tour_step",
              "tour_branch",
              "tour_action",
              "tour_completed",
              "tour_skipped",
              "checklist_step_done",
              "checklist_dismissed",
            ],
          },
          createdAt: { $gte: winStart },
        },
      },
      { $group: { _id: { t: "$eventType", m: "$meta" }, sitzungen: { $addToSet: "$sessionId" } } },
      { $project: { _id: 0, t: "$_id.t", m: "$_id.m", count: { $size: "$sitzungen" } } },
    ]),
    // „Deine Zahlen stehen" (lib/statsNotify.js): versendete Benachrichtigungen
    // gegen tatsächlich geöffnete. Ronjas Erfolgsfrage zu R1 – misst, ob der
    // Wiederaufrufgrund trägt, statt nur ob er existiert.
    AE.aggregate([
      {
        $match: {
          eventType: { $in: ["own_stats_notified", "own_stats_opened"] },
          createdAt: { $gte: winStart },
        },
      },
      {
        $group: {
          _id: "$eventType",
          count: { $sum: 1 },
          spieler: { $addToSet: "$playerId" },
        },
      },
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

  const signupSources = signupSourcesAgg.map((x) => ({ src: x._id, count: x.count }));

  const region = {
    usersByState: usersByStateAgg.map((x) => ({ label: x._id, value: x.count })),
    usersByCity: usersByCityAgg.map((x) => ({ label: x._id, value: x.count })),
    teamsByCity: teamsByCityAgg.map((x) => ({ label: x._id, value: x.count })),
    visitorsByState: visitorsByStateAgg.map((x) => ({ label: x._id, value: x.count })),
  };
  const content = { topPlayers, topTeams: topTeamsContent, topLeagues };

  // ---- Onboarding-Trichter aufbereiten ----
  const ob = (t, m) => onboardingAgg.find((x) => x.t === t && x.m === m)?.count || 0;
  const obSumme = (t) =>
    onboardingAgg.filter((x) => x.t === t).reduce((s, x) => s + x.count, 0);

  const tourSchritte = TOUR_SCHRITTE.map((s) => ({
    key: s.key,
    label: s.label,
    erreicht: ob("tour_step", s.key),
    abgebrochen: ob("tour_skipped", s.key),
  }));
  const tourGestartet = tourSchritte[0]?.erreicht || 0;
  const tourAbgeschlossen = obSumme("tour_completed");

  const onboarding = {
    steps: tourSchritte,
    started: tourGestartet,
    completed: tourAbgeschlossen,
    // Abschlussquote nur ausgeben, wenn überhaupt jemand gestartet ist –
    // „0 %" bei 0 Startern wäre eine erfundene Aussage.
    completionRate: tourGestartet
      ? Math.round((tourAbgeschlossen / tourGestartet) * 100)
      : null,
    branches: Object.entries(TOUR_WEGE).map(([k, label]) => ({
      label,
      value: ob("tour_branch", k),
    })),
    actions: Object.entries(TOUR_AKTIONEN).map(([k, label]) => ({
      label,
      value: ob("tour_action", k),
    })),
    checklist: {
      stepsDone: obSumme("checklist_step_done"),
      dismissed: obSumme("checklist_dismissed"),
    },
  };

  // ---- „Deine Zahlen stehen" ----
  const osRow = (t) => ownStatsAgg.find((x) => x._id === t);
  const osNotified = osRow("own_stats_notified")?.count || 0;
  const osOpened = osRow("own_stats_opened")?.count || 0;
  const ownStats = {
    notified: osNotified,
    // Wie viele verschiedene Spieler – eine Person mit fünf Spielen ist kein
    // Beleg für fünf erreichte Nutzer.
    notifiedPlayers: (osRow("own_stats_notified")?.spieler || []).filter(Boolean).length,
    opened: osOpened,
    // Keine Quote erfinden, wenn nichts versendet wurde.
    openRate: osNotified ? Math.round((osOpened / osNotified) * 100) : null,
  };

  return {
    period: periodDays,
    ownStats,
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
    onboarding,
    devices,
    timeseries,
    topPaths: topPaths.map((p) => ({ path: p._id, count: p.count })),
    sections,
    sectionViews,
    platform: {
      users: usersStats,
      teams: teamsStats,
      // „extern" = ohne Beispieldaten und ohne interne Testkonten
      externeUsers: externeUsersStats,
      externeTeams: externeTeamsStats,
      matches: matchesStats,
      leagues: { total: leaguesTotal },
      transferAvailable,
      recruitingTeams,
    },
    signupSources,
  };
}
