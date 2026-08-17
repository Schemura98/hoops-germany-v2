// Deploy-Gate 14.08.2026: Rechtsverweise auf kontoerzeugenden Seiten.
//
// Befund Nora (`docs/RECHT-MINDESTALTER-2026-08-14.md`, Punkt P-1) – der
// einzige echte PFLICHT-Punkt ihrer Prüfung, und er hat nichts mit „ab 16" zu
// tun: `/signup` verweist über `components/layout/AuthShell.js` auf
// Datenschutzerklärung und Impressum. Die beiden anderen Wege, auf denen ein
// Konto entsteht – `/team/join/[token]` und `/team/claim/[token]` – bringen
// eine EIGENE `Shell` mit, importieren weder `AuthShell` noch `Footer`, und
// `Footer` steht nicht im Wurzel-Layout. Auf zwei von drei kontoerzeugenden
// Wegen fehlte der Verweis damit ganz (Art. 13 DSGVO, § 5 DDG).
//
// Warum Quelltext statt Klicken – dasselbe Muster wie die
// `playerregister`-Prüfung in `auth.spec.mjs`, und aus demselben Grund: Die
// beiden Einladungsseiten verlangen ein Team samt gültigem Token, ein
// E2E-Durchlauf wäre teuer und träge. Die Regel dahinter ist billig zu prüfen
// und trifft genau das, was brechen kann – eine neue kontoerzeugende Seite,
// die ihre eigene Hülle mitbringt und den Verweis vergisst. Nora hat diesen
// Test ausdrücklich empfohlen, weil dieselbe Bauart die Mindestalter-Lücke
// gefunden hat.
import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { PROJECT_ROOT } from "./helpers/env.mjs";

// Die Route, über die ein Konto entsteht. Wer sie aufruft, zeigt ein
// Registrierungsformular – und braucht die Verweise.
const REGISTRIER_ROUTE = "/api/player/playerregister";

function seitenMitRegistrierung() {
  const treffer = [];
  const durchsuchen = (verzeichnis) => {
    for (const eintrag of readdirSync(verzeichnis)) {
      const pfad = join(verzeichnis, eintrag);
      if (statSync(pfad).isDirectory()) {
        durchsuchen(pfad);
        continue;
      }
      if (!/\.(js|jsx)$/.test(eintrag)) continue;
      const inhalt = readFileSync(pfad, "utf8");
      if (!inhalt.includes(REGISTRIER_ROUTE)) continue;
      if (pfad.includes(join("api", "player", "playerregister"))) continue; // die Route selbst
      treffer.push({ pfad, inhalt });
    }
  };
  durchsuchen("app");
  return treffer;
}

// Der Verweis kann direkt in der Seite stehen ODER über eine gemeinsame Hülle
// kommen. Beides ist in Ordnung – geprüft wird das Ergebnis, nicht der Weg.
const HUELLEN_MIT_VERWEIS = [
  {
    name: "RechtsLinks",
    datei: join("components", "layout", "RechtsLinks.js"),
  },
  { name: "AuthShell", datei: join("components", "layout", "AuthShell.js") },
  { name: "Footer", datei: join("components", "layout", "Footer.js") },
];

// Trägt diese Datei die Verweise – selbst oder über eine andere Hülle?
// ⚠️ Die zweite Ebene ist nötig, seit `AuthShell` die Links nicht mehr selbst
// enthält, sondern `RechtsLinks` einbindet: `/signup` importiert `AuthShell`,
// nicht `RechtsLinks`. Eine einstufige Prüfung hätte /signup fälschlich als
// „ohne Verweis" gemeldet – ein Test, der beim Aufräumen rot wird, obwohl die
// Sache in Ordnung ist, wird beim nächsten Mal abgeschaltet statt gelesen.
function huelleTraegt(zielPfad, tiefe = 0) {
  if (tiefe > 3) return false; // Schutz gegen zirkuläre Importe
  try {
    const inhalt = readFileSync(zielPfad, "utf8");
    if (inhalt.includes("/datenschutz") && inhalt.includes("/impressum"))
      return true;
    return HUELLEN_MIT_VERWEIS.some(
      (h) =>
        h.datei !== zielPfad &&
        inhalt.includes(h.name) &&
        huelleTraegt(h.datei, tiefe + 1),
    );
  } catch {
    return false;
  }
}

