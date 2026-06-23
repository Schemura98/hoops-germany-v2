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

  const [totalViews, sessions, topPaths, daily] = await Promise.all([
    AnalyticsEvent.countDocuments({ eventType: "pageview" }),
    AnalyticsEvent.distinct("sessionId"),
    AnalyticsEvent.aggregate([
      { $match: { eventType: "pageview" } },
      { $group: { _id: "$path", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
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
      daily: daily.map((d) => ({ date: d._id, count: d.count })),
    },
  });
}

export const POST = withErrorHandling(handler);
