// „Deine Zahlen" im Feed gehören dem BETRACHTER – niemandem sonst.
//
// WARUM ES DIESEN TEST BRAUCHT (Übergabe Kai UND Tobias, Gates 18.08.2026)
// Seit dem 18.08. hängt `lib/eigeneZahlen.js` an jeden Ergebnis-Beitrag die
// Box-Score-Werte des angemeldeten Nutzers. Beide Prüfer haben denselben Satz
// geschrieben: heute korrekt, aber nichts hält es fest. Tobias wörtlich – „ein
// Schreibfehler, der die Werte am Beitrag statt am Betrachter ablegt, würde
// stumm durchgehen und wäre sofort ein Datenschutzvorfall."
//
// Genau so ein Fehler ist billig gemacht: Es genügt, das Ergebnis der
// Anreicherung zu speichern statt es pro Anfrage zu berechnen – etwa aus dem
// nachvollziehbaren Wunsch, die zusätzliche Abfrage zu sparen. Dann sähe der
// nächste Leser die Zahlen eines fremden Menschen unter der Überschrift
// „Deine Zahlen", und im Feed stünde nichts Auffälliges.
//
// ⚠️ Der Test prüft die API, nicht die Darstellung. Das ist Absicht: Die Frage
// „wessen Werte kommen an" entscheidet sich im Server, und dort ist sie ohne
// Browser-Zufall messbar. Die Darstellung deckt `beleg-aussage.spec.mjs` ab.
import { test, expect } from "@playwright/test";

// Vier Konten aus der Dev-DB, alle im SELBEN Spiel – die Werte stammen aus
// `scripts/seed-feed-lebendig.mjs` (Test Baskets 78:71 Rhein Ballers).
// ⚠️ Sie sind hier NICHT fest verdrahtet: Der Test liest die Sollwerte unten
// aus der API des jeweiligen Kontos und vergleicht sie gegenseitig. Feste
// Zahlen wären beim nächsten Seed-Lauf falsch – dieselbe Fehlerklasse wie die
// festen Schrittzahlen in `tour-ohne-konto.spec.mjs`.
const MITSPIELER = ["max@test.de", "leon.schneider2@test.de"];
// Steht in KEINEM Box-Score (gemessen, nicht angenommen).
const UNBETEILIGT = "jay.carter@test.de";
const PW = "test123";

async function anmelden(request, email) {
  const res = await request.post("/api/player/playerlogin", {
    data: { email, password: PW },
  });
  const j = await res.json().catch(() => ({}));
  const token = j?.data?.token || j?.token;
  expect(
    typeof token === "string" && token.length > 20,
    `Kein Token für ${email} – ohne Anmeldung prüft dieser Test nichts. ` +
      `Antwort: ${JSON.stringify(j).slice(0, 160)}`,
  ).toBe(true);
  return token;
}

// Holt den Feed und gibt die Ergebnis-Beiträge nach Spiel-Kennung zurück.
async function ergebnisseAusFeed(request, token) {
  const res = await request.post("/api/posts/feed", {
    data: { token, limit: 50, offset: 0 },
  });
  const j = await res.json().catch(() => ({}));
  const posts = j?.posts || [];
  const nachSpiel = new Map();
  for (const p of posts) {
    if (p?.autoType === "match_result" && p?.meta?.matchId) {
      nachSpiel.set(String(p.meta.matchId), p);
    }
  }
  return nachSpiel;
}

