// Deploy-Gate 14.08.2026: Wer darf einen öffentlichen Transfer-Post auslösen?
//
// Entscheidung Patrick auf Kais Gate-Befund A2 hin: `recordTransfer` schreibt
// zwei Dinge, die bislang zusammenfielen – die **Station im Lebenslauf**
// (`TransferEvent`) und die **Neuigkeit** (Feed-Post + Follower-Benachrichtigung).
// Für die sieben echten Wechselwege ist beides richtig. Für den
// Verwaltungspfad `/api/admin/setteamadmin` nicht: Dort korrigiert ein
// Super-Admin eine falsche Zuordnung – es wechselt niemand. Der Post wäre eine
// Nachricht über ein Ereignis, das nie stattgefunden hat, und weder er noch die
// Benachrichtigung sind löschbar; die Rückkorrektur erzeugte einen zweiten
// falschen Post in die Gegenrichtung.
//
// Warum dieser Test den Quelltext liest statt zu klicken – dasselbe Muster wie
// bei `playerregister` in auth.spec.mjs, und aus demselben Grund: Ein
// E2E-Durchlauf müsste einen Spieler auf Super-Admin-Ebene zwischen Teams
// umhängen und dabei Kader, Slots und Feed hinterlassen, wie er sie vorfand.
// Die Regel dahinter ist billiger zu prüfen und trifft genau das, was brechen
// kann: dass jemand `still: true` entfernt oder es an der falschen Stelle
// ergänzt und damit den Feed für echte Wechsel stumm schaltet.
import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { PROJECT_ROOT } from "./helpers/env.mjs";

// ⚠️ Absolut ab PROJECT_ROOT, nicht relativ zum Prozess-cwd (Befund A2 von
// Kai). Ein relatives „app" findet je nach Aufrufort nichts – und ein leerer
// Scan ist der klassische Falsch-Grün einer Quelltext-Prüfung. Die
// Wächter-Zusicherung unten fängt das zwar ab, aber erst als Fehlschlag.
const WURZELN = [join(PROJECT_ROOT, "app"), join(PROJECT_ROOT, "lib")];

// Die Datei, die `recordTransfer` DEFINIERT – ihre Signatur enthält denselben
// Text wie ein Aufruf und würde sonst als achter Aufrufer gezählt.
const DEFINITION = join("lib", "recordTransfer.js");

// Die Pfade, die still bleiben MÜSSEN. Verwaltungswerkzeuge, keine echten
// Wechsel.
const VERWALTUNG = [join("api", "admin", "setteamadmin")];

// Argumentliste eines Aufrufs exakt abgreifen – von der öffnenden Klammer bis
// zur zugehörigen schließenden, mit Klammerzählung.
//
// ⚠️ Die erste Fassung nahm stattdessen eine feste Scheibe von 400 Zeichen ab
// `recordTransfer(`. Kai hat nachgemessen, dass das heute schon nicht reicht:
// Der Aufruf in `app/api/team/create/route.js` misst **416** Zeichen, weil ein
// langer Kommentar IM Argument-Objekt steht. Ein `still: true` als letzte
// Eigenschaft hätte dort außerhalb des Fensters gelegen – Test 2 wäre grün
// geblieben, während der Gründungs-Transfer still aus dem Feed verschwindet.
// Umgekehrt lief das Fenster bei den kurzen Aufrufen (77–115 Zeichen) weit in
// den Folgecode und hätte ein `still` aus einer ganz anderen Anweisung dem
// Aufruf zugerechnet. Eine feste Scheibe ist eben keine Klammer.
function argumenteVon(inhalt, startIndex) {
  const auf = inhalt.indexOf("(", startIndex);
  if (auf === -1) return "";
  let tiefe = 0;
  for (let i = auf; i < inhalt.length; i++) {
    const z = inhalt[i];
    if (z === "(") tiefe++;
    else if (z === ")") {
      tiefe--;
      if (tiefe === 0) return inhalt.slice(auf + 1, i);
    }
  }
  return inhalt.slice(auf + 1); // unbalanciert – dann lieber zu viel als zu wenig
}

function aufruferSammeln() {
  const treffer = [];
  const durchsuchen = (verzeichnis) => {
    for (const eintrag of readdirSync(verzeichnis)) {
      const pfad = join(verzeichnis, eintrag);
      if (statSync(pfad).isDirectory()) {
        durchsuchen(pfad);
        continue;
      }
      if (!/\.(js|jsx)$/.test(eintrag)) continue;
      if (pfad.includes(DEFINITION)) continue; // die Funktion selbst
      const inhalt = readFileSync(pfad, "utf8");
      // ⚠️ JEDEN Aufruf der Datei erfassen, nicht nur den ersten (Befund A2 von
      // Kai): Heute steht in jeder Route genau einer, ein zweiter wäre bislang
      // unsichtbar geblieben.
      let ab = inhalt.indexOf("recordTransfer(");
      while (ab !== -1) {
        const argumente = argumenteVon(inhalt, ab);
        treffer.push({ pfad, still: /still\s*:\s*true/.test(argumente) });
        ab = inhalt.indexOf("recordTransfer(", ab + 1);
      }
    }
  };
  // `lib` wird mitgescannt (Befund A2): Ein künftiger Wrapper dort wäre sonst
  // nie erfasst.
  for (const w of WURZELN) durchsuchen(w);
  return treffer;
}

