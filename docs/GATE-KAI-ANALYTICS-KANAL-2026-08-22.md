# Gate-Bericht Kai — Analytics-Ausbau: Kanal-Trichter, Verlauf intern, Roadmap 39

**Datum:** 22.08.2026 · **Prüfer:** Kai (test-automatisierung)
**Prüfbasis:** Arbeitsbaum-Diff gegen `45de921` (nicht committet), sieben Dateien —
`lib/analyticsClient.js` (neu), `lib/trackEvent.js`, `components/AnalyticsTracker.js`,
`lib/analyticsSummary.js`, `app/api/analytics/track/route.js`,
`components/admin/LineChart.js`, `app/admin/analytics/page.js`.
**Prüfstand:** eigener Worktree auf `45de921` + Patch (bitgleich verifiziert), Port 3210,
ausschließlich Dev-DB `hoopsgermany`.

---

## Urteil: FREIGABEFÄHIG MIT EINER AUFLAGE

Die Auflage ist eine Zeile und betrifft die unterste Trichterstufe (Details in B1).
Alles andere hält dem Nachmessen stand — mehrfach besser als gemeldet.

---

## 1. Roadmap 39, beide Richtungen — GEMESSEN, NICHT ÜBERNOMMEN

**Was es bedeutet:** Die Testsuite hat bisher bei jedem Lauf eigene Spuren in die
Besucherzählung geschrieben (+81 Einträge je Lauf über den Tour-Weg). Das ist vorbei.

**Die Messung in der Währung des letzten Gates:** Ereignisbestand der Dev-DB vor
einem vollen Suite-Lauf und danach — **exakt identisch, Delta 0**:

| | vorher | nachher |
|---|---|---|
| gesamt | 84.103 | 84.103 |
| pageview | 75.421 | 75.421 |
| tour_step / tour_branch / tour_action | 7.402 / 894 / 333 | identisch |
| src_landing | 0 | 0 |

**Gegenrichtung ebenfalls belegt** (der Riegel darf nur Bots filtern, nicht die
Analytics für alle abschalten): Im simulierten echten Browser (`navigator.webdriver`
auf undefined) kommen `pageview`, `src_landing` UND `tour_step` an — als Netzwerk-
Anfragen beobachtet und abgefangen, ohne die DB zu berühren. Beide Richtungen sind
jetzt **dauerhafte Wächter**, nicht nur Einmalmessungen (siehe 3).

**Suite unabhängig reproduziert: 343 grün / 0 rot / 1 übersprungen** (5,9 min).

## 2. Auftragsbefund B1 (Auflage): Die Team-Stufe des Trichters zählt interne Gründer mit

**Was es bedeutet:** Die Kampagnen-Karte verspricht in ihrer eigenen Unterzeile
„nur echte Konten". Für Landungen und Registrierungen stimmt das — für die Spalte
„Teams gegründet" nicht: Gründet ein als intern markiertes Konto (`isInternal`) ein
Team, zählt das Team als Kampagnenerfolg, obwohl dieselbe Person eine Zeile weiter
links ausdrücklich NICHT als Registrierung zählt. Der Trichter kann dann
„0 Registrierungen, 1 Team" zeigen — eine Teilmenge größer als ihre Menge, dieselbe
Widerspruchsfamilie wie „aktive > registrierte Nutzer" (analytics-ehrlichkeit).

**Technisch:** `teamsBySrcAgg` in `lib/analyticsSummary.js` filtert `NUR_ECHTE_TEAMS`
nur auf dem **Team**; der zweite `$match` prüft den Gründer allein auf
`signupSource`. `set-internal` markiert Spieler und Team aber **einzeln** — der Fall
„internes Konto, unmarkiertes Team" ist real erreichbar (Konto markiert, Team
vergessen; oder Team entsteht nach der Markierung).

**Auflage (eine Bedingung):** im Gründer-`$match` zusätzlich
`"gruender.isDemo": { $ne: true }, "gruender.isInternal": { $ne: true }`.
Der neue Wächter (Fall „Trichter-Aggregation") ist auf den korrekten Sollwert
gebaut und **bleibt rot, bis das umgesetzt ist** — kein Grün-Mogeln.

Gefangen wurde der Befund vom Wächter selbst, im ersten sauberen Lauf: Sollwert
handgerechnet 1 Team für Kanal A, gemessen 2. Kein konstruierter Sonderfall — der
Filter-Angleich dieser Runde (NUR_ECHT bei den Registrierungen) war richtig und
wurde bei der Team-Stufe nicht zu Ende gezogen.

## 3. Auftrag 2: Vier neue Wächter, sechs Gegenproben — jede EINZELN gefahren

Neue Datei **`tests/e2e/kanal-trichter.spec.mjs`** (6 Fälle; im Hauptbaum übergeben,
Zweitkopie im Scratchpad). Stand am Prüfstand: **5 grün, 1 rot** — der rote ist B1.

1. **Landung genau 1× je Tab-Sitzung** — inkl. des härteren Falls „erneuter Aufruf
   MIT ?src=" und einer eingebauten Gegenkontrolle (neue Sitzung → wieder genau 1;
   beweist, dass die 1 vom Riegel kommt, nicht von einem verstummten Sender).
   Ehrlichkeitsschranke: die Folgeaufrufe müssen als pageviews ankommen — sonst
   wäre „nur 1 Landung" auch über einem toten Tracker wahr.
