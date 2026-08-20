// Playwright-Konfiguration für die Hoops-Germany-E2E-Suite.
// Start: npx playwright test -c tests/e2e/playwright.config.mjs
//
// ═══════════════════════════════════════════════════════════════════════════
// WARUM DIESE DATEI EINEN BUILD AUSLÖST (Befund H1, Roadmap 23)
// ═══════════════════════════════════════════════════════════════════════════
// Bis zum 20.08.2026 startete hier fest `npm run dev`. Damit konnte die Suite
// eine ganze Fehlerklasse PER KONSTRUKTION nicht sehen: alles, was nur in der
// ausgelieferten Fassung auftritt (statische Vorab-Erzeugung, Minimierung,
// `NODE_ENV=production`, fehlende Dev-Overlays). Am selben Commit, in derselben
// Minute gemessen: Entwicklung 231 grün · Produktion 225 grün, 6 rot.
// Die Projektregel „vor Deploy immer die Production-Runtime testen" und das
// Werkzeug widersprachen sich — das Werkzeug hat verloren.
//
// Die Vorgabe ist deshalb die Production-Runtime. Wer nichts angibt, bekommt
// bauen + `next start`. Der schnelle Dev-Modus ist weiterhin da, aber er muss
// ausdrücklich angefordert werden.
//
// ═══════════════════════════════════════════════════════════════════════════
// STELLSCHRAUBEN (alle über Umgebungsvariablen, alle mit sicherer Vorgabe)
// ═══════════════════════════════════════════════════════════════════════════
//   E2E_PORT=3210     Eigener Port für isolierte Arbeitsbäume. Vorgabe 3000.
//   E2E_MODUS=dev     `next dev` statt der ausgelieferten Fassung. NUR für
//                     schnelles Iterieren am Test selbst — kein Gate-Beleg.
//   E2E_BUILD=auto    Baut nur, wenn eine Quelldatei jünger ist als der Build.
//   E2E_BUILD=aus     Baut nie. Nutzt den vorhandenen Build, wie er ist.
//
// ⚠️ JEDE dieser Entscheidungen wird beim Start GEDRUCKT. Ein übersprungener
// Build, der doch veraltet war, ist genau die Zombie-Falle, die diese Woche
// zweimal einen alten Stand ausgeliefert hat. Sie darf nie stillschweigend
// passieren.
import { defineConfig } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { PROJECT_ROOT } from "./helpers/env.mjs";

const PORT = Number(process.env.E2E_PORT || 3000);
const BASIS = `http://localhost:${PORT}`;
const MODUS = (process.env.E2E_MODUS || "produktion").toLowerCase();
const BUILD_REGEL = (process.env.E2E_BUILD || "immer").toLowerCase();

// `--list` lädt diese Datei nur, um Testnamen aufzuzählen (die Suite wird im
// Projekt regelmäßig damit gegengezählt). Dafür einen Build zu fahren wäre
// reine Wartezeit ohne Nutzen — es startet auch kein Server.
const NUR_AUFLISTEN = process.argv.includes("--list");

const sag = (zeile) => console.log(`[e2e] ${zeile}`);

if (!["produktion", "dev"].includes(MODUS)) {
  throw new Error(
    `E2E_MODUS="${MODUS}" ist unbekannt. Erlaubt: "produktion" (Vorgabe) oder "dev".`,
  );
}
if (!["immer", "auto", "aus"].includes(BUILD_REGEL)) {
  throw new Error(
    `E2E_BUILD="${BUILD_REGEL}" ist unbekannt. Erlaubt: "immer" (Vorgabe), "auto", "aus".`,
  );
}

// ---------------------------------------------------------------------------
// 1) Ist der vorhandene Build jünger als jede Quelldatei?
// ---------------------------------------------------------------------------
// Bewusst grob und in der SICHEREN Richtung ungenau: Im Zweifel wird gebaut.
// Ein zu häufiger Build kostet Sekunden, ein ausgelassener kostet einen
// Fehlalarm oder — schlimmer — ein grünes Gate über altem Code.
const QUELLEN = [
  "app",
  "components",
  "lib",
  "public",
  "models",
  "next.config.mjs",
  "tailwind.config.js",
  "postcss.config.mjs",
  "package.json",
  "package-lock.json",
];

function neuesteQuellAenderung() {
  let neueste = 0;
  let woher = "?";
  const besuche = (p, anzeige) => {
    let s;
    try {
      s = fs.statSync(p);
    } catch {
      return; // Datei existiert nicht — kein Grund zu bauen
    }
    if (s.isDirectory()) {
      for (const kind of fs.readdirSync(p)) {
        if (kind === "node_modules" || kind === ".next" || kind[0] === ".") continue;
        besuche(path.join(p, kind), path.join(anzeige, kind));
      }
      return;
    }
    if (s.mtimeMs > neueste) {
      neueste = s.mtimeMs;
      woher = anzeige;
    }
  };
  for (const q of QUELLEN) besuche(path.join(PROJECT_ROOT, q), q);
  return { neueste, woher };
}

