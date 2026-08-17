import { test, expect } from "@playwright/test";

// ══ DER BALL SPRINGT NICHT, WENN DIE ANMELDUNG SPÄT AUFLÖST ═════════════════
//
// Befund Tobias H1 (siebte Runde), von ihm an Kai zum Bau übergeben.
//
// Die Startseite entscheidet erst nach dem Token-Abgleich, welchen Hero sie
// zeigt — und die beiden Zweige haben UNTERSCHIEDLICHE Ruhelagen, weil das
// eingeloggte Eyebrow („Willkommen zurück", 179,8 px) schmaler ist als das
// ausgeloggte (239,5 px) und die Verankerung dem Eyebrow folgt.
// Löst `getmyinfo` erst NACH der Landung auf — ab rund 1600 ms Zusatzlatenz —,
// landete der Ball auf dem ausgeloggten Anker, und `apply` schrieb die neue Lage
// danach **ohne Übergang**. Tobias' Messung, von mir reproduziert:
//
//     Breite  320    375    600    640
//     Versatz 32,0   0,0    39,8   25,2   px in EINEM Frame
//
// ⚠️ Dass bei 375–412 px nichts sprang, war **Zufall, nicht Absicherung** — dort
// sind die beiden Anker zufällig deckungsgleich. Genau deshalb ist dieser Test
// über mehrere Breiten aufgesetzt und nicht über die häufigste.
//
// ⚠️ WARUM ER KEINE PAUSE VERLANGT (mein eigener Fehlgriff beim Bauen): Mein
// erster Entwurf suchte eine Lageänderung nach einer Pause von >100 ms. Die
// Korrektur passiert aber in **14 ms** (t=3333 → 3347); die Pause liegt DAVOR.
// Der Entwurf meldete deshalb 0,0 px — und zwar auch mit abgeklemmtem Fix, war
// also eine Sonde ohne Trennschärfe. Ein grünes Ergebnis daraus hätte nichts
// bedeutet (Lehre Kai, siebte Runde).

// ⚠️ DIE TRENNSCHÄRFE LIEGT BEI DREI FÄLLEN, NICHT BEI VIER (Befund Kai K3).
// Der 375-px-Fall bleibt auch bei abgeklemmtem Fix grün – dort sind die Anker der
// beiden Hero-Zweige deckungsgleich, es gibt also nichts zu federn. Er
// DOKUMENTIERT den Zufallsfall korrekt (und hält fest, dass die häufigste
// iPhone-Breite unauffällig ist), aber er DECKT nichts ab. Wer ihn für Abdeckung
// hält, überschätzt diesen Test um ein Viertel.
const BREITEN = [320, 375, 600, 640, 768, 900];
const AUTH_VERZUG_MS = 2600; // schiebt den Zweigtausch sicher hinter die Landung
// ⚠️ ABGELEITET, NICHT GEGRIFFEN (Befund Kai K2, achte Runde). Hier stand eine
// feste `2500` im Filter, während `AUTH_VERZUG_MS` 2600 war – zwei Zahlen, die
// zusammengehören und nicht verbunden waren.
// Kai hat nachgestellt, was das kostet: Fix abgeklemmt UND `AUTH_VERZUG_MS` auf
// 1200 gesenkt (was jemand tut, der die Suite beschleunigt) → **nur noch 1 von 4
// rot statt 3 von 4**. Die Fälle 600 und 640, die die eigentliche Fehlergröße
// tragen, wurden grün bei entferntem Fix. Der Test hätte dann genau das
// durchgelassen, wogegen er gebaut ist.
const AB_MS = AUTH_VERZUG_MS - 100;
// Wartezeit nach dem Laden: Verzug plus Landung plus Federung plus Reserve.
const RUHE_MS = 3500;
const ERLAUBT_UNGEFEDERT = 2; // px

