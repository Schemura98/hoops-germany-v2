# Messjob Wiederkehr-Quote — Baubericht und Beweisführung

**Kai (test-automatisierung) · 23.08.2026 · Auftrag: der Messjob zur Go/No-Go-Zahl der Testphase**

**Bindende Spezifikation:** `docs/WIEDERKEHR-RATE-DEFINITION-2026-08-23.md` (Ronja).
**Gebaut:** `scripts/wiederkehr-rate.mjs` (der Job, rein lesend) · `lib/wiederkehrRate.js`
(der Rechenkern, ohne Datenbank — damit alles heute prüfbar ist) ·
`tests/e2e/wiederkehr-rate.spec.mjs` (der Wächter, 10 Fälle).

---

## 1. Was der Job tut — in einem Absatz

Er beantwortet die eine Frage der Testphase: **Wie viele Spieler ohne Admin-Pflicht kamen
in mindestens zwei verschiedenen Spielwochen von selbst wieder?** Dazu liest er (nur lesend,
keine einzige Schreiboperation) die Konten, die Nutzungsereignisse und die Spiele, rechnet
alle Wochengrenzen in deutscher Ortszeit (Europe/Berlin — die Zeitumstellung am 25.10. ist
abgedeckt und getestet) und druckt einen Bericht: die Wiederkehr-Quote mit Ampel **nur**
bei mindestens 20 gewerteten Spielern und **nur** am definierten Stichtag 14.12., sonst
ehrlich „X von Y" — dazu die Vorbedingungs-Ampel (tragen die Admins überhaupt Ergebnisse
ein?) und die Begleitwerte aus §3 der Definition, ausdrücklich beschriftet mit
„sie ERKLÄREN die WQ, sie überstimmen sie NICHT".

## 2. Aufruf (für die Läufe am 30.11. und 14.12.)

```bash
# Zwischenstand (§1.4): trägt PER DEFINITION keine Ampel — Job-Erprobung
node scripts/wiederkehr-rate.mjs --stichtag 2026-11-30

# Der Ampel-Lauf (Datenstand für die Go/No-Go-Besprechung 14.–18.12.)
node scripts/wiederkehr-rate.mjs --stichtag 2026-12-14
```

Die Ziel-Datenbank kommt aus `MONGODB_URI` (Umgebungsvariable oder `.env`). Für den
Dezember-Lauf gegen die Live-Datenbank `hoops_prod` wird die URI **beim Aufruf** gesetzt —
im Code wird nichts umgestellt. Exit-Code 0 = Bericht erzeugt; 1 = eine Ehrlichkeitsschranke
hat gegriffen (dann gibt es KEINEN Messwert, auch keine 0 %).

Test-Flags (`--praefix`, `--jetzt`, `--json`) existieren nur für den Wächter und sind im
Skriptkopf als solche markiert; `--jetzt` verschiebt die Uhr, umgeht aber keine Schranke,
und der Bericht kennzeichnet eine simulierte Uhr unübersehbar.

## 3. Die Ehrlichkeitsschranken (alle gebaut, alle rot gesehen)

1. **Leere Kohorte → Abbruch**, kein „0 %" (Ronjas §2.5; das Muster ist mein eigener
   Selbstbefund vom 22.08.: Abwesenheit von Messung darf nicht wie ein Messwert aussehen).
2. **Kalender fehlt oder ist unplausibel → Abbruch** (leer, Nicht-Montage, unsortiert,
   ohne Spielwochen-Kennzeichen).
3. **Messstrecke noch nicht begonnen → Abbruch.** Solange die erste Spielwoche (endet
   So 04.10.) nicht abgeschlossen ist, gibt es keine Quote. Genau das meldet der Job heute
   gegen die echte Dev-DB — belegt, s. §5.
4. **Ampel nur am 14.12. UND nur mit vollständigem Datenstand.** Ein Lauf mit anderem
   Stichtag oder mit einer Uhr vor dem Stichtag bekommt Zahlen, aber keine Farbe — sonst
   könnte man den Stichtag verschieben, bis die Farbe passt (§1.4 Bindung 1).
5. **Jede Prozentzahl trägt ihr n**; unter n = 20 wird gar keine gedruckt (§4).

## 4. Beweisführung — der Job ist heute richtig, nicht erst im Dezember