test.describe("Eigene Zahlen im Feed", () => {
  test("jeder sieht seine eigenen Werte – und nur die", async ({ request }) => {
    const sicht = {};
    for (const email of MITSPIELER) {
      const token = await anmelden(request, email);
      sicht[email] = await ergebnisseAusFeed(request, token);
    }

    // ── Ehrlichkeitsschranke ──────────────────────────────────────────────
    // Ohne gemeinsame Beiträge vergleicht der Test nichts und wäre grün.
    const [a, b] = MITSPIELER;
    const gemeinsam = [...sicht[a].keys()].filter((id) => sicht[b].has(id));
    expect(
      gemeinsam.length,
      `Die beiden Konten haben keinen Ergebnis-Beitrag gemeinsam im Feed – ` +
        `der Vergleich hat nichts zu vergleichen. Erst ` +
        `\`node scripts/seed-feed-lebendig.mjs\` laufen lassen.`,
    ).toBeGreaterThan(0);

    const mitZahlen = gemeinsam.filter(
      (id) => sicht[a].get(id)?.meta?.eigeneZahlen && sicht[b].get(id)?.meta?.eigeneZahlen,
    );
    expect(
      mitZahlen.length,
      `Kein gemeinsamer Beitrag, bei dem BEIDE Konten eigene Zahlen sehen – ` +
        `dann kann dieser Test einen Austausch der Werte gar nicht bemerken. ` +
        `Beide Konten müssen im selben Box-Score stehen.`,
    ).toBeGreaterThan(0);

    // ── Die eigentliche Zusicherung ───────────────────────────────────────
    for (const id of mitZahlen) {
      const zA = sicht[a].get(id).meta.eigeneZahlen;
      const zB = sicht[b].get(id).meta.eigeneZahlen;
      const alsText = (z) => `${z.pkt}/${z.ast}/${z.reb}`;
      expect(
        alsText(zA),
        `Beide Konten sehen im selben Beitrag (${id}) DIESELBEN Zahlen ` +
          `(${alsText(zA)}). Entweder stehen sie zufällig mit identischer ` +
          `Ausbeute im Box-Score – dann sind die Testdaten untauglich – oder ` +
          `die Werte hängen am Beitrag statt am Betrachter. Das zweite wäre ` +
          `ein Datenschutzvorfall: Jeder Leser sähe fremde Zahlen als „deine".`,
      ).not.toBe(alsText(zB));

      // Die Hauptzahl muss zu den Werten passen – sonst zeigt die Karte eine
      // große Zahl, die nicht die bemerkenswerte ist.
      for (const z of [zA, zB]) {
        const erwartet =
          z.ast >= 8 && z.ast > z.pkt ? "ast" : z.reb >= 8 && z.reb > z.pkt ? "reb" : "pkt";
        expect(
          z.haupt,
          `Hauptzahl "${z.haupt}" passt nicht zu ${alsText(z)} – erwartet "${erwartet}". ` +
            `Die Regel steht in lib/eigeneZahlen.js (hauptwert).`,
        ).toBe(erwartet);
      }
    }
  });

  test("wer nicht mitgespielt hat, sieht keine Zahlen", async ({ request }) => {
    const token = await anmelden(request, UNBETEILIGT);
    const feed = await ergebnisseAusFeed(request, token);
    expect(
      feed.size,
      `${UNBETEILIGT} sieht keinen einzigen Ergebnis-Beitrag – dann prüft ` +
        `dieser Test nichts. (Der „Für dich"-Feed ist gerankt; wenn das ` +
        `dauerhaft so ist, muss der Test ein anderes Konto nehmen.)`,
    ).toBeGreaterThan(0);

    const mitZahlen = [...feed.values()].filter((p) => p?.meta?.eigeneZahlen);
    expect(
      mitZahlen.map((p) => `${p.content} → ${JSON.stringify(p.meta.eigeneZahlen)}`),
      `${UNBETEILIGT} steht in keinem Box-Score, bekommt aber Zahlen ` +
        `angezeigt. Das sind zwangsläufig die eines anderen Menschen.`,
    ).toEqual([]);
  });

  test("ohne Anmeldung trägt kein Beitrag persönliche Zahlen", async ({ request }) => {
    for (const [was, daten] of [
      ["ohne Token", { limit: 50 }],
      ["mit ungültigem Token", { token: "kaputt.kaputt.kaputt", limit: 50 }],
    ]) {
      const res = await request.post("/api/posts/feed", { data: daten });
      const j = await res.json().catch(() => ({}));
      const posts = j?.posts || [];
      expect(
        posts.length,
        `${was}: keine Beiträge zurückbekommen – dann sagt dieser Durchgang nichts.`,
      ).toBeGreaterThan(0);
      const verraten = posts
        .filter((p) => p?.meta?.eigeneZahlen)
        .map((p) => `${p.content} → ${JSON.stringify(p.meta.eigeneZahlen)}`);
      expect(
        verraten,
        `${was}: Beiträge tragen persönliche Zahlen, obwohl niemand angemeldet ist.`,
      ).toEqual([]);
    }
  });

  test("das zweite Feed-Register verhält sich gleich", async ({ request }) => {
    // ⚠️ Beide Register müssen anreichern. Steht die Anreicherung nur in einem,
    // sieht derselbe Beitrag unter „Für dich" anders aus als unter „Folge ich" –
    // und niemand käme auf die Idee, das zu suchen.
    const token = await anmelden(request, MITSPIELER[0]);
    const res = await request.post("/api/player/getfollowingposts", {
      data: { token, limit: 50 },
    });
    const j = await res.json().catch(() => ({}));
    const ergebnisse = (j?.posts || []).filter((p) => p?.autoType === "match_result");
    test.skip(
      ergebnisse.length === 0,
      "Keine Ergebnis-Beiträge im „Folge ich\"-Register – hängt daran, wem das " +
        "Konto folgt, und ist keine Aussage über die Anreicherung.",
    );
    expect(
      ergebnisse.some((p) => p?.meta?.eigeneZahlen),
      `Kein einziger Ergebnis-Beitrag im Register „Folge ich" trägt eigene ` +
        `Zahlen, obwohl ${MITSPIELER[0]} in Box-Scores steht. Vermutlich fehlt ` +
        `der Aufruf von \`mitEigenenZahlen\` in getfollowingposts/route.js.`,
    ).toBe(true);
  });
});
