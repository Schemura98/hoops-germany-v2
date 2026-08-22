# Gate-Bericht Kai — Roadmap 26: Analytics-Sitzungsabfrage + Bot-Filter im Tracker
**22.08.2026 · Prüfbasis `38f2d20..70fd2d1` (2 Dateien Produktivcode) · isolierter Worktree `hoops-kai-gate-70fd2d1`, Port 3210 · Dev-DB `hoopsgermany`, Wegwerf-Collections**

## Urteil in einem Satz

**Freigabefähig, mit einer Auflage vor dem nächsten Deploy-Stapel (nicht vor diesem).**
Die neue Sitzungsrechnung ist an zwölf handgerechneten Randfällen exakt, der
behauptete Zählfehler der alten Fassung ist zweifach unabhängig belegt (synthetisch
**und** live), die Tracker-Wache stoppt gesteuerte Browser und lässt echte durch —
und der 32-MB-Ausfall hat jetzt einen Wächter, der zweimal rot gesehen wurde.
Die Auflage: **Der Bot-Riegel deckt nur eine von zwei Türen** — `lib/trackEvent.js`
sendet weiter (gemessen 81 Einträge je Suite-Lauf statt ~1.600).

---

## Für Patrick, ohne Fachsprache

Zwei Dinge wurden geändert. Erstens: Die Auswertungsseite im Backoffice (und der
Sponsor-Report) rechnete die Besucher-Sitzungen auf eine Art aus, die ab einer
bestimmten Datenmenge schlicht abbricht — dann stünde dort nur „Interner
Serverfehler". Auf der Live-Seite ist diese Menge noch nicht erreicht (3.474
Einträge, die Grenze liegt bei einigen Zehntausend), auf der Entwicklungsdatenbank
war sie es längst. Die Rechnung wurde umgebaut, sodass sie auch bei großen Mengen
antwortet. Zweitens: Die Testwerkzeuge selbst erzeugten bei jedem Testlauf ~1.600
gefälschte „Besucher"-Einträge — die Seite zählte ihre eigenen Prüfroboter als
Publikum. Ein Riegel sorgt jetzt dafür, dass gesteuerte Browser nicht mitgezählt
werden.

**Was ich geprüft habe und was dabei herauskam:**

1. **Die neue Rechnung rechnet richtig.** Ich habe zwölf Grenzfälle von Hand
   ausgerechnet (eine Sitzung mit nur einem Klick, eine Pause von exakt 30
   Minuten, zwei Klicks in derselben Millisekunde, leere Datenbank …) und die
   neue Rechnung dagegen laufen lassen: **alle zwölf exakt getroffen.**

2. **Die Überraschung des Kollegen stimmt — die ALTE Rechnung zählte falsch,
   und zwar mehr, als er gemeldet hat.** Er fand eine Doppelzählung (8.778 statt
   8.777). Ich habe den Mechanismus nachgebaut: Bei 3.000 Sitzungen mit
   zeitgleichen Klicks zählte die alte Rechnung **3.231** — 231 Sitzungen
   doppelt. Und im echten Bestand der letzten 48 Stunden fand ich **vier**
   solcher Doppelzählungen, jede exakt nach dem beschriebenen Muster. Die neue
   Rechnung zählt in allen Fällen richtig. Der Umbau ist also nicht nur
   Vorsorge, er korrigiert einen echten, wiederkehrenden Zählfehler.

3. **Der Riegel gegen Prüfroboter schaltet die Zählung NICHT für echte Besucher
   ab.** Das war die gefährliche Rückseite: Wäre der Riegel zu weit geraten,
   würde niemand mehr gezählt — und nichts sähe kaputt aus. Gemessen: Ein
   gesteuerter Browser sendet 0 Zählungen, ein (simulierter) echter Browser
   sendet sie weiter.

4. **Aber der Riegel deckt nur eine von zwei Türen.** Es gibt eine zweite
   Sendestelle für Sonder-Ereignisse (Tour-Schritte, Checklisten-Klicks), und
   die hat den Riegel nicht. Gemessen: Ein voller Testlauf schreibt weiter
   **81 Einträge** in die Datenbank (vorher ~1.600 — also 95 % weniger, aber
   nicht null). In der Entwicklungsdatenbank liegen bereits **7.259**
   Roboter-Einträge allein für Tour-Schritte. Betroffen ist davon **nur die
   interne Produktdiagnose** (die Abbruchkurve des Onboardings im Backoffice) —
   der Sponsor-Report bekommt diese Zahlen ausdrücklich nicht. Deshalb keine
   Deploy-Bremse, aber eine Auflage: dieselbe eine Zeile auch in die zweite
   Sendestelle.