test.describe("Hero-Ball – späte Anmeldung", () => {
  for (const breite of BREITEN) {
    test(`${breite}px: die Lagekorrektur nach dem Zweigtausch ist gefedert`, async ({
      page,
      request,
    }) => {
      // Echter Token über die API. Wegwerf-Konto der Dev-DB; die Suite prüft
      // ohnehin gegen `hoopsgermany`, nie gegen Prod.
      const res = await request.post("/api/player/playerlogin", {
        data: { email: "max@test.de", password: "test123" },
      });
      const j = await res.json().catch(() => ({}));
      const token = j?.data?.token || j?.token;
      expect(
        typeof token === "string" && token.length > 20,
        `Kein Token erhalten – ohne Anmeldung prüft dieser Test nichts. ` +
          `Antwort: ${JSON.stringify(j).slice(0, 160)}`,
      ).toBe(true);

      await page.setViewportSize({ width: breite, height: 812 });
      // Die Auth-Antwort künstlich verzögern (Tobias' Methode, kein Codeeingriff).
      await page.route("**/getmyinfo", async (route) => {
        await new Promise((r) => setTimeout(r, AUTH_VERZUG_MS));
        await route.continue();
      });
      await page.addInitScript((t) => {
        localStorage.setItem("playerAuthToken", t);
        document.addEventListener("DOMContentLoaded", () => {
          window.__spur = [];
          new MutationObserver(() => {
            const e = document.querySelector(".hero-ball-sprite");
            if (!e) return;
            const m = /translate3d\([^,]+,\s*([-\d.]+)px/.exec(
              e.style.transform,
            );
            if (!m) return;
            window.__spur.push({
              t: Math.round(performance.now()),
              y: Number(m[1]),
              deck: Number(getComputedStyle(e).opacity),
              tr: getComputedStyle(e).transitionDuration,
            });
          }).observe(document.documentElement, {
            subtree: true,
            attributes: true,
            attributeFilter: ["style"],
          });
        });
      }, token);

      await page.goto("/", { waitUntil: "domcontentloaded" });
      if (breite >= 768) {
        await page.waitForTimeout(900);
        await page.evaluate(() => window.scrollTo(0, 400));
        await page.waitForTimeout(AUTH_VERZUG_MS + RUHE_MS - 900);
      } else {
        await page.waitForTimeout(AUTH_VERZUG_MS + RUHE_MS);
      }

      // Der Zweig MUSS getauscht haben, sonst prüft der Test nichts.
      const eyebrow = await page.evaluate(
        () =>
          document.querySelector("[data-hero-eyebrow]")?.textContent.trim() ??
          "",
      );
      expect(
        eyebrow,
        `Der eingeloggte Hero wurde nicht gerendert (Eyebrow „${eyebrow}"). ` +
          `Ohne Zweigtausch ist das Ergebnis dieses Tests bedeutungslos, nicht grün.`,
      ).toContain("Willkommen");

      const spur = await page.evaluate(() => window.__spur || []);
      expect(
        spur.length,
        `Nur ${spur.length} Schreibvorgänge am Ball – die Sonde hat nicht gemessen.`,
      ).toBeGreaterThan(8);

      let groesster = 0;
      let uebergang = null;
      let bei = null;
      for (let i = 1; i < spur.length; i += 1) {
        // Nur SICHTBARE Bewegung, und nur nach der Landung.
        if (spur[i - 1].deck <= 0.05 || spur[i].deck <= 0.05) continue;
        if (spur[i].t <= AB_MS) continue;
        const d = Math.abs(spur[i].y - spur[i - 1].y);
        if (d > groesster) {
          groesster = d;
          uebergang = spur[i].tr;
          bei = spur[i].t;
        }
      }

      // Kleine Korrekturen sind unbedenklich; große müssen gefahren werden.
      const gefedert = uebergang && uebergang !== "0s";
      expect(
        groesster <= ERLAUBT_UNGEFEDERT || gefedert,
        `Der Ball springt bei ${breite}px um ${groesster.toFixed(1)}px ` +
          `(t=${bei}ms) mit Übergangszeit „${uebergang}". Löst die Anmeldung nach ` +
          `der Landung auf, muss die Lagekorrektur GEFAHREN werden – ohne ` +
          `Übergang ist es ein sichtbarer Satz auf einer ruhenden Seite.`,
      ).toBe(true);
    });
  }
});
