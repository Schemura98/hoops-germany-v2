import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import AnalyticsEvent from "@/models/AnalyticsEvent";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/analytics/summary – Auswertung für das Admin-Dashboard.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  await connectDB();

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Pfade in sinnvolle Bereiche bündeln (dynamische Routen wie einzelne
  // Spielerprofile/Teams/Matches sonst über viele Pfade verstreut).
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

  const [totalViews, sessions, topPaths, sections, daily] = await Promise.all([
    AnalyticsEvent.countDocuments({ eventType: "pageview" }),
    AnalyticsEvent.distinct("sessionId"),
    AnalyticsEvent.aggregate([
      { $match: { eventType: "pageview" } },
      { $group: { _id: "$path", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    AnalyticsEvent.aggregate([
      { $match: { eventType: "pageview" } },
      { $group: { _id: sectionExpr, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    AnalyticsEvent.aggregate([
      { $match: { eventType: "pageview", createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return ok({
    summary: {
      totalViews,
      uniqueSessions: sessions.filter(Boolean).length,
      topPaths: topPaths.map((p) => ({ path: p._id, count: p.count })),
      sections: sections.map((s) => ({ section: s._id, count: s.count })),
      daily: daily.map((d) => ({ date: d._id, count: d.count })),
    },
  });
}

export const POST = withErrorHandling(handler);