5. **Der Ausfall hat jetzt einen Wächter.** Der Auftrag ließ ausdrücklich das
   Ergebnis „nicht ehrlich testbar" zu — es kam anders: Ein neuer Test stellt
   die große Datenmenge selbst her (80.000 markierte Wegwerf-Einträge, ~5 s),
   fragt die echte Auswertung und räumt hinter sich auf. Kostet 25,5 Sekunden
   im Testlauf und wurde **zweimal absichtlich rot gesehen**, bevor ich ihm
   glaube.

6. **Die Testsuite ist wirklich komplett grün** — selbst gezählt, nicht
   übernommen: 343 grün, 0 rot, 1 übersprungen (davon 1 grüner mein neuer
   Wächter; ohne ihn exakt die gemeldeten 342/0/1).

---

## 1. Äquivalenz alt/neu — härter geprüft als mit Zeitfenstern

**Methode:** Wegwerf-Collection `kai_gate_r26_synth` auf der Dev-DB, beide
Pipelines **wörtlich** aus dem Diff übernommen, Sollwerte **von Hand** gerechnet
(nicht aus einer der beiden Pipelines abgeleitet — sonst prüfte der Vergleich
nur, dass eine Pipeline sich selbst gleicht). Skript:
`tmp/kai-gate-r26-aequivalenz.mjs` (Zweitkopie s. u.).

| Fall | Soll (Hand) | Neu | Alt |
|---|---|---|---|
| leere Treffermenge | `[]` | `[]` ✓ | `[]` ✓ |
| genau EIN Ereignis | 1/1/0 s | ✓ | ✓ |
| Lücke **exakt 30 min** (`$gt` ⇒ selbe Sitzung) | 1/2/1800 s | ✓ | ✓ |
| Lücke 30 min + 1 ms | 2/2/0 s | ✓ | ✓ |
| Zwillings-Zeitstempel am Sitzungs**anfang** | 1/3/60 s | ✓ | ✓ |
| Zwillings-Zeitstempel am Sitzungs**ende** | 1/3/60 s | ✓ | ✓ |
| Zwillinge an Anfang UND Ende, Grenze dazwischen | 2/4/0 s | ✓ | ✓ |
| zwei Segmente mit Binnendauer | 2/4/900 s | ✓ | ✓ |
| FÜNF identische Zeitstempel | 1/5/0 s | ✓ | ✓ |
| `sessionId` leer/fehlend wird verworfen | 1/1/0 s | ✓ | ✓ |
| `eventType != pageview` zählt nicht | 1/1/0 s | ✓ | ✓ |
| **3.000 Sitzungen mit Zwillings-Zeitstempeln** | **3.000**/6000/0 | **3.000** ✓ | **3.231 ✗** |

(Notation: Sitzungen/Seiten/Dauer. Die leere Treffermenge ist auch am
Verbraucher abgesichert: `sessionAgg[0] || { sessions: 0, … }`.)

**Der letzte Fall ist der Beleg für den behaupteten Fehler der Alten, um den
Faktor 231 größer als gemeldet:** Bei durchmischter physischer Reihenfolge der
Zwillinge erzeugt die alte Fassung massenhaft Phantom-Gruppen (`sIdx = 0`).
Die Seitenzahl bleibt dabei korrekt (6.000) — **nur die Sitzungszahl bläht
auf.** Genau das Muster, das der Kollege im 12-h-Fenster fand.

**Und der Fehler ist live, nicht nur synthetisch:** Im echten 48-h-Bestand der
Dev-DB (39 Zwillingspaare) zählte die alte Pipeline **19.942**, die neue
**19.938** — die Differenz sind exakt **4 Phantom-Gruppen mit `sIdx = 0`**,
jede eine Sitzung aus zwei Ereignissen mit identischem Zeitstempel. Die
konkrete 12-h-Zahl des Kollegen (8.778/8.777) ist am inzwischen
weitergerollten Fenster nicht mehr reproduzierbar (aktuell: alt = neu = 8.735,
0 Phantome) — das ist konsistent, denn die Instabilität unter Gleichen ist
gerade das Wesen des Fehlers: Vier Wiederholungsläufe derselben alten Abfrage
lieferten bei mir stabil dieselbe Zahl, die Doppelzählung hängt an der
physischen Ablage-Reihenfolge der Zwillinge, nicht am Würfel je Lauf.

**Fazit 1:** Die neue Pipeline ist auf allen konstruierbaren Randfällen exakt;
wo sie von der alten abweicht, ist **die alte falsch**. Der Kommentar im Code
beschreibt den Sachverhalt zutreffend.

**Zwei Einordnungen dazu, beide klein:**
- `$sortArray` braucht MongoDB ≥ 5.2 — der Cluster (`hoops.tbhsg`, derselbe für
  Dev und Prod) läuft auf **8.0.29**. Kein Risiko.