2. **Direktlandung auf `/signup?src=`** — eigener Fall, weil die Landung dort an
   der Effect-Reihenfolge hängt (siehe N1).
3. **Bot-Riegel, beide Richtungen** — gesteuert: 0 Ereignisse trotz nachweislich
   geöffneter Tour; echt: alle drei Ereignisarten beobachtet.
4. **Server weist erfundene Kanäle ab** — Sonderzeichen, Leerzeichen, 41 Zeichen,
   254 Zeichen, leer, fehlend, `{"$ne":null}` → alle 400; gültig-unnormalisiert
   („  VEREINSMAIL ") → 200 und **normalisiert** gespeichert (sonst zählte
   „Vereinsmail" als eigener Kanal — die Zwei-halbe-Kanäle-Falle vom QR-Kennzeichen).
5. **Trichter-Aggregation gegen handgerechnete Sollwerte** — Vereinigung (Kanal
   nur mit Landungen bleibt sichtbar), Echtheitsfilter der Registrierungen,
   `approved:false`-Ausschluss, Team-Stufe (rot, B1).

**Mutationsmatrix — 6 von 6 gefangen, jede Mutation ein eigener Lauf mit Rebuild:**

| Mutation | gefangen von | Symptom |
|---|---|---|
| Vereinigung entfernt (Kanalliste nur aus Registrierungen) | Fall 5 | Kanal B fehlt |
| Registrierungs-Filter zurück auf nur `isDemo` | Fall 5 | 3 statt 2 |
| Server-Validierung entfernt | Fall 4 | unnormalisiert gespeichert |
| Erste-Fang-Riegel im Tracker entfernt | Fall 1 | 2 Landungen statt 1 |
| webdriver-Riegel entfernt | Fall 3 | 4 Ereignisse sichtbar, inkl. 2× tour_step |
| Totalabschaltung (`return false` immer) | Fall 3 | Gegenrichtung rot |

**Methodik dazu:** Die Trichter-Assertions laufen als `expect.soft` — jede Stufe
ist eine eigene Zusicherung, ein Fehlschlag verdeckt die anderen nicht. Das ist
die Lehre „Zwei Gegenproben in EINEM Lauf beweisen nur eine", diesmal auf
Assertions angewandt: Ohne soft hätte der offene B1-Befund die Vereinigungs-
Prüfung unsichtbar gemacht (im ersten Lauf genau so passiert).

**Eigener Fehler beim Bauen, festgehalten:** `insertMany` des nativen Treibers
gibt `insertedIds` als Objekt mit Indexschlüsseln zurück, kein Array — meine
Array-Destrukturierung scheiterte im ersten Lauf. Steht als Kommentar im Test.

## 4. Auftrag 3: Skaliert `teamsBySrcAgg`? JA — mit Zahlen

**Kurzantwort:** Das ist **nicht** die nächste 32-MB-Falle. Die 32-MB-Grenze war
eine **Sortiergrenze**; diese Pipeline sortiert nichts.

**Gemessen** (Wegwerf-Fixtures mit Marker, restlos geräumt):
- 5.000 echte Teams → **~0,51 s** · 25.000 Teams → **~2,5 s** (je 3 Läufe, stabil)
  → **linear, ~0,1 ms je Team**. Zum Maßstab: Prod hat 66 Teams.
- Explain: **keine `$sort`-Stufe**; `$unwind` wird in den `$lookup` gezogen
  (gestreamt, kein Arrayaufbau über einer Speichergrenze); `$group` hält eine
  Zeile je Kanal (7 Kanäle bei 25.000 Teams). Der `$lookup` trifft `players._id`
  — immer indiziert.
- `srcLandingsAgg` läuft auf den vorhandenen Index `eventType_1_createdAt_-1`
  — unabhängig von der Gesamtgröße der Ereignis-Sammlung.

**Ehrliche Grenze:** Bei zigtausenden Teams wird der Summary-Aufruf um Sekunden
langsamer (Laufzeit, kein Abbruch). Das liegt drei Größenordnungen über dem
heutigen Prod-Bestand; kein Handlungsbedarf, aber gemessen statt behauptet.

## 5. Nachgeprüfte Meldungen des Bauers

- **Suite 343/0/1** ✅ reproduziert · **H2-Schutz** ✅ am Code belegt: die
  public-report-Route ist eine Positivliste, `signups` und `kanalTrichter`
  erreichen den geteilten Link nicht · **CSV-Umzug** ✅ im Browser gesehen
  (intern vorhanden, Sponsor-Reiter ohne CSV-Knopf und ohne Registrierungs-
  Legende, Verlauf dort unverändert) · **Admin-Seite 0 Konsolenfehler** ✅
  selbst gemessen, inkl. Sichtprüfung von Verlauf (drei Linien, eigene Skala in
  der Legende ausgewiesen) und Kampagnen-Karte mit Leerzustand ·
  **Server-Härtung** ✅ beidseitig, plus Einschleusungs-Nutzlast.
- **Eigener Messfehler unterwegs, ehrlich benannt:** Meine erste Browser-Sonde
  meldete alle Karten als fehlend — `waitForURL(/dashboard|admin/)` matchte die
  Login-URL selbst, gemessen wurde eine nie eingeloggte Seite. Beinahe ein
  Fehlalarm über die Seite statt über die Sonde (bekannte Fehlerform: richtig
  gemessen, am falschen Zustand).

## 6. Nebenbefunde (keine Deploy-Bremse)

**N1 — Die Landung auf `/signup?src=` hängt an der JSX-Reihenfolge im Layout.**
Auf /signup puffern ZWEI Effekte dieselbe Quelle (Tracker + Signup-Seite); die
Landung entsteht nur, weil `<AnalyticsTracker />` in `app/layout.js` VOR
`{children}` steht und React Effects in Baumreihenfolge feuert. Wer den Tracker
je hinter `{children}` verschiebt, verliert stumm jede Landung von Flyer-Links
direkt auf die Registrierung — und nichts sieht kaputt aus. **Wächterfall 2
bewacht genau das.**

**N2 — Registrierungen können je Kanal über den Landungen liegen**, aus zwei
Gründen: (a) Landungen zählen im Zeitraum, Registrierungen allzeit — die
Kartenzeile sagt das dazu, gut; (b) wer mit Quelle A ankommt und später in
derselben Tab-Sitzung einen Link mit `?src=B` auf /signup klickt, registriert
sich unter B, die Landung lief unter A (die Signup-Seite überschreibt die
Quelle bewusst, der Tracker landet nur beim Erstfang). Randfall, Einordnung
statt Defekt — aber wer die Tabelle liest und „mehr Registrierungen als
Landungen" sieht, sollte diesen Absatz finden können.

**N3 — Die Formatprüfung ist ein Formatfilter, kein Echtheitsnachweis.** Wohl-
geformte erfundene Kanäle (`kanal-xyz`) kann ein Angreifer weiterhin per curl
einliefern; der Endpunkt ist öffentlich und ungedrosselt (vorbestehend, gilt
für alle Ereignistypen). Sichtbar nur im internen Admin-Reiter, nichts davon
erreicht den Sponsor-Link. Niedrig; bei Bedarf wäre die nächste Stufe eine
Drossel je sessionId, nicht mehr Validierung.

**N4 — „1× je Sitzung" heißt Tab-Sitzung.** Zwei parallel geöffnete Tabs sind
zwei Landungen (gleiche `analyticsSessionId`, die in localStorage lebt und nie
rotiert). Vertretbar — zwei Scans sind zwei Landungen —, steht jetzt als
Kommentar im Wächter, damit niemand die zwei Sitzungsbegriffe verwechselt.

**N5 — Zwei Skalen in einem Chart.** Die Registrierungslinie läuft auf eigener
Skala im selben Koordinatensystem; die Legende weist es aus („eigene Skala,
max N"). Lesbarkeitsfrage, keine Falschdarstellung → Vivien, falls gewünscht.

**N6 — `zz-look.mjs` liegt untracked im Repo-Wurzelverzeichnis** des Hauptbaums
(Wegwerf-Skript einer anderen Sitzung, PDF-Screenshots). Gehört nicht zum
Stapel — löschen oder nach tmp/.

## 7. Dev-DB: geräumt, mit Beleg

Endzustand **bitgleich zur Baseline**: gesamt 84.103 · src_landing 0 ·
Marker-Reste in players/teams/analyticsevents: **0/0/0**. Die Browser-Fälle des
Wächters fangen `/api/analytics/track` ab und beantworten es selbst — sie
schreiben konstruktionsbedingt nie in die DB; die schreibenden Fälle räumen vor
UND nach dem Lauf (`finally`).

## 8. Übergabe

- Wächter: `tests/e2e/kanal-trichter.spec.mjs` (Hauptbaum, untracked; Zweitkopie
  im Session-Scratchpad).
- Dieser Bericht: `docs/GATE-KAI-ANALYTICS-KANAL-2026-08-22.md`.
- Prüf-Worktree `../hoops-gate-kai` wird nach der Übergabe entfernt.
- Nach Umsetzung der Auflage (eine Bedingung in `teamsBySrcAgg`) wird der
  Wächter grün; die Mutationsmatrix hat die Rückrichtung bereits belegt
  (Mutation 2 zeigt exakt die vorformulierte Fehlermeldung).
