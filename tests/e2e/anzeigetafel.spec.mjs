// Wächter der Anzeigetafel-Runde (Kai, 23.08.2026 — Gate zur Runde
// Tafel/SegmentZahl/BelegLampe, Konzept docs/ANZEIGETAFEL-KONZEPT-2026-08-23.md).
//
// DREI ZUSICHERUNGEN, die sonst niemand bewacht:
//
// (1) DIE BELEG-LAMPE FOLGT DEM PRÄDIKAT, NICHT DEM resultStatus.
//     Die Lampe ist seit dieser Runde ein wiederkehrendes Zeichen an drei
//     Orten. Der historische Blocker vom 15.08.2026 war exakt: eine Fläche
//     leitet „beidseitig bestätigt" aus `resultStatus === "confirmed"` ab —
//     und ein admin-gesetztes Ergebnis (updatematch erfindet beide Meldungen
//     OHNE submittedBy) leuchtet fälschlich. `beleg-aussage.spec.mjs` prüft
//     das im QUELLTEXT; dieser Fall misst es am GERENDERTEN DOM gegen die
//     echten Daten — er fängt auch den Fehler, bei dem die Lampe zwar das
//     Prädikat importiert, aber das falsche Match-Objekt bekommt (z. B. eines,
//     dem die teamXResult-Felder fehlen: dann ist ALLES Umriss, und ein
//     Quelltext-Test bleibt grün).
//
// (2) EIN SCREENREADER LIEST DEN ECHTEN WERT, NIE DIE GEIST-ACHTEN.
//     SegmentZahl rendert seit dem Mittelweg-Fix ZELLENWEISE: jede Stelle
//     eine unbeleuchtete Segment-„8" als Kulisse, die echte Ziffer darüber.
//     textContent eines Fensters ist damit z. B. „8878" (Geist + Wert) —
//     Kulisse und Wert unterscheiden sich NUR über aria-hidden + sr-only.
//     Wer eines von beiden entfernt, hört als Screenreader-Nutzer „88 78"
//     oder gar nichts — und kein Pixel sieht anders aus.
//     ⚠️ Dieselbe Falle gilt für TESTS: Wer künftig textContent eines
//     Tafel-Fensters liest, bekommt die Geist-Zeichen mit. Sollwert-Lesungen
//     gehören auf den sr-only-Knoten — dieser Fall dokumentiert das an der
//     Stelle, an der es bricht.
//
// (3) KEIN WERT BLEIBT DAUERHAFT UNSICHTBAR.
//     Der Einschalt-Moment startet jede Zahl mit Deckkraft 0 und hängt am
//     IntersectionObserver der Tafel (250 ms Haltezeit). Fällt das „an"-Signal
//     aus — Observer-Fehler, entfernte reduced-motion-Weiche, Schwelle
//     unerreichbar —, steht dauerhaft ein leeres Fenster mit 6-%-Geist, und
//     nichts wirft einen Fehler. Gemessen wird die Währung des Defekts:
//     die gerenderte Deckkraft der Wertschicht, in BEIDEN Bewegungs-Modi.
//
// Sollwerte kommen aus der API der Dev-DB, nie fest verdrahtet (Regel aus
// Roadmap 38: Vorbedingungen darf man seeden, Sollwerte nie).
import { test, expect } from "@playwright/test";
import { beidseitigBelegt, teamScores } from "../../lib/matchScore.js";

const TEAM_SLUG = "test-baskets";
const KONTO = { email: "max@test.de", password: "test123" };

async function api(request, path, data) {
  const res = await request.post(path, { data });
  const j = await res.json().catch(() => ({}));
  return j?.data ?? j;
}

// Abgeschlossene Spiele des Teams samt Soll-Beleglage aus dem Prädikat.
async function spieleMitSoll(request) {
  const d = await api(request, "/api/team/fetchsingleteaminfo", { slug: TEAM_SLUG });
  const matches = (d?.matches || []).filter(
    (m) => m.status === "completed" && teamScores(m)
  );
  return matches.map((m) => ({ id: String(m._id), belegt: beidseitigBelegt(m) }));
}