- Auch die neue Fassung hat eine Decke, nur viel höher: `$group` sammelt je
  Sitzung ein Zeitstempel-Array im Speicher (100-MB-Stufengrenze). Bei 155.418
  Pageviews gemessen problemlos; rechnerisch wird es erst im
  Millionen-Ereignis-Bereich eng. Festgehalten, damit es beim nächsten
  Wachstumssprung niemanden überrascht.

## 2. Der 32-MB-Wächter — Auftrag ließ „nicht testbar" zu, es kam anders

**Erst die Messung, dann der Test.** Zwei Vorab-Befunde bestimmen den Bau:

1. **Aufblähen funktioniert NICHT.** Meine erste These war: Die Grenze zählt
   Bytes, also lösen wenige große Dokumente sie billig aus. Gemessen: 4.500
   Dokumente à 10 KB Ballast — **die alte Pipeline lief durch.** MongoDBs
   Optimizer wirft ungenutzte Felder vor dem Sortieren ab; es zählen nur die
   Bytes der **benötigten** Felder. Der einzige ehrliche Hebel ist die
   Dokumentzahl.
2. **Der Kipppunkt liegt real zwischen 40.000 und 60.000** kleinen Dokumenten
   (40 k: läuft · 60 k: Code 292) — und der Insert von 60 k Dokumenten kostet
   **~5 s**, nicht Minuten. Damit ist der Wächter bezahlbar.

**Gebaut: `tests/e2e/analytics-grossbestand.spec.mjs`** — fügt 80.000 markierte
Ereignisse ein (8.000 Sitzungen, Marker-Namensraum `e2e-kai-32mb-*` +
Pfad `/e2e-waechter-32mb`, Aufräumen VOR dem Einfügen und im `finally`), fragt
die echte API (`/api/analytics/summary`, derselbe Weg wie /admin/analytics und
Sponsor-Report) und verlangt **zweierlei**: Antwort 200 **und**
`engagement.sessions ≥ 8.000` — die Ehrlichkeitsschranke gegen eine
„Reparatur" durch leere Antwort. Laufzeit im Suite-Lauf: **25,5 s**.

**Beide Zusicherungen rot gesehen (Pflicht, bevor ich einem grünen Test glaube):**
- Alte Pipeline zurückgedreht → **rot** (500 statt 200, mit sprechender
  Fehlermeldung, die auf `lib/analyticsSummary.js` zeigt).