**Synthetische Kohorte mit handgerechneten Sollwerten** (Wegwerf-Sammlungen `wqtest_*`
auf der Dev-DB; die echten Sammlungen werden vom Wächter weder gelesen noch beschrieben):
25 Konten, jede Personalie prüft genau eine Regel — Spieler an der 2-Wochen-Grenze ·
Registrierung exakt am 08.11. (gewertet) und 09.11. (zu jung) · Aktivität in der
Ferien-Leerwoche (zählt nicht) · Admin **und** Co-Admin (nur `teamAdminOf`, ohne
`isTeamAdmin` — der Ausschluss greift über das eine Feld) · `isDemo`/`isInternal`
(fliegen am importierten `NUR_ECHT`-Filter) · Ereignis ohne `playerId` (ausgeloggt —
zählt für niemanden, erscheint nur im Anonym-Umfeld) · `own_stats_notified` (Server-
Ereignis, zählt nicht) · Registrierungswochen-Aktivität (Onboarding, zählt nicht) ·
Bestandskonto vor dem 14.09. (voll gewertet, eigene Zeile) · Stichtagsgrenze
(So 13.12. 23:59 zählt, Mo 14.12. 00:00 exakt nicht) · **beide Seiten der
Zeitumstellung** (ein Ereignis Mo 02.11. 00:30 Berlin ist in UTC noch Sonntag — ein
UTC-Rechner würfe es in die Ferien-Leerwoche).
Handgerechnet: **WQ 6 von 20 (30,0 %) → GELB** · Zwischenstand 30.11.: **3 von 19,
keine Prozentzahl, keine Ampel** · Stichtag 07.12. bei n = 20: **15 %, trotzdem keine
Ampel**. Alle 10 Wächter-Fälle grün, alle Sollwerte getroffen.

**Mutationsmatrix: 16 von 16 gefangen, jede Mutation EINZELN gefahren**
(`scripts/messungen/wq-mutationsmatrix.sh` — eingecheckt, Lehre aus Roadmap 32 e;
und einzeln, weil zwei Gegenproben in einem Lauf nur eine beweisen — Lehre vom 22.08.): UTC- statt Berlin-Wochen · 1 statt 2 aktive Wochen ·
Admin-Ausschluss entfernt · NUR_ECHT-Filter entfernt · Leerwochen zählen ·
own_stats_notified zählt · Registrierungswoche zählt · Prozent unter n = 20 ·
3 statt 4 mögliche Wochen · Messstrecken-Schranke entfernt · Kohorten-Schranke
entfernt · Kalender-Prüfung stillgelegt · Vorbedingungs-Schwelle 50 → 10 ·
Ampel trotz Zukunfts-Stichtag · Ampel an jedem Stichtag · 8. Spielwoche zählt in
die Ampel. **Jede machte mindestens einen Fall rot.**

⚠️ **Ein eigener Rechenfehler, vom Wächter gefangen — und ehrlich benannt:** Meine erste
Handrechnung der Kern-Aufruf-Diagnose sagte 2, der Job lieferte 3. Der Job hatte recht:
Ich hatte übersehen, dass das `own_stats_opened`-Ereignis (das Öffnen der Benachrichtigung)
eine echte Nutzerhandlung auf einem Kern-Pfad ist — ausgeschlossen ist laut §1.3 nur das
Server-Ereignis `own_stats_notified`. Der Sollwert wurde **nachgerechnet** korrigiert,
nicht vom Programmlauf abgeschrieben; der Kommentar im Test hält das fest.

## 5. Der Lauf gegen die echte Dev-DB — die Phantom-Quoten-Probe

```
node scripts/wiederkehr-rate.mjs --stichtag 2026-12-14   (und --stichtag 2026-11-30)
→ ABBRUCH: Messstrecke noch nicht begonnen — die erste Spielwoche (Mo 2026-09-28)
  ist zum Datenstand noch nicht abgeschlossen. Es gibt keine Wiederkehr-Quote,
  auch keine 0 %. (Exit 1)
```

Genau das Sollverhalten: Heute, vor Messbeginn, gibt es keine Quote — auch keine, die
„0 %" hieße und wie ein Messwert aussähe. Dieser Fall ist bewusst **nicht** als
dauerhafter Suite-Test gebaut (er würde ab dem 05.10. real anders ausfallen — ein Test,
dessen Ergebnis am Kalendertag hängt, wäre eine Zeitbombe); in der Suite läuft derselbe
Zweig zeitstabil über die fixierte Uhr.

**Dev-DB-Spuren: restlos geräumt, mit Beleg.** Nach dem Wächterlauf listet die Dev-DB
`hoopsgermany` **0** Sammlungen mit Präfix `wqtest_` (Listing gefahren, nicht behauptet).
Der Wächter selbst wirft im Aufräumschritt, falls je eine übrig bliebe.

## 6. Gemeldete Punkte an Ronja (Spezifikation) — kein Blocker darunter

