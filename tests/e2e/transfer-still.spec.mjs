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

// Der einzige Pfad, der still bleiben MUSS.
const VERWALTUNG = [join("api", "admin", "setteamadmin")];

function aufruferSammeln(wurzel) {
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
      if (!inhalt.includes("recordTransfer(")) continue;
      // Der Aufruf-Block bis zur schließenden Klammer – `still` muss zum
      // Aufruf gehören, nicht irgendwo sonst in der Datei stehen.
      const ab = inhalt.indexOf("recordTransfer(");
      const block = inhalt.slice(ab, ab + 400);
      treffer.push({ pfad, still: /still\s*:\s*true/.test(block) });
    }
  };
  durchsuchen(wurzel);
  return treffer;
}

test.describe("Transfer-Post nur bei echten Wechseln", () => {
  test("der Verwaltungspfad schickt still:true mit", async () => {
    const aufrufer = aufruferSammeln("app");
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
    const aufrufer = aufruferSammeln("app").filter(
      (a) => !VERWALTUNG.some((v) => a.pfad.includes(v))
    );
    expect(aufrufer.length, "keine echten Wechselwege gefunden").toBeGreaterThan(0);

    const stumm = aufrufer.filter((a) => a.still).map((a) => a.pfad);
    expect(
      stumm,
      `Echter Wechselweg mit still:true – dieser Transfer taucht im Feed nicht ` +
        `mehr auf: ${stumm.join(", ")}`
    ).toEqual([]);
  });

  test("der stille Modus überspringt Post und Benachrichtigung, nicht das Ereignis", async () => {
    // Die Reihenfolge in lib/recordTransfer.js trägt die ganze Entscheidung:
    // Erst `TransferEvent.create`, dann der Ausstieg, dann alles Öffentliche.
    // Steht der Ausstieg zu früh, fehlt die Karriere-Station – genau die Lücke,
    // die dieser Aufruf ursprünglich schließen sollte.
    const quelle = readFileSync(join("lib", "recordTransfer.js"), "utf8");

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
