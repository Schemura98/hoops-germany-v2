// Deploy-Gate 14.08.2026: Vollständigkeit der Benachrichtigungstypen.
//
// `CLAUDE.md` führt die Regel seit dem 13.08.2026 als verbindlich:
//
//   „Ein neuer Typ muss an allen drei Stellen gepflegt werden, sonst entsteht
//    ein Eintrag ohne Symbol oder ohne Ziel."
//
//   1. Typ-Enum          → models/Player.js
//   2. Symbol            → components/layout/NotificationBell.js (ICON)
//   3. Ziel              → lib/notifications.js (notificationHref)
//
// Geprüft hat das bisher nichts. Eine Regel, die nur in der Doku steht, wird
// beim vierten Mal vergessen — und der Schaden ist still: Eine Benachrichtigung
// ohne Symbol sieht kaputt aus, eine ohne Ziel führt beim Klick nirgendwohin,
// und beides fällt erst dem Nutzer auf. Dieser Test macht die Regel prüfbar.
//
// Anlass war der neue Typ `team_assigned` (stille Notiz an einen Spieler, dessen
// Vereinszuordnung ein Super-Admin geändert hat).
import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import { join } from "path";
import { PROJECT_ROOT } from "./helpers/env.mjs";

function lies(...teile) {
  return readFileSync(join(PROJECT_ROOT, ...teile), "utf8");
}

// Typen aus dem Enum in models/Player.js.
//
// ⚠️ Klammerzählung statt `indexOf("]")` (Befund A7 von Kai) – dieselbe
// Schwäche, die er tags zuvor in `transfer-still.spec.mjs` gefunden hat: Eine
// eckige Klammer in einem der Kommentare INNERHALB des Enum-Blocks hätte die
// Liste gekappt, und beide Tests wären auf der Kurzliste still grün
// durchgelaufen. In einem Test, dessen einziger Zweck das Verhindern stiller
// Lücken ist.
function typenAusModell() {
  const quelle = lies("models", "Player.js");
  const ab = quelle.indexOf("enum: [");
  expect(ab, "enum-Block in models/Player.js nicht gefunden").toBeGreaterThan(-1);

  const auf = quelle.indexOf("[", ab);
  let tiefe = 0;
  let bis = -1;
  for (let i = auf; i < quelle.length; i++) {
    if (quelle[i] === "[") tiefe++;
    else if (quelle[i] === "]") {
      tiefe--;
      if (tiefe === 0) {
        bis = i;
        break;
      }
    }
  }
  expect(bis, "enum-Block nicht geschlossen – Klammerzählung gescheitert").toBeGreaterThan(auf);

  const block = quelle.slice(auf, bis);
  // Nur echte Werte, keine Wörter aus den Kommentarzeilen dazwischen.
  const typen = block
    .split(/\r?\n/)
    .filter((z) => !z.trim().startsWith("//"))
    .flatMap((z) => [...z.matchAll(/"([a-z_]+)"/g)].map((m) => m[1]));

  // Wächter direkt in der Quelle, nicht in jedem einzelnen Test: Ohne ihn
  // wäre eine leere Liste in JEDEM Test still grün (A7b).
  expect(typen.length, "keine Typen gelesen – Suchmuster prüfen").toBeGreaterThan(5);
  return typen;
}