1. **Interner Widerspruch §2.5 ↔ §2.4:** §2.5 Schritt 0 sagt „die ersten 7 **Einträge**
   aus `lib/spielwochenNiers2026.js`" — die ersten 7 Array-Einträge enthalten aber drei
   Leerwochen und endeten am 23.11. Bindend ist erkennbar §2.4 („die ersten 7
   **Spielwochen**, 28.09. bis einschließlich Woche 07.12."); so ist es gebaut, und der
   Wächter prüft das Wertungsfenster wörtlich gegen diese 7 Montage. §2.5 sollte bei
   nächster Gelegenheit angeglichen werden (Ronjas Protokollregel).
2. **Auslegung M2** („Anteil der gewerteten Spieler mit eigenem Spieltermin, die binnen
   72 h nach dem Spieltermin aktiv waren"): umgesetzt **je Spieler** — aktiv nach
   mindestens einem der eigenen Termine. Die Alternative (je Spieler-Termin-Paar) wäre
   strenger; bei Bedarf eine Zeile im Kern.
3. **Auslegung M3:** „Spiele echter Teams" = mindestens ein beteiligtes Team besteht den
   `NUR_ECHTE_TEAMS`-Filter. Ein Ergebnis **ohne** Einreichzeitpunkt (`submittedAt` fehlt,
   z. B. Admin-Korrektur) zählt konservativ NICHT als „binnen 7 Tagen", wird aber als
   eigene Zeile ausgewiesen statt verschwiegen.
4. **Ein Riegel, der nicht wörtlich in der Definition steht:** Ein Lauf, dessen Uhr vor
   dem Stichtag liegt (Stichtag in der Zukunft), druckt Zahlen als „VORLÄUFIG" und
   unterdrückt die Ampel — sonst färbte ein halb leeres Fenster die Entscheidung. Das
   folgt aus §1.4, steht dort aber nicht ausdrücklich; hiermit dokumentiert.
5. **Doppelriegel an der Stichtagsgrenze, ehrlich benannt:** Die 8. Spielwoche wird
   ZWEIMAL unabhängig ausgeschlossen (Ereignis-Zeitfilter bis Stichtag UND
   Wertungswochen-Liste). Die Einzelmutation des Zeitfilters allein ist deshalb stumm —
   der maßgebliche Riegel (Wochenliste, M16) wurde einzeln rot gesehen. Das ist
   beabsichtigte Redundanz, keine Testlücke.

## 7. Suite-Endzahl und Einbezogene

- Suite im isolierten Arbeitsstand (Port 3210, Production-Runtime, frischer Build):
  **359 grün / 0 rot / 1 übersprungen** — gezählt am Protokoll (`grep -c "✓"` = 359,
  `✘` = 0), 360 Fälle in 37 Dateien per `--list` unabhängig gegengezählt (vorher
  349/0/1 bei 350 in 36 — die 10 neuen sind dieser Wächter).
  ⚠️ **Ein eigener Arbeitsfehler auf dem Weg dorthin, ehrlich benannt:** Mein erster
  voller Suite-Lauf lief im Hintergrund und hinterließ scheinbar kein Ergebnis; die
  Portprüfung meldete danach 3210 als belegt, ich hielt den Prozess für einen
  verwaisten Server und beendete ihn — tatsächlich **lief der Hintergrundlauf noch**
  und wurde dadurch mitten im Lauf abgeschossen (sein Torso meldete später „323
  passed"). Diese Zahl ist ungültig und zählt nicht; die 359/0/1 stammen aus dem
  anschließenden vollständigen Vordergrundlauf mit frischem Build (Exit 0,
  Protokoll `tmp/suite-voll.log` im Arbeitsstand). Lehre — dieselbe Familie wie der
  Reflog-Merksatz vom 15.08.: Vor dem Beenden eines Prozesses klären, WEM er
  gehört, nicht nur, DASS er den Port hält.
- **Ronja:** ihre Definition war die Bauvorlage; §6 dieser Datei ist ihre Rückmeldung.
- **Patrick/Ole:** die Zuordnung des Messjobs (Kai oder Ben) stand offen — gebaut ist er
  jetzt; der erste Pflichtlauf (30.11.) ist Routine, kein Erstlauf unter Zeitdruck.
- **Tobias:** bewusst nicht — keine nutzersichtbare Änderung, kein Browser-Gegenstand.
- **Nora:** kein neuer Berührungspunkt — der Job liest nur bereits erhobene Felder und
  gibt nichts nach außen (Ronjas Einschätzung, hier bestätigt: es wurde kein neues
  Ereignis und kein neues Feld eingeführt).

## 8. Was VOR dem 30.11. noch zu tun bleibt (aus Ronjas §8, unverändert offen)

- **Kalender-Gegenprobe gegen TeamSL kurz vor Messbeginn** (§2.4) — Verlegungen bis
  Saisonstart bleiben möglich; Änderung nur mit Protokollzeile in der Definitionsdatei.
- **`isInternal`-Verifikation auf `hoops_prod`** ist am 23.08. erfolgt (Patricks und
  Jonatans Konten markiert, externe Nutzer ehrlich 8) — kurz vor dem 14.09. einmal
  wiederholen, falls bis dahin neue interne Konten entstehen.
- Freigabe der Schwellen durch Patrick steht laut Definitionsdatei noch aus — der Job
  rechnet die Setzungen aus §3.1, entschieden hat sie damit niemand nachträglich.

## 9. Urteil

**Bereit zur Übernahme: JA.** Alle Zusicherungen der Definition sind gebaut, mit
handgerechneten Sollwerten belegt und einzeln rot gesehen (16/16 Mutationen gefangen);
der Job bricht heute gegen echte Daten ehrlich ab statt eine Phantom-Quote zu drucken;
die Suite ist vollständig grün; die Dev-DB ist belegt rückstandsfrei. Fünf neue Dateien,
keine Bestandsdatei angefasst — Commit und Push sind nicht Teil dieses Auftrags und
bleiben bei Patrick.