test("Beleg-Lampe: gefüllt NUR bei echtem beidseitigem Beleg — DOM gegen Prädikat", async ({ page, request }) => {
  const soll = await spieleMitSoll(request);

  // Ehrlichkeitsschranke: Ohne BEIDE Sorten (echt belegt UND admin-gesetzt)
  // kann dieser Fall den historischen Fehler per Konstruktion nicht sehen —
  // dann ist er wertlos statt bestanden (Muster feed-kachel-gleichheit).
  const belegte = soll.filter((s) => s.belegt).length;
  const nurAdmin = soll.length - belegte;
  expect(
    belegte >= 1 && nurAdmin >= 1,
    `Dev-DB hat nicht beide Beleglagen (belegt: ${belegte}, ohne beidseitig: ${nurAdmin}) — ` +
      `der Fall wäre blind für genau den Fehler, den er bewacht. ` +
      `Abhilfe: node scripts/seed-demo.mjs && node scripts/seed-feed-lebendig.mjs`
  ).toBe(true);

  await page.goto(`/team/team-detail/${TEAM_SLUG}`);
  await page.getByRole("button", { name: "Spielplan" }).click();
  await page.getByRole("button", { name: "Vergangen" }).click();

  // Zeilen einsammeln: je /match/-Link die Lampe (aria-hidden-Kreis) + sr-Text.
  const zeilenLocator = page.locator(`a[href^="/match/"]:has(span[aria-hidden="true"].rounded-full)`);
  await expect(zeilenLocator.first()).toBeVisible();
  const zeilen = await zeilenLocator.evaluateAll((links) =>
    links.map((a) => {
      const kreis = a.querySelector('span[aria-hidden="true"].rounded-full');
      return {
        id: (a.getAttribute("href") || "").split("/").pop(),
        gefuellt: kreis ? kreis.className.includes("bg-signal-ok") : null,
        sr: a.querySelector(".sr-only")?.textContent?.trim() || "",
      };
    })
  );

  // Jede abgeschlossene Zeile muss der Soll-Lage entsprechen — in BEIDE
  // Richtungen (eine Lampe, die nie leuchtet, wäre sonst genauso grün wie
  // eine, die immer leuchtet).
  for (const s of soll) {
    const z = zeilen.find((x) => x.id === s.id);
    expect(z, `Spielzeile ${s.id} trägt keine Beleg-Lampe`).toBeTruthy();
    expect(
      z.gefuellt,
      `Lampe ${s.id}: DOM sagt ${z.gefuellt ? "gefüllt" : "Umriss"}, ` +
        `Prädikat sagt ${s.belegt ? "belegt" : "NICHT beidseitig belegt"} (sr: „${z.sr}")`
    ).toBe(s.belegt);
    if (s.belegt) {
      expect(z.sr, `Belegte Lampe ${s.id} ohne beidseitig-Wortlaut`).toContain(
        "Von beiden Teams bestätigt"
      );
    } else {
      // P6-Regel: Ein admin-gesetztes confirmed heißt NIE „Von beiden Teams".
      expect(z.sr).not.toContain("Von beiden Teams bestätigt");
    }
  }
});

test("Match-Kopf: Screenreader hört den echten Spielstand, die Geist-Achten sind stumm", async ({ page, request }) => {
  const soll = await spieleMitSoll(request);
  const d = await api(request, "/api/team/fetchsingleteaminfo", { slug: TEAM_SLUG });
  const m = (d?.matches || []).find((x) => String(x._id) === soll[0]?.id);
  expect(m, "Kein abgeschlossenes Spiel mit Score in der Dev-DB").toBeTruthy();
  const score = teamScores(m);

  await page.goto(`/match/${m._id}`);
  await expect(page.locator(".font-segment").first()).toBeVisible();

  const messung = await page.evaluate(() => {
    // (a) Jeder Segment-Geist muss unter aria-hidden stehen (selbst oder Ahne).
    const geister = [...document.querySelectorAll(".font-segment")];
    const hoerbareGeister = geister.filter((g) => {
      // Der Geist ist der Textknoten mit den „8"en — im children-Pfad das
      // .font-segment-Element selbst, im Zellen-Pfad dessen erster Kindspan.
      const traeger = g.matches('[aria-hidden="true"]')
        ? g
        : g.querySelector('[aria-hidden="true"]')
        ? null // Kulisse liegt in einem aria-hidden-Kind → stumm
        : g;
      if (!traeger) return false;
      let el = traeger;
      while (el) {
        if (el.getAttribute?.("aria-hidden") === "true") return false;
        el = el.parentElement;
      }
      return /8/.test(traeger.textContent || "");
    });

    // (b) Was ein Screenreader im Tafel-Gehäuse tatsächlich vorliest:
    // alle Textknoten, die NICHT unter aria-hidden liegen.
    const gehaeuse = [...document.querySelectorAll("div")].find(
      (x) => x.querySelector(".font-segment") && x.className.includes("border-t-brand-500")
    );
    let srText = "";
    if (gehaeuse) {
      const walker = document.createTreeWalker(gehaeuse, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walker.nextNode())) {
        let el = n.parentElement, hidden = false;
        while (el && el !== gehaeuse.parentElement) {
          if (el.getAttribute("aria-hidden") === "true") { hidden = true; break; }
          el = el.parentElement;
        }
        if (!hidden && n.textContent.trim()) srText += n.textContent.trim() + " ";
      }
    }
    return { hoerbareGeister: hoerbareGeister.length, srText: srText.trim(), gehaeuseDa: !!gehaeuse };
  });

  expect(messung.gehaeuseDa, "Tafel-Gehäuse (border-t-brand-500) nicht gefunden").toBe(true);
  expect(
    messung.hoerbareGeister,
    "Segment-Geist ohne aria-hidden — ein Screenreader liest Achten vor, die keine Zahl sind"
  ).toBe(0);
  // Der echte Spielstand muss hörbar sein — beide Seiten.
  expect(messung.srText, "Score A fehlt im hörbaren Text").toContain(String(score.a));
  expect(messung.srText, "Score B fehlt im hörbaren Text").toContain(String(score.b));
});