- Mutation `sessions: { $sum: 0 }` → **rot** an der Ehrlichkeitsschranke
  („Nur 0 Sitzungen gemeldet, obwohl 8.000 eingefügt").
- Aufräumen nachgemessen: **0 Marker-Reste** nach beiden roten Läufen — auch
  ein scheiternder Lauf hinterlässt nichts.

⚠️ **Eine ehrliche Grenze des Wächters:** Er lief bei den Gegenproben gegen die
Dev-DB mit vorhandenen 75.418 Pageviews — die Rot-Schwelle wurde also längst
ohne seine eigenen 80.000 erreicht. Auf einer **leeren** Datenbank tragen seine
80.000 allein (Kipppunkt ~60.000, mit UUID-langen sessionIds gemessen); wer die
Ereignis-Dokumente je um breite Pflichtfelder erweitert, verschiebt den
Kipppunkt nach unten (sicherer), wer `sessionId` kürzt, nach oben. Die Marge
80.000 gegen 60.000 ist bewusst, aber nicht riesig.

**Die Datei ist im Gate-Worktree gebaut und NICHT committet** — committen war
nicht beauftragt. Übergabe: s. Dateiliste unten.

## 3. Tracker-Wache — drei Richtungen gemessen

Skript `tmp/kai-gate-r26-tracker.mjs`, Production-Runtime auf 3210, alle
`track`-Aufrufe abgefangen (das Skript schreibt selbst nichts in die DB):

| Szenario | `navigator.webdriver` | Ergebnis |
|---|---|---|
| gesteuerter Browser, 2 Seitenaufrufe | `true` | **0** Track-Aufrufe ✓ |
| simulierter echter Browser (Marker per `addInitScript` entfernt), 2 Seitenaufrufe | `undefined` | **2× pageview** ✓ |
| gesteuerter Browser öffnet die Tour | `true` | **1× tour_step ✗** |

Zeile 1 bestätigt die Behauptung des Kollegen. Zeile 2 ist die Gegenprobe, die
er selbst angeordnet hat — **die Analytics sind nicht versehentlich für alle
tot.** Zeile 3 ist der Befund:

### B1 (mittel, Auflage): `lib/trackEvent.js` hat den Riegel nicht

Der Riegel sitzt in `components/AnalyticsTracker.js` und deckt **nur
Pageviews**. Die zweite Sendestelle `lib/trackEvent.js` (Aufrufer: `Navbar.js`,
`NotificationBell.js`, `WelcomeTour.js`, `OnboardingChecklist.js`) sendet aus
gesteuerten Browsern weiter. Gemessen am vollen Suite-Lauf:

- **Delta 81 Einträge je Lauf** (71× `tour_step`, 6× `tour_branch`,
  4× `tour_action`) — vorher ~1.600, also **95 % weniger, nicht null.**
- Vorbestand in der Dev-DB: **7.259 `tour_step`** — der Onboarding-Trichter in
  `/admin/analytics` ist dort heute im Wesentlichen Roboterkurve.

**Warum keine Deploy-Bremse:** Der Onboarding-Trichter steht auf der
**Ausschlussliste** des Sponsor-Reports (`app/api/analytics/public-report/
route.js` — „reine Produktdiagnose"); die Sponsor-Sitzungszahlen speisen sich
aus Pageviews und sind gedeckt. Betroffen ist die interne Diagnose plus ein
langsames Weiterwachsen der Dev-Sammlung. Die Abhilfe ist dieselbe eine
Bedingung, an EINER geteilten Stelle statt zweimal kopiert — `trackEvent.js`
und `AnalyticsTracker.js` teilen sich schon heute wörtlich die
`getSessionId`-Logik; wer die Wache einbaut, sollte beide Duplikate gleich
zusammenziehen. **Auflage: vor dem nächsten Deploy-Stapel nachziehen, mit
derselben Gegenprobe in beide Richtungen wie oben.**

## 4. „Suite erstmals komplett grün" — selbst gezählt

Voller Lauf im isolierten Worktree, Port 3210, Production-Runtime
(`E2E_PORT=3210`, Build durch die Suite selbst):

- **343 grün / 0 rot / 1 übersprungen**, 344 laut `--list`, 35 Dateien, 5,9 min.
- Davon **1 grüner mein neuer Wächter** — ohne ihn exakt die gemeldeten
  **342 / 0 / 1** in 34 Dateien. **Behauptung bestätigt.**
- Die fünf „vorbestehenden" Roten aus Roadmap 26 sind tatsächlich gekippt, und
  zwar aus dem richtigen Grund: Der Bestand wurde **nicht** gelöscht (83.937
  Einträge lagen beim Lauf in der Dev-DB) — die Auswertung hält ihn jetzt aus.
  Grün durch Reparatur, nicht durch Aufräumen.

## Für den Deploy (wenn Patrick freigibt)

- Kein neues Paket, keine Schema-Änderung, kein `npm install` am Server nötig
  (`git diff 38f2d20..70fd2d1 -- package.json` ist leer).
- Auf Prod läuft die alte Abfrage heute noch (3.474 Einträge) — der Umbau ist
  dort Vorsorge **plus** Korrektheitsfix (die Phantom-Doppelzählung trifft
  jeden Bestand mit Zwillings-Zeitstempeln, nicht nur große).
- Nach Deploy einmal `/admin/analytics` und den Sponsor-Report öffnen (beide
  müssen 200 antworten und plausible Sitzungszahlen zeigen).

## Übergebene Dateien (nicht committet, Zweitkopien außerhalb des Worktrees)

| Datei | Zweck |
|---|---|
| `tests/e2e/analytics-grossbestand.spec.mjs` | der neue 32-MB-Wächter (2 Gegenproben rot gesehen) |
| `tmp/kai-gate-r26-aequivalenz.mjs` | 12 Randfälle, Sollwerte von Hand |
| `tmp/kai-gate-r26-32mb.mjs` | widerlegte Aufbläh-These (Optimizer streicht Ballast) |
| `tmp/kai-gate-r26-32mb-klein.mjs` | Kipppunkt-Messung 40 k/60 k |
| `tmp/kai-gate-r26-tracker.mjs` | Tracker-Wache in drei Richtungen |
| `docs/GATE-KAI-ROADMAP-26-2026-08-22.md` | dieser Bericht |

Alle Wegwerf-Collections (`kai_gate_r26_synth`, `kai_gate_r26_bloat`) und die
80.000 Marker-Einträge sind gelöscht; nachgemessen 0 Reste. `analyticsevents`
wurde ausschließlich durch den regulären Suite-Lauf verändert (+81, die unter
B1 beschriebene Lücke) und durch den Wächter-Test (netto 0).

**Einbezogen:** Tobias braucht diese Runde kein Browser-Gate — es gibt keine
nutzersichtbare Änderung (Backoffice-Zahlen und ein unsichtbarer Riegel);
sollte Patrick deployen, deckt die Nach-Deploy-Sichtung oben das Nötige ab.
Ole: ehrlicher Aufwand des neuen Wächters sind 25,5 s je Suite-Lauf.

— Kai, 22.08.2026