test.describe("Transfer-Post nur bei echten Wechseln", () => {
  test("der Verwaltungspfad schickt still:true mit", async () => {
    const aufrufer = aufruferSammeln();
    expect(aufrufer.length, "keine Aufrufer gefunden – Suchmuster prüfen").toBeGreaterThan(0);

    for (const pfadTeil of VERWALTUNG) {
      const treffer = aufrufer.filter((a) => a.pfad.includes(pfadTeil));
      expect(treffer.length, `kein recordTransfer-Aufruf in ${pfadTeil}`).toBeGreaterThan(0);
      const laut = treffer.filter((t) => !t.still).map((t) => t.pfad);
      expect(
        laut,
        `Verwaltungspfad ohne still:true – eine Admin-Korrektur würde einen ` +
          `öffentlichen Post und Follower-Benachrichtigungen auslösen: ${laut.join(", ")}`
      ).toEqual([]);
    }
  });

  test("die echten Wechselwege bleiben laut", async () => {
    // Die Gegenrichtung ist genauso wichtig. Würde jemand `still: true` aus
    // Vorsicht überall ergänzen, verschwände der Transfer aus dem Feed – ohne
    // dass irgendein Test rot würde, denn „kein Post" wirft keinen Fehler.
    const aufrufer = aufruferSammeln().filter(
      (a) => !VERWALTUNG.some((v) => a.pfad.includes(v))
    );
    expect(aufrufer.length, "keine echten Wechselwege gefunden").toBeGreaterThan(0);

    const stumm = aufrufer.filter((a) => a.still).map((a) => a.pfad);
    // ⚠️ Der Meldungstext ist hier Teil des Tests (Befund A2 von Kai): Kommt
    // irgendwann ein NEUER Verwaltungspfad dazu, der zu Recht `still: true`
    // setzt, wird dieser Test rot – und eine Meldung, die nur „Transfer taucht
    // nicht mehr im Feed auf" sagt, schickt den Nächsten dazu, das `still` zu
    // ENTFERNEN statt die Liste zu ergänzen. Dann wäre der Test die Ursache des
    // Fehlers, den er verhindern soll.
    expect(
      stumm,
      `Wechselweg mit still:true, der nicht als Verwaltungspfad geführt wird: ` +
        `${stumm.join(", ")}\n` +
        `→ Ist das ein ECHTER Wechsel? Dann muss still:true weg, sonst fehlt der ` +
        `Transfer im Feed.\n` +
        `→ Ist es ein VERWALTUNGSPFAD (Korrekturwerkzeug, es wechselt niemand)? ` +
        `Dann gehört er oben in die Liste VERWALTUNG.`
    ).toEqual([]);
  });

  // ⚠️ Titel bewusst so und nicht „der stille Modus überspringt Post und
  // Benachrichtigung" (Befund A2 von Kai): Dieser Test vergleicht
  // ZEICHENPOSITIONEN im Quelltext, nicht den Kontrollfluss. Er bliebe grün,
  // wenn `TransferEvent.create` in einen Zweig wanderte oder ein zweites
  // `if (still) return` weiter oben dazukäme. Ein Test, dessen Name mehr
  // verspricht als sein Rumpf hält, ist gefährlicher als gar keiner – er
  // beruhigt.
  test("die Reihenfolge in recordTransfer.js stimmt", async () => {
    // Sie trägt die ganze Entscheidung: Erst `TransferEvent.create`, dann der
    // Ausstieg, dann alles Öffentliche. Steht der Ausstieg zu früh, fehlt die
    // Karriere-Station – genau die Lücke, die dieser Aufruf schließen sollte.
    const quelle = readFileSync(join(PROJECT_ROOT, "lib", "recordTransfer.js"), "utf8");

    const beiEvent = quelle.indexOf("TransferEvent.create");
    const beiAusstieg = quelle.indexOf("if (still) return");
    // ⚠️ Den AUFRUF suchen, nicht den Import – `autoPostTransfer` steht auch in
    // der Importzeile ganz oben, und die liegt naturgemäß vor allem anderen.
    // Beim ersten Lauf genau daran gescheitert.
    const beiPost = quelle.indexOf("await autoPostTransfer(");
    const beiNotify = quelle.indexOf("notifications:");

    expect(beiEvent, "TransferEvent.create nicht gefunden").toBeGreaterThan(-1);
    expect(beiAusstieg, "stiller Ausstieg nicht gefunden").toBeGreaterThan(-1);
    expect(beiAusstieg, "der stille Ausstieg liegt VOR TransferEvent.create – " +
      "dann entsteht keine Karriere-Station").toBeGreaterThan(beiEvent);
    expect(beiPost, "der Feed-Post liegt vor dem stillen Ausstieg").toBeGreaterThan(beiAusstieg);
    expect(beiNotify, "die Benachrichtigung liegt vor dem stillen Ausstieg").toBeGreaterThan(
      beiAusstieg
    );
  });
});
