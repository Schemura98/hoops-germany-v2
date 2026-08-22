// Die Sitzungs-Auswertung antwortet auch bei GROSSEM Bestand (Roadmap 26).
//
// ⚠️ WARUM ES DIESEN TEST GIBT (22.08.2026, Gate zu 70fd2d1)
// Die alte Sitzungs-Aggregation sortierte mit zwei `$setWindowFields`-Stufen
// den GESAMTEN Treffersatz; MongoDB bricht das bei 32 MB ab (Code 292,
// `allowDiskUse` greift auf kleinen Atlas-Tarifen nicht). Folge: Ab einer
// Datenmenge antworteten /admin/analytics und der Sponsor-Report mit
// „Interner Serverfehler" — ein Ausfall, der NUR bei großem Bestand sichtbar
// ist. Eine Suite mit kleiner Datenbank ist für diesen Rückfall per
// Konstruktion blind; dieser Test stellt die Datenmenge selbst her.
//
// ⚠️ WAS DABEI GEMESSEN WURDE, BEVOR DER TEST SO GEBAUT WURDE:
// · Die 32-MB-Grenze zählt BYTES DER BENÖTIGTEN FELDER, nicht Dokumente.
//   Aufgeblähte Dokumente lösen sie NICHT schneller aus — der Optimizer
//   wirft ungenutzte Felder vor dem Sortieren ab (gemessen: 4.500 Dokumente
//   à 10 KB Ballast → die alte Pipeline lief durch). Der einzige ehrliche
//   Hebel ist die Dokumentzahl.
// · Empirischer Kipppunkt der alten Pipeline mit realitätsnahen Feldern:
//   zwischen 40.000 (läuft) und 60.000 (Code 292). Die 80.000 hier liegen
//   mit Abstand darüber; der Einfügeaufwand ist gemessen ~5–8 s.
//
// EHRLICHKEITSSCHRANKE: Es genügt nicht, dass die API 200 sagt — die
// eingefügten Sitzungen müssen in der Antwort auch ANKOMMEN (sessions >=
// Anzahl der synthetischen Sitzungen). Sonst wäre der Test grün, wenn jemand
// die Auswertung durch eine leere Antwort „repariert".
//
// AUFRÄUMEN: strikter Marker-Namensraum (sessionId-Präfix + eigener Pfad),
// gelöscht wird VOR dem Einfügen (Reste eines abgebrochenen Laufs) und im
// finally. Seed- und Echtdaten werden nie angefasst.
import { test, expect } from "@playwright/test";
import mongoose from "mongoose";
import { requireDevDbUri } from "./helpers/env.mjs";

const MARKER_PREFIX = "e2e-kai-32mb-";
const MARKER_PATH = "/e2e-waechter-32mb";
const SESSIONS = 8000;
const EVENTS_PER_SESSION = 10; // 80.000 Dokumente gesamt

test.describe("Analytics-Auswertung bei großem Bestand", () => {
  // Ein einziger, bewusst teurer Fall (~15–25 s inkl. Einfügen/Löschen).
  test("Sitzungs-Auswertung antwortet bei 80.000 zusätzlichen Ereignissen und zählt sie", async ({ request }) => {
    test.setTimeout(180_000);
    const uri = requireDevDbUri(); // wirft, falls nicht Dev-DB `hoopsgermany`
    await mongoose.connect(uri);
    const coll = mongoose.connection.collection("analyticsevents");
    const marker = { path: MARKER_PATH, sessionId: { $regex: `^${MARKER_PREFIX}` } };
    try {
      // Reste eines früheren, abgebrochenen Laufs zuerst weg.
      await coll.deleteMany(marker);

      // 8.000 Sitzungen à 10 Ereignisse, alle innerhalb der letzten 24 h,
      // Lücken < 30 min → jede sessionId ist genau EINE Sitzung.
      const T0 = Date.now() - 24 * 60 * 60 * 1000;
      const B = 10_000;
      let batch = [];
      for (let s = 0; s < SESSIONS; s++) {
        const sid = `${MARKER_PREFIX}${String(s).padStart(5, "0")}-abcdefabcdef`;
        for (let e = 0; e < EVENTS_PER_SESSION; e++) {
          batch.push({
            eventType: "pageview",
            path: MARKER_PATH,
            sessionId: sid,
            createdAt: new Date(T0 + s * 9_000 + e * 30_000),
          });
          if (batch.length >= B) { await coll.insertMany(batch, { ordered: false }); batch = []; }
        }
      }
      if (batch.length) await coll.insertMany(batch, { ordered: false });

      const eingefuegt = await coll.countDocuments(marker);
      expect(
        eingefuegt,
        "Die synthetischen Ereignisse sind nicht vollständig angekommen — dann prüft der Rest nichts.",
      ).toBe(SESSIONS * EVENTS_PER_SESSION);

      // Jetzt die echte API — derselbe Weg, den /admin/analytics und der
      // Sponsor-Report gehen.
      const anmeldung = await request.post("/api/admin/adminlogin", {
        data: { username: "admin", password: "geheim1234" },
      });
      const aj = await anmeldung.json().catch(() => ({}));
      const token = aj?.data?.token || aj?.token;
      expect(typeof token === "string" && token.length > 20, "Keine Admin-Anmeldung möglich").toBe(true);

      const res = await request.post("/api/analytics/summary", {
        data: { token, period: "30d" },
        timeout: 60_000,
      });
      expect(
        res.status(),
        "Die Auswertung bricht bei großem Bestand ab (das alte Code-292-Bild: " +
          "„Interner Serverfehler“ in /admin/analytics und im Sponsor-Report). " +
          "Fast sicher sortiert die Sitzungs-Aggregation in lib/analyticsSummary.js " +
          "wieder den gesamten Treffersatz.",
      ).toBe(200);
      const j = await res.json().catch(() => ({}));
      const sessions = j?.summary?.engagement?.sessions;
      expect(typeof sessions, "summary.engagement.sessions fehlt in der Antwort").toBe("number");
      expect(
        sessions,
        `Nur ${sessions} Sitzungen gemeldet, obwohl allein ${SESSIONS} synthetische ` +
          "eingefügt wurden — die eingefügten Daten erreichen die Auswertung nicht. " +
          "Ein Test, dessen Daten am Messgerät vorbeilaufen, sichert nichts.",
      ).toBeGreaterThanOrEqual(SESSIONS);
    } finally {
      const res = await coll.deleteMany(marker).catch(() => null);
      // Aufräumen ist Teil der Zusicherung: Liegenbleibende 80.000 Einträge
      // wären genau die Selbstvergiftung, die Roadmap 26 beendet hat.
      if (!res || res.deletedCount < SESSIONS * EVENTS_PER_SESSION) {
        console.warn(
          `[analytics-grossbestand] Aufräumen unvollständig (${res?.deletedCount ?? "Fehler"}) — ` +
            "der nächste Lauf löscht die Reste über den Marker.",
        );
      }
      await mongoose.disconnect();
    }
  });
});