function buildStand() {
  try {
    const p = path.join(PROJECT_ROOT, ".next", "BUILD_ID");
    return { id: fs.readFileSync(p, "utf8").trim(), zeit: fs.statSync(p).mtimeMs };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// 2) Bauen — oder begründet nicht bauen
// ---------------------------------------------------------------------------
function baueWennNoetig() {
  if (MODUS === "dev") {
    sag('MODUS=dev — kein Build. ⚠️ Dieser Lauf ist KEIN Gate-Beleg: Er kann');
    sag("      Fehler der ausgelieferten Fassung per Konstruktion nicht sehen.");
    return;
  }
  if (NUR_AUFLISTEN) {
    sag("--list erkannt — kein Build, kein Server (es wird nur gezählt).");
    return;
  }

  const stand = buildStand();

  if (BUILD_REGEL === "aus") {
    if (!stand) {
      throw new Error(
        "E2E_BUILD=aus, aber es gibt gar keinen Build (.next/BUILD_ID fehlt). " +
          "`next start` hätte nichts auszuliefern.",
      );
    }
    const { neueste, woher } = neuesteQuellAenderung();
    const veraltet = neueste > stand.zeit;
    sag(`E2E_BUILD=aus — es wird NICHT gebaut. Build ${stand.id}`);
    if (veraltet) {
      sag(`      ⚠️ ACHTUNG: "${woher}" ist JÜNGER als dieser Build.`);
      sag("      ⚠️ Dieser Lauf prüft ALTEN Code. Jede Zahl daraus ist wertlos.");
    } else {
      sag("      Der Build ist nach der letzten Quelländerung entstanden.");
    }
    return;
  }

  if (BUILD_REGEL === "auto" && stand) {
    const { neueste, woher } = neuesteQuellAenderung();
    if (neueste <= stand.zeit) {
      const alter = Math.round((Date.now() - stand.zeit) / 1000);
      sag(`E2E_BUILD=auto — Build ${stand.id} ist aktuell (${alter}s alt,`);
      sag(`      jüngste Quelldatei "${woher}" ist älter). Kein Neubau.`);
      return;
    }
    sag(`E2E_BUILD=auto — "${woher}" ist jünger als der Build. Neubau nötig.`);
  }

  sag(`npm run build läuft (Modus: ${MODUS}, Regel: ${BUILD_REGEL}) …`);
  const start = Date.now();
  // Kein NODE_ENV-Eingriff: `next build` setzt es selbst auf "production".
  // Es hier zusätzlich zu setzen sähe gründlich aus, ändert aber nur das
  // Verhalten von npm drumherum — eine Stellschraube ohne Wirkung auf das,
  // was sie zu regeln vorgibt.
  execFileSync("npm", ["run", "build"], {
    cwd: PROJECT_ROOT,
    stdio: "inherit",
  });
  const neu = buildStand();
  sag(`Build fertig in ${((Date.now() - start) / 1000).toFixed(1)}s — BUILD_ID ${neu?.id}`);
}

// ---------------------------------------------------------------------------
// 3) Läuft da schon jemand — und ist er UNSER Build?
// ---------------------------------------------------------------------------
// ⚠️ Das war die gefährlichste Zeile der alten Datei: `reuseExistingServer: true`
// hat JEDEN Server übernommen, der auf dem Port antwortete. Ein verwaister
// Prozess hat so zweimal in einer Woche einen veralteten Build ausgeliefert —
// und die Suite war grün, weil sie nicht wusste, was sie da eigentlich prüft.
//
// Ein `next start` beantwortet `/_next/static/<BUILD_ID>/_buildManifest.js` nur
// für SEINEN eigenen Build mit 200; jeder andere Stand liefert 404. Das ist die
// Identitätsprüfung: gleiche BUILD_ID = derselbe ausgelieferte Code.
// Ein `next dev` kennt diesen Pfad ebenfalls nicht (er liefert unter
// "development") und fällt damit korrekt durch.
async function serverLage(buildId) {
  // Eine einzige Anfrage beantwortet beide Fragen auf einmal: Antwortet
  // überhaupt jemand — und ist es unser Build? Ein Verbindungsfehler heißt
  // "niemand da", jede HTTP-Antwort heißt "da ist wer", und nur die 200 auf
  // GENAU diese BUILD_ID heißt "und zwar wir".
  const pfad = buildId
    ? `/_next/static/${buildId}/_buildManifest.js`
    : "/"; // Modus dev: eine BUILD_ID gibt es nicht, nur "belegt oder frei"
  let status;
  try {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 5000);
    status = (await fetch(`${BASIS}${pfad}`, { signal: c.signal })).status;
    clearTimeout(t);
  } catch {
    return "frei";
  }
  return buildId && status === 200 ? "unser" : "fremd";
}

// ---------------------------------------------------------------------------
// Ablauf
// ---------------------------------------------------------------------------
// ⚠️ DIESE DATEI WIRD NICHT EINMAL GELADEN, SONDERN EINMAL PRO PROZESS —
// also auch in JEDEM Worker, den Playwright startet (und er startet neue,
// sobald eine Testdatei eigene `use`-Werte setzt; diese Suite hat 26 solcher
// Dateien). Nebenwirkungen auf Modulebene laufen deshalb nicht einmal, sondern
// immer wieder.
//
// Beim ersten Anlauf am 20.08.2026 stand `baueWennNoetig()` hier ungeschützt.
// Folge: Der erste Worker baute mitten im Lauf neu, die BUILD_ID wechselte —
// und der Server, den die Suite selbst gestartet hatte, trug ab da eine ANDERE
// BUILD_ID als die Datei auf der Platte. Die Identitätsprüfung unten stufte ihn
// korrekt als „fremd" ein und brach ab: **26 Testdateien rot, 206 Tests nicht
// gelaufen.**
//
// Der Abbruch war das richtige Verhalten — die Prüfung hat einen echten
// Widerspruch gemeldet, nur war der Widerspruch hausgemacht. Ohne sie hätte
// jeder Worker gegen einen anderen Build gemessen, und zwar still.
//
// Bauen und Port prüfen gehören also in den HAUPTPROZESS. Playwright setzt in
// Worker-Prozessen `TEST_WORKER_INDEX` (Worker 0 liefert "0" — deshalb gegen
// `undefined` prüfen, nicht auf Wahrheitswert).
const IM_WORKER = process.env.TEST_WORKER_INDEX !== undefined;

let wiederverwenden = false;

if (!IM_WORKER) baueWennNoetig();

if (!IM_WORKER && !NUR_AUFLISTEN) {
  const id = MODUS === "produktion" ? buildStand()?.id : null;
  const lage = await serverLage(id);

  if (lage === "frei") {
    sag(`Port ${PORT} ist frei — die Suite startet ihren eigenen Server.`);
  } else if (lage === "unser") {
    sag(`Port ${PORT} trägt bereits GENAU diesen Build (${id}) — wiederverwendet.`);
  } else {
    throw new Error(
      [
        "",
        `ABBRUCH: Auf Port ${PORT} läuft ein Server, der NICHT dieser Build ist.`,
        "",
        MODUS === "produktion"
          ? `  Erwartet: ein \`next start\` mit BUILD_ID "${id}".`
          : "  Im Modus dev lässt sich ein laufender Server nicht identifizieren.",
        "  Gefunden: irgendetwas anderes (fremder Build, `next dev`, anderes Projekt).",
        "",
        "  Dieser Lauf wird NICHT gestartet. Ein Server unbekannter Herkunft",
        "  liefert unbekannten Code aus — eine grüne Suite darüber wäre wertlos.",
        "  Genau so sind diese Woche zweimal alte Stände durch ein Gate gekommen.",
        "",
        "  Zwei Auswege:",
        `    1) Den fremden Server beenden:  sh scripts/port-frei.sh ${PORT}`,
        "       (nennt die PID; `preview_stop` allein beendet ihn NICHT)",
        `    2) Einen eigenen Port nehmen:   E2E_PORT=3210 npx playwright test …`,
        "",
      ].join("\n"),
    );
  }
  wiederverwenden = lage === "unser";
}

const KOMMANDO =
  MODUS === "dev"
    ? `npm run dev -- -p ${PORT}`
    : `npx next start -p ${PORT}`;

export default defineConfig({
  testDir: ".",
  outputDir: "./.artifacts/test-results",
  globalSetup: "./global-setup.mjs",
  globalTeardown: "./global-teardown.mjs",
  // Seriell: kleine Suite, deterministisch, kein Registry-Race.
  workers: 1,
  fullyParallel: false,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: {
    baseURL: BASIS,
    headless: true,
    navigationTimeout: 60_000,
    screenshot: "only-on-failure",
  },
  webServer: {
    command: KOMMANDO,
    url: BASIS,
    cwd: PROJECT_ROOT,
    // Nur dann true, wenn oben NACHGEWIESEN wurde, dass der laufende Server
    // unser eigener Build ist. Nie als bequeme Vorgabe.
    reuseExistingServer: wiederverwenden,
    timeout: 180_000,
  },
});