test.describe("Benachrichtigungstypen sind vollständig gepflegt", () => {
  test("jeder Typ hat ein Symbol – ohne Ausnahmen", async () => {
    const typen = typenAusModell();

    // ⚠️ KEINE Ausnahmeliste mehr (Befund B1 von Kai). Die erste Fassung nahm
    // sechs Typen aus, weil sie „nur Admins in eigenen Oberflächen" sähen.
    // Das war sachlich falsch: `app/api/player/getnotifications/route.js`
    // filtert überhaupt nicht nach Typ, `NotificationBell` rendert jeden
    // gelieferten Eintrag, und `app/api/team/set-member-admin/route.js`
    // schiebt `team_admin_granted` an ein ganz normales Kadermitglied.
    // Super-Admins und Team-Admins SIND Spieler und sehen dieselbe Glocke.
    // Der Test hätte damit sechs echte Lücken zertifiziert – und die
    // Gegenprobe war wertlos, weil der neu geprüfte Typ nicht in der Liste
    // stand. Eine Ausnahmeliste ist der bequemste Weg, einen Test grün zu
    // bekommen; deshalb steht hier keine.
    const tabelle = lies("lib", "notifications.js");
    const ab = tabelle.indexOf("export const NOTIF_ICON = {");
    expect(ab, "NOTIF_ICON-Tabelle nicht gefunden").toBeGreaterThan(-1);
    const iconBlock = tabelle.slice(ab, tabelle.indexOf("};", ab));

    const ohne = typen.filter((t) => !new RegExp(`\\b${t}\\s*:`).test(iconBlock));
    expect(
      ohne,
      `Typen ohne Symbol in NOTIF_ICON: ${ohne.join(", ")}\n` +
        `→ Eintrag in lib/notifications.js ergänzen. Ohne ihn rendert die ` +
        `Benachrichtigung mit dem generischen Glocken-Symbol, und zwar in beiden Glocken.`
    ).toEqual([]);
  });

  test("beide Glocken nutzen dieselbe Symbol-Tabelle", async () => {
    // Die zweite Umsetzung in `Navbar.js` hatte bis zum 14.08.2026 gar keine
    // Zuordnung und rendete für JEDEN Typ hart einen Basketball – unabhängig
    // gemeldet von Kai (A3) und Tobias. Der Symbol-Test oben konnte das
    // strukturell nicht merken, weil er nur eine Datei kannte.
    // ⚠️ Auf die INDIZIERUNG prüfen, nicht auf den Namen (Befund Kai): Ein
    // bloßes `includes("NOTIF_ICON")` ist schon durch die Importzeile erfüllt.
    // Wer importiert und daneben ein Symbol hart stehen lässt – genau der
    // Zustand, den dieser Test verhindern soll –, wäre grün geblieben.
    for (const datei of [
      ["components", "layout", "NotificationBell.js"],
      ["components", "layout", "Navbar.js"],
    ]) {
      const quelle = lies(...datei);
      expect(
        /NOTIF_ICON\[\s*n\.type\s*\]/.test(quelle),
        `${datei.join("/")} schlägt das Symbol nicht in der gemeinsamen Tabelle nach`
      ).toBe(true);
    }
  });

  test("jeder Typ hat ein Ziel", async () => {
    const typen = typenAusModell();
    const ziele = lies("lib", "notifications.js");

    // `notificationHref` endet mit generischen Zweigen (`n.teamSlug`,
    // `n.matchId`). Ein Typ gilt als gepflegt, wenn er dort namentlich
    // vorkommt – nur dann ist bewusst über sein Ziel entschieden worden.
    const ohne = typen.filter((t) => !ziele.includes(`"${t}"`));
    // Diese fallen bewusst auf den generischen `n.teamSlug`-Zweig, und das
    // Ziel ist dort das richtige – alle Erzeuger setzen den Slug:
    //   join_approved → handlejoinrequest, join-via-link, respond-invite,
    //                   roster/approve-claim, roster/request-claim
    //   transfer      → recordTransfer (`refTeam = to || from`)
    // ⚠️ Korrektur zu A4 (Kai): Eine frühere Fassung nannte hier zusätzlich
    // `fromPlayerId` als generischen Zweig. Das ist falsch – der wird
    // ausschließlich INNERHALB des `follow`-Falls ausgewertet. Für `transfer`
    // ist `n.teamSlug` der einzige Auffangzweig; ist das Team inzwischen
    // gelöscht, liefert `notificationHref` `null` und der Eintrag ist nicht
    // klickbar. Schmaler Fall, aber die Begründung muss stimmen.
    const ERLAUBT_GENERISCH = ["transfer", "join_approved"];
    const echteLuecken = ohne.filter((t) => !ERLAUBT_GENERISCH.includes(t));
    expect(
      echteLuecken,
      `Typen ohne eigenes Ziel in notificationHref: ${echteLuecken.join(", ")}\n` +
        `→ Entweder in notificationHref aufnehmen oder oben als bewusst generisch eintragen.`
    ).toEqual([]);
  });

  test("die Notiz entsteht nur bei einer echten Zuordnungsänderung", async () => {
    // Von Kai und Tobias unabhängig vorgeschlagen. Die Zusage dieses Commits
    // ist nicht nur „es kommt eine Notiz", sondern auch „es kommt KEINE, wenn
    // sich nichts geändert hat" – sonst meldet die Plattform ein Ereignis, das
    // nicht stattgefunden hat. Tobias hat es dreimal am Produkt belegt; dieser
    // Test hält die Bedingung im Quelltext fest, damit sie bei einem Umbau
    // nicht still wegfällt (eine ausbleibende Notiz wirft keinen Fehler).
    const quelle = lies("app", "api", "admin", "setteamadmin", "route.js");

    expect(quelle, "die Bedingung `zuordnungGeaendert` fehlt").toContain("zuordnungGeaendert");
    // Sie muss den Aufruf tatsächlich bewachen, nicht nur irgendwo stehen.
    expect(
      /if\s*\(\s*zuordnungGeaendert\s*\)\s*\{[\s\S]{0,200}?benachrichtigeZuordnung/.test(quelle),
      "benachrichtigeZuordnung wird nicht von zuordnungGeaendert bewacht"
    ).toBe(true);
    // Und sie muss den Vorher-Wert vergleichen, nicht bloß auf Existenz prüfen.
    expect(
      /zuordnungGeaendert\s*=\s*String\(/.test(quelle),
      "zuordnungGeaendert vergleicht nicht das vorherige Team"
    ).toBe(true);
  });

  for (const typ of ["team_assigned", "team_admin_revoked"]) {
    test(`der Typ ${typ} ist an allen drei Stellen da`, async () => {
      // Namentlich, weil beide der Anlass dieser Datei waren und weil die drei
      // Fundstellen zusammengehören – fällt eine weg, ist der Rest wertlos.
      expect(typenAusModell(), `${typ} fehlt im Enum`).toContain(typ);
      const zentral = lies("lib", "notifications.js");
      expect(zentral, `${typ} fehlt in NOTIF_ICON`).toContain(`${typ}:`);
      expect(zentral, `${typ} fehlt in notificationHref`).toContain(`"${typ}"`);
    });
  }

  test("der Rechteentzug führt NICHT auf /team/admin", async () => {
    // ⚠️ Genau die Abweisung dort ist der Zustand, den diese Nachricht ersetzen
    // soll – ein Klick, der in die Absage führt, macht die Notiz zur
    // Ankündigung einer Kränkung (Nele). Der Empfänger bleibt Mitglied, also
    // gehört er auf die Vereinsseite.
    const quelle = lies("lib", "notifications.js");
    const ab = quelle.indexOf('n.type === "team_admin_revoked"');
    expect(ab, "team_admin_revoked kommt in notificationHref nicht vor").toBeGreaterThan(-1);

    // ⚠️ Den if-Block per Klammerzählung abgrenzen, NICHT über ein festes
    // Zeichenfenster. Ein erster Versuch nahm 300 Zeichen ab der Fundstelle –
    // die reichten bis in den NÄCHSTEN Zweig (`team_admin_granted`), der zu
    // Recht auf /team/admin zeigt, und der Test schlug fälschlich an. Genau die
    // Falle, die Kai zuvor zweimal gezeigt hat; sie ist mir trotzdem wieder
    // passiert.
    const auf = quelle.indexOf("{", ab);
    let tiefe = 0;
    let bis = auf;
    for (let i = auf; i < quelle.length; i++) {
      if (quelle[i] === "{") tiefe++;
      else if (quelle[i] === "}") {
        tiefe--;
        if (tiefe === 0) {
          bis = i;
          break;
        }
      }
    }
    const zweig = quelle.slice(auf, bis);

    expect(zweig, "der Rechteentzug führt nicht auf die Vereinsseite").toContain(
      "/team/team-detail/"
    );
    expect(
      /["'`]\/team\/admin["'`]/.test(zweig),
      "der Rechteentzug zeigt auf /team/admin – dort wird der Empfänger abgewiesen"
    ).toBe(false);
  });
});
