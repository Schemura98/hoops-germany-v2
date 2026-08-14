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
function typenAusModell() {
  const quelle = lies("models", "Player.js");
  const ab = quelle.indexOf("enum: [");
  expect(ab, "enum-Block in models/Player.js nicht gefunden").toBeGreaterThan(-1);
  const bis = quelle.indexOf("]", ab);
  const block = quelle.slice(ab, bis);
  // Nur echte Werte, keine Wörter aus den Kommentarzeilen dazwischen.
  return block
    .split(/\r?\n/)
    .filter((z) => !z.trim().startsWith("//"))
    .flatMap((z) => [...z.matchAll(/"([a-z_]+)"/g)].map((m) => m[1]));
}

test.describe("Benachrichtigungstypen sind vollständig gepflegt", () => {
  test("jeder Typ hat ein Symbol", async () => {
    const typen = typenAusModell();
    expect(typen.length, "keine Typen gelesen – Suchmuster prüfen").toBeGreaterThan(5);

    const glocke = lies("components", "layout", "NotificationBell.js");
    const ab = glocke.indexOf("const ICON");
    const bis = glocke.indexOf("};", ab);
    const iconBlock = glocke.slice(ab, bis);

    const ohne = typen.filter((t) => !new RegExp(`\\b${t}\\s*:`).test(iconBlock));
    // Bekannte Ausnahmen: Typen, die ausschließlich Super-Admins bzw.
    // Team-Admins in eigenen Oberflächen sehen und in der Spieler-Glocke
    // nicht auftauchen. Wer hier etwas ergänzt, muss begründen, warum der
    // Eintrag NIE in der Glocke landet.
    const ERLAUBT_OHNE_SYMBOL = [
      "team_pending",
      "team_approved",
      "team_admin_granted",
      "league_change_request",
      "league_change_approved",
      "league_change_rejected",
    ];
    const echteLuecken = ohne.filter((t) => !ERLAUBT_OHNE_SYMBOL.includes(t));
    expect(
      echteLuecken,
      `Typen ohne Symbol in NotificationBell.js ICON: ${echteLuecken.join(", ")}\n` +
        `→ Eintrag ergänzen, sonst rendert die Benachrichtigung mit dem Fallback-Symbol.`
    ).toEqual([]);
  });

  test("jeder Typ hat ein Ziel", async () => {
    const typen = typenAusModell();
    const ziele = lies("lib", "notifications.js");

    // `notificationHref` endet mit generischen Zweigen (`n.teamSlug`,
    // `n.matchId`). Ein Typ gilt als gepflegt, wenn er dort namentlich
    // vorkommt – nur dann ist bewusst über sein Ziel entschieden worden.
    const ohne = typen.filter((t) => !ziele.includes(`"${t}"`));
    // Diese fallen bewusst auf die generischen Zweige: Sie tragen immer einen
    // `teamSlug` bzw. `fromPlayerId`, und das generische Ziel ist das richtige.
    const ERLAUBT_GENERISCH = ["transfer", "join_approved"];
    const echteLuecken = ohne.filter((t) => !ERLAUBT_GENERISCH.includes(t));
    expect(
      echteLuecken,
      `Typen ohne eigenes Ziel in notificationHref: ${echteLuecken.join(", ")}\n` +
        `→ Entweder in notificationHref aufnehmen oder oben als bewusst generisch eintragen.`
    ).toEqual([]);
  });

  test("der neue Typ team_assigned ist an allen drei Stellen da", async () => {
    // Namentlich, weil er der Anlass dieses Tests war und weil die drei
    // Fundstellen zusammengehören – fällt eine weg, ist der Rest wertlos.
    expect(typenAusModell(), "team_assigned fehlt im Enum").toContain("team_assigned");
    expect(
      lies("components", "layout", "NotificationBell.js"),
      "team_assigned fehlt in der ICON-Zuordnung"
    ).toContain("team_assigned:");
    expect(
      lies("lib", "notifications.js"),
      "team_assigned fehlt in notificationHref"
    ).toContain('"team_assigned"');
  });
});
