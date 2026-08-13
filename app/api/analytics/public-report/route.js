import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import ReportShare from "@/models/ReportShare";
import { computeAnalyticsSummary } from "@/lib/analyticsSummary";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// ---------------------------------------------------------------------------
// Positivliste: was ein Sponsor sehen darf.
//
// Das Objekt wird aus ausdrücklich benannten Feldern NEU GEBAUT – es wird
// nicht das interne Summary durchgereicht und um einzelne Felder gekürzt.
// Der Unterschied ist nicht kosmetisch: Beim Kürzen ist jedes künftig in
// computeAnalyticsSummary() ergänzte Feld automatisch öffentlich, bis jemand
// daran denkt. Hier ist es automatisch nicht öffentlich. (Genau so ist am
// 13.08.2026 der interne Onboarding-Trichter nach draußen geraten und musste
// nachträglich entfernt werden – docs/TOUR-UMBAU-2026-08-13.md §8.)
//
// Maßstab ist, was components/admin/SponsorReportView.js tatsächlich anzeigt –
// die einzige Ansicht hinter diesem Endpunkt (app/sponsor-report/[token]).
// Auch die Längen sind die der Anzeige: Was dort ohnehin abgeschnitten wird,
// wird gar nicht erst gesendet.
//
// Bewusst NICHT enthalten (Stand 13.08.2026) – jeweils mit Grund, damit eine
// spätere Ergänzung eine Entscheidung ist und kein Versehen:
//   platform.users / platform.teams   Bestand OHNE Echtheitsfilter, also inkl.
//                                     Demo-Fixtures und interner Testkonten.
//                                     Nach außen schlicht falsch (Faktor ~70
//                                     bzw. ~45) – der Report zeigt deshalb die
//                                     externen Zahlen.
//   platform.*.newLast30 / prevLast30 / newThisMonth
//                                     interne Wachstumsrohdaten
//   signupSources                     Wirksamkeit der Akquise-Kanäle
//                                     (Flyer-QR usw.) – Geschäftsinterna
//   onboarding                        Abbruchkurve des Einstiegs, reine
//                                     Produktdiagnose
//   ownStats                          Wirkung einer internen Benachrichtigung
//   sectionViews                      interne Feinauswertung
//   activeUsers.d7                    der Report zeigt nur d30
//   reach.viewsAllTime / visitorsAllTime
//                                     Allzeit-Zahlen; der Report macht eine
//                                     Aussage über den gewählten Zeitraum
//   region.usersByCity / visitorsByState
//                                     im Report nicht dargestellt
//   devices.unbekannt                 Altdaten-Topf, interne Datenhygiene
// ---------------------------------------------------------------------------

// Kleine Helfer – halten die Positivliste unten lesbar und garantieren, dass
// jedes Feld existiert (die Anzeige ruft .slice() direkt auf den Listen auf).
const kpi = (m = {}) => ({ current: m.current ?? 0, growth: m.growth ?? 0 });
const bestand = (e = {}) => ({ total: e.total ?? 0, growth: e.growth ?? 0 });
const beschriftet = (arr, n) =>
  (arr || []).slice(0, n).map((x) => ({ label: x.label, value: x.value }));
const gezaehlt = (arr, n) =>
  (arr || []).slice(0, n).map((x) => ({ label: x.label, count: x.count }));

function buildSponsorView(s) {
  return {
    period: s.period,

    // Reichweite (Kopfzahlen des Reports)
    reach: {
      views: kpi(s.reach?.views),
      visitors: kpi(s.reach?.visitors),
      newVisitors: s.reach?.newVisitors ?? 0,
      returningVisitors: s.reach?.returningVisitors ?? 0,
    },
    activeUsers: { d30: s.activeUsers?.d30 ?? 0 },
    engagement: {
      sessions: s.engagement?.sessions ?? 0,
      pagesPerSession: s.engagement?.pagesPerSession ?? 0,
      avgDurationSec: s.engagement?.avgDurationSec ?? 0,
    },

    // Verlaufskurve
    timeseries: (s.timeseries || []).map((d) => ({
      date: d.date,
      views: d.views,
      visitors: d.visitors,
    })),

    // Zielgruppe
    devices: {
      mobile: s.devices?.mobile ?? 0,
      desktop: s.devices?.desktop ?? 0,
      tablet: s.devices?.tablet ?? 0,
    },
    sections: (s.sections || [])
      .slice(0, 6)
      .map((x) => ({ section: x.section, count: x.count })),
    region: {
      usersByState: beschriftet(s.region?.usersByState, 8),
      teamsByCity: beschriftet(s.region?.teamsByCity, 8),
    },
    content: {
      topPlayers: gezaehlt(s.content?.topPlayers, 5),
      topTeams: gezaehlt(s.content?.topTeams, 5),
      topLeagues: gezaehlt(s.content?.topLeagues, 5),
    },

    // Plattform-Stärke – ausschließlich die echtheitsgefilterten Bestände
    platform: {
      externeUsers: bestand(s.platform?.externeUsers),
      externeTeams: bestand(s.platform?.externeTeams),
      matches: bestand(s.platform?.matches),
      leagues: { total: s.platform?.leagues?.total ?? 0 },
    },

    topPaths: (s.topPaths || [])
      .slice(0, 8)
      .map((x) => ({ path: x.path, count: x.count })),
  };
}

// POST /api/analytics/public-report – öffentlicher Sponsor-Report (Token + Passwort).
// Gibt NUR aggregierte Zahlen zurück (keine personenbezogenen Daten) und davon
// nur die oben ausdrücklich freigegebenen.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = String(body.token || "");
  const password = String(body.password || "");
  if (!token || !password) return fail("Token und Passwort erforderlich", 400);

  await connectDB();
  const share = await ReportShare.findOne({ token, active: true });
  // Immer bcrypt.compare ausführen (auch bei unbekanntem Token) → kein Timing-Hinweis.
  const hash = share?.password || "$2a$10$0000000000000000000000000000000000000000000000000000";
  const valid = await bcrypt.compare(password, hash);
  if (!share || !valid) return fail("Falsches Passwort oder Link ungültig", 401);

  const summary = buildSponsorView(await computeAnalyticsSummary(body.period));
  return ok({ summary, label: share.label || "" });
}

export const POST = withErrorHandling(handler);