test.describe("Rechtsverweise auf kontoerzeugenden Seiten (Art. 13 DSGVO, § 5 DDG)", () => {
  test("jede Seite mit Registrierung verweist auf Datenschutz und Impressum", async () => {
    const seiten = seitenMitRegistrierung();
    expect(
      seiten.length,
      "keine kontoerzeugende Seite gefunden – Suchmuster prüfen",
    ).toBeGreaterThan(0);

    const traegerHuellen = HUELLEN_MIT_VERWEIS.filter((h) =>
      huelleTraegt(h.datei),
    );

    const ohne = [];
    for (const seite of seiten) {
      const direkt =
        seite.inhalt.includes("/datenschutz") &&
        seite.inhalt.includes("/impressum");
      const ueberHuelle = traegerHuellen.some((h) =>
        seite.inhalt.includes(h.name),
      );
      if (!direkt && !ueberHuelle) ohne.push(seite.pfad);
    }

    expect(
      ohne,
      `Diese Seiten legen ein Konto an, verweisen aber weder selbst noch über eine ` +
        `Hülle auf /datenschutz und /impressum: ${ohne.join(", ")}`,
    ).toEqual([]);
  });

  test("der Weg zum Kontaktformular steht im Footer", async () => {
    // Die Benachrichtigung `team_assigned` endet mit „schreib uns über das
    // Kontaktformular" – und das ist dort das Einzige, was den Empfänger
    // handlungsfähig macht: Anders als bei `own_stats` gibt es nichts
    // anzuklicken (Wortlaut Nele, Prüfhinweis Kai A8). Bricht der Weg dorthin
    // weg, wird aus einem Ausweg eine Sackgasse, ohne dass irgendetwas rot
    // wird. Dieselbe Klasse Zusage wie die Rechtsverweise oben, deshalb hier.
    const footer = readFileSync(
      join(PROJECT_ROOT, "components", "layout", "Footer.js"),
      "utf8",
    );
    expect(footer, "Footer verlinkt /kontakt nicht mehr").toContain("/kontakt");

    const route = join(PROJECT_ROOT, "app", "kontakt", "page.js");
    expect(
      () => readFileSync(route, "utf8"),
      "app/kontakt/page.js fehlt",
    ).not.toThrow();

    // Und beide Nachrichten müssen weiter auf genau diesen Weg zeigen.
    // ⚠️ Sie nennen das Wort „Kontakt", nicht „Kontaktformular" (Angleichung
    // Nele): Der Footer-Eintrag und die `h1` auf /kontakt heißen so, und wer
    // ein Wort genannt bekommt, sucht auf der Seite danach.
    for (const [datei, wofuer] of [
      [
        join("app", "api", "admin", "setteamadmin", "route.js"),
        "team_assigned",
      ],
      [join("lib", "notifyTeamAdminRevoked.js"), "team_admin_revoked"],
    ]) {
      const quelle = readFileSync(join(PROJECT_ROOT, datei), "utf8");
      expect(
        /schreib uns über [„"]Kontakt/.test(quelle),
        `die ${wofuer}-Nachricht verweist nicht mehr auf „Kontakt" – ` +
          `dann diesen Test anpassen oder entfernen`,
      ).toBe(true);
    }
  });

  test("die Hüllen tragen die Verweise auch wirklich", async () => {
    // Ohne diese Gegenprobe wäre der Test oben wertlos, sobald jemand die
    // Verweise aus AuthShell entfernt: Die Seiten importieren die Hülle
    // weiterhin, der Test bliebe grün, und der Verweis wäre trotzdem weg.
    const traeger = HUELLEN_MIT_VERWEIS.filter((h) => huelleTraegt(h.datei));
    expect(
      traeger.map((t) => t.name),
      "keine der bekannten Hüllen trägt noch beide Verweise",
    ).not.toEqual([]);
  });
});