test.describe("Einschalt-Moment: kein Wert bleibt dauerhaft unsichtbar", () => {
  async function profilOeffnen(page, request) {
    const login = await api(request, "/api/player/playerlogin", KONTO);
    const token = login?.token;
    expect(typeof token === "string" && token.length > 20, "Kein Token — ohne Anmeldung prüft dieser Fall nichts").toBe(true);
    await page.addInitScript((t) => localStorage.setItem("playerAuthToken", t), token);
    await page.goto("/player/player-detail");
    // Ehrlichkeitsschranke: Die Bilanz muss Werte HABEN, sonst misst der Fall
    // leere Fenster (Gedankenstrich hat keine Wertschicht-Zusicherung).
    // careerstats will die playerId (nicht das Token) und antwortet flach.
    const me = await api(request, "/api/player/getmyinfo", { token });
    const stats = await api(request, "/api/player/careerstats", {
      playerId: me?.player?._id,
    });
    expect(
      (stats?.stats?.games ?? 0) > 0,
      "Konto ohne Spiele — Fall kann die Wertschicht nicht messen. Seed-Skripte ausführen."
    ).toBe(true);
  }

  // Alle Wert-Schichten in der Karriere-Bilanz-Tafel, mit gerenderter Deckkraft.
  const WERT_DECKKRAFT = () => {
    const h = [...document.querySelectorAll("h2")].find((x) => /Karriere-Bilanz/i.test(x.textContent));
    const tafel = h?.closest(".overflow-hidden");
    if (!tafel) return null;
    const werte = [...tafel.querySelectorAll(".font-segment span")].filter((s) =>
      s.className.includes("absolute")
    );
    return werte.map((w) => Number(getComputedStyle(w).opacity));
  };

  test("normale Bewegung: nach der Ankunft steht jede Zahl auf Deckkraft 1", async ({ page, request }) => {
    await profilOeffnen(page, request);
    await expect(page.getByRole("heading", { name: /Karriere-Bilanz/i })).toBeAttached();
    // Der Scroll steht IN der Poll-Schleife, nicht davor — mit Grund: Die
    // „Dein letztes Spiel"-Karte lädt asynchron OBERHALB der Tafel nach und
    // schiebt sie nach einem einmaligen Scroll wieder unter die Falz. Die
    // 250-ms-Haltezeit der Tafel bricht dann KORREKT ab (genau ihr Zweck),
    // aber ein Test, der nur einmal scrollt, misst danach ewig Deckkraft 0.
    // Ein Mensch scrollt selbst nach; der Test muss es auch tun.
    // Budget je Anlauf: 250 ms Haltezeit + 300 ms Blende + Staffel.
    await expect
      .poll(
        async () => {
          await page.evaluate(() => {
            const h = [...document.querySelectorAll("h2")].find((x) => /Karriere-Bilanz/i.test(x.textContent));
            h?.scrollIntoView({ block: "center" });
          });
          await page.waitForTimeout(900);
          const ops = await page.evaluate(WERT_DECKKRAFT);
          if (!ops || ops.length === 0) return "keine Wertschichten gefunden";
          return ops.every((o) => o === 1) ? "alle sichtbar" : `min ${Math.min(...ops)}`;
        },
        { timeout: 10000, message: "Werte der Tafel erreichen Deckkraft 1 nicht — der Einschalt-Moment findet nicht statt" }
      )
      .toBe("alle sichtbar");
  });

  test("reduzierte Bewegung: Werte sind OHNE Scrollen sofort sichtbar", async ({ browser, request }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await profilOeffnen(page, request);
    // NICHT scrollen: Die Tafel liegt unter der Falz — genau dort muss die
    // reduced-motion-Weiche greifen (sofort an, kein Observer-Warten).
    await expect
      .poll(
        async () => {
          const ops = await page.evaluate(WERT_DECKKRAFT);
          if (!ops || ops.length === 0) return "keine Wertschichten gefunden";
          return ops.every((o) => o === 1) ? "alle sichtbar" : `min ${Math.min(...ops)}`;
        },
        { timeout: 3000, message: "Bei reduzierter Bewegung müssen alle Werte sofort stehen — sonst sieht dieser Nutzer dauerhaft leere Fenster" }
      )
      .toBe("alle sichtbar");
    await ctx.close();
  });
});
