# Wiederkehr-Rate für den Go/No-Go-Entscheid — Definition VOR der Messung

**Ronja (retention-analystin) · 23.08.2026 · Auftrag Patrick**

**Zweck:** Diese Datei legt fest, was in Phase 3 (Auswertung & Go/No-Go, 30.11.–18.12.2026)
als „die Leute kommen wieder" zählt — **bevor** die ersten Daten der Testphase existieren.
Eine Schwelle, die man nach dem Blick auf die Daten setzt, ist keine Schwelle, sondern eine
Rechtfertigung.

**Festschreibung:** Ab Beginn von Phase 2 (14.09.2026) wird an dieser Definition nichts mehr
geändert außer mit ausdrücklicher Entscheidung von Patrick, und jede Änderung wird hier mit
Datum und Begründung protokolliert. Der Spielwochen-Kalender (§2.4) ist am 23.08.2026 aus
öffentlichen Terminquellen **gemessen und eingetragen** (`docs/SPIELWOCHEN-KREIS-NIERS-2026.md`,
maschinenlesbar `lib/spielwochenNiers2026.mjs`) — nicht aus unseren Nutzungsdaten. Die
verbleibenden Vorab-Punkte stehen in §8.

**Keine erfundenen Zahlen:** Alle Schwellen in §3 sind **Setzungen** und als solche
gekennzeichnet. Es gibt keine belastbaren Vergleichswerte für dieses Produkt (§3.3) —
das steht dort ehrlich, statt eine fremde Branchenzahl als Beleg zu verkleiden.

---

## 0. Auftrag gespiegelt, Grundlagen

- **Entscheidung, die die Zahl tragen muss:** Go/No-Go für den Cutover zur Rückrunde
  (Spielplan zur Liveschaltung, 22.08.2026; Phasen aus
  `docs/KAMPAGNENPLAN-TESTPHASE-LIVE-2026-08-22.md`).
- **Pflicht-Startpunkte gelesen:** `docs/BEDARFSANALYSE-2026-08-09.md` §4 (Mats' H1–H7),
  `docs/RETENTION-BEFUND-2026-08-13.md` (meine These „Verbindungen statt Funktionen"),
  `models/AnalyticsEvent.js`, `lib/analyticsSummary.js`, `lib/echteZahlen.js`,
  `models/Player.js`, `docs/VEREINE-KREIS-NIERS-2026-08-22.md` (erste Spieltermine
  Kreis Niers: **03.10.2026**).
- **Datenlage-Ehrlichkeit:** Die Kohorte wird aus **Dutzenden** Nutzern bestehen, nicht
  Hunderten (10 angeschriebene Vereine, Kader ~10–15). Die ganze Definition ist auf diese
  Größenordnung gebaut — deshalb §4 (Mindest-n) und die Regel, dass unter der Schwelle
  **Personen gezählt und keine Prozente berichtet** werden.
- **Bots:** Seit 22.08.2026 zählt der Tracker gesteuerte Browser nicht mehr
  (`webdriver`-Riegel, `70fd2d1`; seit Roadmap 39 auch für Custom-Events über
  `lib/analyticsClient.js`). Das Messfenster beginnt am 14.09. — es enthält keine
  kontaminierten Alt-Daten.

---

## 1. Die Metrik

### 1.1 Warum Spielwoche und nicht Tag oder Kalenderwoche

Der ehrliche Takt des Produkts ist der **Spieltag**: Der Kernnutzen (belegtes Ergebnis,
eigene Zahlen im Box-Score) entsteht **nach dem Wochenend-Spiel**. Eine Tages-Retention
würde ein Produkt bestrafen, das seinen Nutzen einmal pro Woche liefert — und eine nackte
Kalenderwoche würde Nutzer in Wochen „durchfallen" lassen, in denen es gar nichts gibt,
wofür man wiederkommen könnte (Pokalwochenende, Ferien, die drei Vorlaufwochen vor dem
ersten Kreis-Niers-Spieltag am 03.10.).

**Einheit ist deshalb die Spielwoche:** Montag 00:00 bis Sonntag 24:00 (Europe/Berlin),
und eine Woche zählt nur dann als Spielwoche, wenn sie im festgeschriebenen Kalender
(§2.4) als solche geführt ist. Spielfreie Wochen existieren für die Metrik nicht — weder
im Zähler noch im Nenner. Ein Nutzer kann eine Woche, in der niemand spielt, nicht
„verpassen".

*(Zum Auftrag: Der vorgeschlagene Startpunkt „Wochen-Kohorte über Spielwochen" ist richtig
und wird übernommen — mit einer Verdichtung: Die klassische Kohortenkurve „Woche 1 / Woche 2
/ Woche 3 …" bleibt als Diagnose-Anhang, trägt aber nicht die Entscheidung. Bei Dutzenden
Nutzern hat jede einzelne Kohortenwoche 3–8 Personen; die Kurve ist dann Rauschen mit
Achsenbeschriftung. Die Entscheidung trägt eine einzige, robustere Zahl — §1.4.)*

### 1.2 Wer gezählt wird — und welche Rolle die Entscheidung trägt

Drei Gruppen, drei verschiedene Aussagekraft:

| Gruppe | Zählt für Go/No-Go? | Warum |
|---|---|---|
| **Spieler ohne Admin-Rolle** | **JA — das ist die tragende Rolle** | Er hat keine Pflicht. Wenn er wiederkommt, dann weil ihn seine Zahlen, seine Liga, sein Feed interessieren. Das ist das einzige unverfälschte Retention-Signal. |
| **Team-Admins** (`isTeamAdmin` oder `teamAdminOf` gesetzt) | Nein — eigene Vorbedingungs-Metrik (§3.4) | Ein Admin MUSS wiederkommen (Ergebnis eintragen). Seine Wiederkehr misst Pflichterfüllung, nicht Produktzug. Ihn mitzuzählen würde die Quote schönen — genau die Sorte Zahl aus `docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md`. |
| **Anonyme Besucher** (nur `sessionId`) | Nein — nur Kontext | Nicht stabil zuordenbar (Cookie-Löschung, Zweitgerät, geteilte Geräte). Ihre Zahlen werden im Bericht als Umfeld ausgewiesen, tragen aber nichts. |

Randfall Co-Admins: Wer über die Teilrechte (`lib/teamPermissions.js`) Ergebnisse eintragen
darf, hat dieselbe Pflicht wie ein Admin. Kai prüft beim Bau, ob Co-Admins am Datenmodell
identifizierbar sind; wenn ja → Admin-Gruppe, wenn nein → wird das als bekannte Unschärfe
im Ergebnisbericht ausgewiesen (voraussichtlich 0–2 Personen, benennen statt verstecken).

### 1.3 Was als „wiedergekommen" zählt

**Aktiv in Spielwoche N** heißt: mindestens **ein** `AnalyticsEvent` mit der `playerId`
dieses Kontos, dessen `createdAt` in Spielwoche N liegt — gleich welcher Typ, mit einer
Ausnahme: `own_stats_notified` zählt NICHT (das ist ein Server-Ereignis beim Versand der
Benachrichtigung; der Spieler hat dabei nichts getan — dieselbe Ausschluss-Logik steht
bereits in `lib/analyticsSummary.js`).

**Warum ein eingeloggter Seitenaufruf reicht und keine „Handlung" verlangt wird:**
Erstens ist Einloggen selbst eine bewusste Handlung — niemand landet versehentlich
eingeloggt auf seiner Liga-Tabelle. Zweitens ist der Kernnutzen des Produkts **Nachsehen**
(meine Zahlen, die Tabelle, das Ergebnis) — eine Metrik, die nur Posten/Kommentieren/
Bewerben zählte, würde am Produktversprechen vorbeimessen. Drittens würde eine
Handlungs-Schwelle bei n≈Dutzende die Zahl praktisch auf null drücken und die Entscheidung
auf Anekdoten zurückwerfen.

**Zweite Stufe (nur Diagnose, keine Entscheidungszahl):** „Kern-Aufruf" = Aufruf eines
Pfads, der den Kernnutzen trägt: `path` beginnt mit `/match/`, `/ligen/`, `/topscorer`,
`/spiele`, `/player/newsfeed` oder `/player/player-detail`. Damit wird Mats' H2 („Stats
sind das Zugpferd") direkt prüfbar: Welcher Anteil der Wiederkehr-Wochen enthält einen
Kern-Aufruf, und welche Pfade führen?

### 1.4 Die Go/No-Go-Zahl: die Wiederkehr-Quote (WQ)

> **WQ = Anteil der gewerteten Spieler, die in mindestens ZWEI verschiedenen
> Spielwochen NACH ihrer Registrierungswoche aktiv waren.**

- **Gewertet** ist ein Konto, wenn es (a) den Echtheitsfilter besteht (§2.2), (b) NICHT
  zur Admin-Gruppe gehört (§1.2) und (c) zum Stichtag mindestens **4 mögliche Spielwochen**
  hatte (d. h. zwischen dem Ende seiner Registrierungswoche und dem 13.12.2026 liegen ≥4
  Spielwochen laut Kalender §2.4 — praktisch: Registrierung bis So 08.11.2026). Wer später
  registriert wurde, hatte schlicht nicht genug Gelegenheit, zweimal wiederzukommen — er
  fällt nicht durch, er wird gesondert als „zu jung für Wertung" ausgewiesen (mit
  Rohaktivität).
- **Warum zwei Wochen und nicht eine:** Ein einmaliges Wiederkommen kann Höflichkeit
  sein („Jonatan hat gefragt, ob ich reingeschaut habe"). Zwei Besuche in zwei
  verschiedenen Spielwochen sind das kleinste ehrliche Signal, dass das Produkt einen
  Platz im Saisonrhythmus hat. Mehr zu verlangen (z. B. „in der Hälfte aller Wochen")
  wäre bei 7 gewerteten Spielwochen und Dutzenden Nutzern eine Schwelle, an der
  Rauschen entscheidet.
- **Registrierungswoche zählt nicht mit:** Aktivität in der Woche der Kontoerstellung ist
  Onboarding, keine Wiederkehr.
- **Stichtag der Wertung: Montag, 14.12.2026.** Gemessen wird der Zeitraum bis
  einschließlich Sonntag, 13.12.2026, 24:00 Europe/Berlin — das sind **7 vollständige
  Spielwochen** (Kalender §2.4). Die Go/No-Go-**Besprechung** bleibt im Phase-3-Fenster
  (30.11.–18.12.); nur der Datenstand, auf dem die Ampel rechnet, ist der 14.12.
  ⚠️ **Geändert am 23.08.2026 gegenüber der Erstfassung (dort: 30.11.), VOR Messbeginn**
  — Anlass ist der gemessene Kalender: Die NRW-Herbstferien schlucken drei Wochen am
  Stück, bis zum 29.11. lägen nur **5 Spielwochen**, und gewertet wäre nur, wer sich bis
  zum 04.10. registriert — bei Vereinsmails ab Mitte September fiele ein Großteil der
  Kampagnen-Kohorte aus **Kalendergründen** aus der Wertung, nicht aus Produktgründen.
  Verworfen wurde die Alternative, das Wertungsfenster je Spieler zu relativieren
  („mindestens 3 mögliche Wochen"): Sie stellt ungleiche Latten in dieselbe Quote —
  wer genau 3 mögliche Wochen hat, bräuchte Anwesenheit in 2 von 3 (67 %), ein früh
  Registrierter nur 2 von 7 (~29 %); die Quote hinge dann daran, WANN Leute registrieren,
  nicht OB sie wiederkommen.
- **Zwei Bindungen zur Stichtagsverschiebung, damit sie kein Hintertürchen wird:**
  (1) Die 8. Spielwoche des Kalenders (Mo 14.12., endet So 20.12.) zählt **NICHT** in
  die Ampel — sie endet nach dem Entscheidungstermin (Fr 18.12.); wer sie „noch
  mitnimmt", wählt den Datenstand nach Wunschergebnis. Sie wird nach dem 20.12. als
  Nachlese für Phase 4 berichtet, ändert die Ampel aber nicht mehr.
  (2) Am **30.11.** erzeugt der Messjob einen **Zwischenstand ohne Ampel** (Datenstand
  5 Spielwochen) — damit die Auswertung im engen Fenster 14.–18.12. der routinierte
  x-te Lauf eines erprobten Jobs ist, kein Erstlauf unter Zeitdruck. Der Zwischenstand
  trägt keine Ampelfarben und keine Empfehlung; er dient der Job-Erprobung und der
  Vorbereitung der Bericht-Struktur.

### 1.5 Begleitmetriken (erklären die WQ, entscheiden nichts)

- **M2 — Spieltags-Folgequote:** Anteil der gewerteten Spieler mit eigenem Spieltermin
  (Spiel des eigenen `teamId` in dieser Woche, `matches`-Sammlung), die **binnen 72 h nach
  dem Spieltermin** aktiv waren. Das ist die schärfste Probe auf das Produktversprechen
  „deine Zahlen nach dem Spiel" — und der direkte Test meiner R1-Verbindung
  (`own_stats`-Benachrichtigung).
- **M3 — Erfassungstreue der Admins:** Anteil der stattgefundenen Spiele echter Teams,
  zu denen binnen 7 Tagen ein Ergebnis eingereicht wurde (Mats' H3, gemessen an
  `Match.status`/`resultStatus`). Das ist keine Retention-, sondern eine
  **Vorbedingungs-Metrik** — ihre Rolle steht in §3.4.
- **M4 — Kohortenkurve:** je Registrierungs-Spielwoche der Anteil Aktiver in den
  Folge-Spielwochen 1–4. Nur als Anhang, wegen Kleinst-Kohorten (§1.1).
- **M5 — Benachrichtigungs-Kette:** `own_stats_notified` → `own_stats_opened` binnen 72 h
  (die Auswertung existiert bereits in `lib/analyticsSummary.js`). Trägt §6
  (Falsifizierbarkeit meiner These).

---

## 2. Operationalisierung — so konkret, dass Kai ohne Rückfrage bauen kann

### 2.1 Datenquellen

| Quelle | Felder | Verwendung |
|---|---|---|
| `analyticsevents` | `playerId`, `eventType`, `path`, `createdAt` | Aktivität je Spielwoche (§1.3) |
| `players` | `_id`, `createdAt`, `isDemo`, `isInternal`, `isTeamAdmin`, `teamAdminOf`, `teamId`, `signupSource` | Kohorte, Rollen, Echtheit, Kanal-Aufschlüsselung |
| `matches` | `teamA`, `teamB`, `date`, `status`, `resultStatus` | M2 (eigener Spieltermin), M3 (Erfassungstreue) |
| Spielwochen-Kalender | Konfigliste im Messjob (§2.4) | Nenner der möglichen Spielwochen |

### 2.2 Echtheitsfilter (Pflicht, keine Ausnahme)

1. Kohorte: `players` mit `NUR_ECHT` aus `lib/echteZahlen.js`
   (`isDemo: {$ne: true}, isInternal: {$ne: true}`) — **denselben Import benutzen**, keine
   Kopie der Bedingung.
2. `analyticsevents` trägt selbst kein `isDemo` — Ereignisse werden über den **Join gegen
   die gefilterte Kontenliste** gefiltert: nur Events, deren `playerId` in der
   Echt-Kohorte liegt, existieren für diese Messung.
3. **Vor Messbeginn verifizieren** (Kai, einmalig, nur lesend): Die beiden
   Super-Admin-Spielerkonten (`p.schemura@gmail.com`, `jonatanbaenavides@gmail.com`) und
   alle Entwickler-/Testkonten tragen `isInternal: true` auf `hoops_prod`. Wenn nicht,
   ist das VOR dem 14.09. zu beheben (Entscheidung/Ausführung mit Patrick) — sonst zählt
   sich das Projekt selbst, und zwar bei dieser Kohortengröße nicht als Rundungsfehler,
   sondern als mehrere Prozentpunkte pro Konto.
4. Bots: kein zusätzlicher Filter nötig — der `webdriver`-Riegel greift seit 22.08.2026
   beim Schreiben. (Und ohnehin: Bots haben keine `playerId`.)

### 2.3 Zeitrechnung

- Wochengrenzen in **Europe/Berlin** rechnen, nicht in UTC. Achtung: Die Zeitumstellung
  (Ende Sommerzeit, letzte Oktoberwoche) verschiebt die UTC-Instanzen der Wochengrenzen —
  MongoDB-seitig `$dateToString`/`$dateTrunc` mit `timezone: "Europe/Berlin"` benutzen
  oder die Grenz-Zeitpunkte im Job vorab als UTC-Instants berechnen.
- Registrierungswoche = Spielwochen-/Kalenderwoche von `Player.createdAt` (Europe/Berlin).
- Für Bestandskonten, die VOR dem 14.09.2026 registriert wurden (die ~10 externen
  Bestandsnutzer): Registrierungswoche wird auf die Woche vor der ersten Spielwoche
  gesetzt — sie gelten als „von Anfang an dabei" und werden voll gewertet, aber im
  Bericht als eigene Zeile ausgewiesen (Bestand vs. Kampagne), damit die Kampagnen-Kohorte
  (`signupSource` gesetzt, z. B. `vereinsmail`) separat lesbar bleibt.

### 2.4 Der Spielwochen-Kalender — festgeschrieben, nicht gemessen

Der Kalender ist eine **Konfigurationsliste im Messjob** (Array von Montagsdaten), keine
Datenbankabfrage. Grund: Die `matches`-Sammlung füllt sich erst dadurch, dass Admins
Spiele eintragen — den Nenner der Metrik aus genau dem Verhalten abzuleiten, das die
Metrik messen soll, wäre eine Messung, die ihre eigene Stellgröße verändert (bekannte
Fehlerform, CLAUDE.md-Merksatz).

Regeln:
- **Der Kalender ist gefüllt — gemessen am 23.08.2026, nicht angenommen:**
  `docs/SPIELWOCHEN-KREIS-NIERS-2026.md` (Herleitung, Quelle + Abrufdatum je Woche) und
  `lib/spielwochenNiers2026.mjs` (maschinenlesbar für den Messjob; beide Dateien müssen
  inhaltsgleich bleiben). Quellen: TeamSL-Spielplan KLH Niers 2026/27 (Liga-ID 56045,
  vollständig: 9 Teams × 8 Paarungen = 72 Spiele, exakt 72 angesetzt) + offizielle
  NRW-Ferienordnung (Herbstferien Sa 17.10.–Sa 31.10.2026).
- **Ergebnis: 8 Spielwochen** im Messfenster — Mo **28.09. · 05.10. · 02.11. · 09.11. ·
  23.11. · 30.11. · 07.12. · 14.12.** — und 4 spielfreie Wochen (12.10., 19.10., 26.10.
  rund um die Herbstferien; 16.11. Totensonntags-Wochenende). Die Leerwochen sind
  Verbands-Setzungen, keine Datenlücken.
- **Wertungsfenster der Kernmetrik: die ersten 7 Spielwochen** (28.09. bis einschließlich
  Woche 07.12., endet So 13.12.) — siehe Stichtagsregel §1.4. Die 8. Spielwoche (14.12.)
  ist Nachlese, keine Ampel-Woche.
- Die Wochen 14.09.–27.09. sind Onboarding-Vorlauf: Registrierungen zählen dort für die
  Kohorte, aber es sind keine Spielwochen — niemand kann in ihnen „wiederkommen versäumen".
- Nach dem 14.09. wird die Liste nur noch geändert, wenn der Verband Termine verlegt —
  mit Protokollzeile hier in dieser Datei. Vor Messbeginn einmal gegen TeamSL
  gegenprüfen (Verlegungen bis Saisonstart bleiben möglich).

### 2.5 Pipeline-Skizze (Pseudocode für den Messjob)

```
0. stichtag  = Mo 14.12.2026, 00:00 Europe/Berlin (Daten bis So 13.12., 24:00);
   Spielwochen = die ersten 7 Einträge aus lib/spielwochenNiers2026.mjs (§2.4)
1. kohorte   = players.find(NUR_ECHT ∧ createdAt ≤ stichtag)
2. je Konto:  rolle = (isTeamAdmin ∨ teamAdminOf ∨ [co-admin, falls identifizierbar])
              ? ADMIN : SPIELER
3. events    = analyticsevents.find(playerId ∈ kohorte
                 ∧ eventType ≠ "own_stats_notified"
                 ∧ createdAt ∈ [start P2, stichtag])
4. je Konto:  aktiveWochen = distinct(spielwoche(createdAt)) der eigenen Events,
              geschnitten mit Spielwochen-Kalender,
              minus Registrierungswoche
5. je SPIELER: möglicheWochen = |Kalender-Spielwochen nach Registrierungswoche|
              gewertet  = (möglicheWochen ≥ 4)
              wiedergekommen = (|aktiveWochen| ≥ 2)
6. WQ = wiedergekommen / gewertet   (nur SPIELER, nur gewertet)
7. Ausgabe IMMER mit absoluten Zahlen: "WQ: X von Y gewerteten Spielern (Z %)"
   – und wenn Y < 20: KEINE Prozentzahl ausgeben, nur X von Y (§4).
8. Anhang: M2, M3, M4, M5, Kern-Aufruf-Anteile, Aufschlüsselung nach signupSource,
   Admin-Gruppe separat (informativ), Anonym-Umfeld (Sitzungen gesamt).
```

**Ehrlichkeitsschranken im Job selbst** (Muster der bestehenden Wächter):
- Wenn die Echt-Kohorte 0 Spieler enthält oder der Spielwochen-Kalender leer ist, bricht
  der Job mit Fehlermeldung ab, statt „0 %" zu drucken — Abwesenheit von Messung darf
  nicht wie ein Messwert aussehen (Kais eigener Selbstbefund vom 22.08. als Vorlage).
- Jede Prozentzahl trägt ihr n direkt daneben. Ein Report ohne n wird nicht erzeugt.
- Der Job läuft **nur lesend** gegen `hoops_prod`.

### 2.6 Bekannte Messgrenzen (vorab benannt)

- Ein Spieler, der die Seite nur ausgeloggt ansieht (z. B. Tabelle als Lesezeichen ohne
  Login), zählt nicht als wiedergekommen. Das **untertreibt** die echte Wiederkehr.
  Bewusst in Kauf genommen: die eingeloggte Zuordnung ist die einzige saubere; der
  anonyme Rest wird als Umfeld berichtet.
- Gemeinsame Gerätenutzung (ein Handy, zwei Spieler) ist nicht erkennbar — bei
  Kader-Kollegen denkbar. Bei dieser Größenordnung als Restunschärfe benannt.
- `AnalyticsEvent` speichert keinen Login-Zeitpunkt, nur Aktivität mit Token. Das ist
  für diese Metrik korrekt so (Aktivität ist das Maß, nicht der Login-Vorgang).

---

## 3. Schwellen für den Go-Entscheid — und woher sie kommen

### 3.1 Die Ampel (gilt NUR bei n ≥ 20 gewerteten Spielern, sonst §4)

| Ampel | WQ | Lesart für die Entscheidung |
|---|---|---|
| **Grün** | **≥ 40 %** | Das Produkt hat bei einer warm geworbenen Kohorte einen Platz im Saisonrhythmus. Wiederkehr spricht für Go — die Go-Entscheidung selbst wägt zusätzlich Recht, Kosten, Kapazität (nicht mein Feld). |
| **Gelb** | **20–39 %** | Signal vorhanden, trägt aber nicht. Go nur, wenn die Diagnose-Metriken (M2/M3/M5, Feedback) eine **konkrete, behebbare** Ursache zeigen — und die Behebung vor dem Cutover eingeplant ist. Sonst: Testphase verlängern statt live gehen. |
| **Rot** | **< 20 %** | Weniger als jeder Fünfte kam trotz persönlicher Ansprache, laufender Saison und eigener Spiele zweimal wieder. Kein Go auf dieser Basis; erst Ursachenanalyse (§3.4 prüfen!), dann neu entscheiden. |

### 3.2 Warum diese Werte — die ehrliche Herleitung

**Es gibt keine belastbaren Vergleichswerte für dieses Produkt.** Öffentliche
Retention-Benchmarks (App-Analytics-Anbieter, Consumer-Apps) messen anonyme
App-Store-Installationen aus kalten Funnels — Nutzer, die eine App nebenbei laden und
nie wieder öffnen. Unsere Kohorte ist das Gegenteil: persönlich angesprochen, über den
eigenen Verein geworben, teils mit dem Mitgründer im selben Kader, mitten in ihrer
laufenden Saison. Ein kalter Branchenwert wäre hier eine **viel zu niedrige** Latte —
ihn zu zitieren hieße, sich selbst eine bequeme Schwelle zu bauen und ihr ein fremdes
Etikett anzukleben. Deshalb: **Die Schwellen sind Setzungen.** Ihre Herleitung ist eine
Argumentations-, keine Datenkette:

- **Obergrenze der Erwartung:** Selbst ein perfektes Produkt erreicht in einem Kader
  nicht jeden — es gibt Spieler, die sich auf Zuruf registrieren und das Thema danach
  komplett dem Admin überlassen (WhatsApp bleibt der Lebensraum, Mats 1b/H6). 100 % ist
  keine sinnvolle Referenz.
- **Untergrenze der Tragfähigkeit:** Damit ein Verein die Plattform als „unser Werkzeug"
  erlebt (die Voraussetzung dafür, dass der Cutover zur Rückrunde etwas zum Leben
  erweckt statt eine leere Hülle zu veröffentlichen), muss ein tragfähiger Kern jedes
  Kaders von selbst wiederkommen. „2 von 5" (40 %) als Grün-Marke heißt: In einem
  12er-Kader kommen ~5 Spieler aus eigenem Antrieb wieder — genug, dass Likes, Kommentare
  und Feed-Leben von echten Menschen stammen können statt von Seed-Daten.
- **Rot bei < 20 %:** Wenn nicht einmal jeder fünfte warm geworbene Spieler mit eigenen
  Spielen und eigenen Zahlen einen zweiten Grund fand, ist das Kernversprechen („jeder
  will seine Stats", Mats Bedarf 1 / Neles Hook) am Nutzer vorbei — oder eine
  Vorbedingung ist gerissen (§3.4). Beides verbietet einen Cutover „weil der Zeitplan
  es so vorsah".

**Funktion der Setzung:** Sie bindet uns, bevor die Daten da sind. Im Dezember darf
diskutiert werden, WARUM die Zahl ist, wie sie ist — nicht, OB 23 % „eigentlich doch
ganz gut" sind.

### 3.3 Eine Zahl trägt, alle anderen erklären

Nur die WQ hat eine Ampel. M2–M5 haben **bewusst keine Schwellen** — sonst entsteht im
Dezember Schwellen-Shopping („aber M2 ist grün!"). Sie dienen der Diagnose: Ein gelbes
oder rotes WQ-Ergebnis wird mit ihnen erklärt, nicht überstimmt.

### 3.4 Die Vorbedingungs-Ampel (Erfassungstreue M3)

Wenn die Admins keine Ergebnisse eintragen, gibt es nichts, wofür Spieler wiederkommen —
dann misst die WQ nicht „Spieler wollen nicht", sondern „es gab nichts zu sehen".
Deshalb gilt: **Liegt M3 unter 50 %** (weniger als die Hälfte der stattgefundenen Spiele
echter Teams hat binnen 7 Tagen ein Ergebnis), **ist ein rotes oder gelbes WQ-Ergebnis
nicht als Spieler-Desinteresse interpretierbar.** Die Ursachenkette beginnt dann bei
Mats' Bedarf 4 (Doppelerfassung/Ehrenamtslast, H3) — und die richtige Konsequenz wäre
Arbeit am Erfassungsweg (z. B. Roadmap 17, Live-Eingabe), nicht ein Urteil über die
Spieler. Ein grünes WQ bei rotem M3 ist übrigens genauso zu misstrauen — dann kommen
Leute wieder, obwohl der Kernnutzen fehlt, und wir sollten verstehen wofür, bevor wir
es als Bestätigung feiern.

---

## 4. Mindest-n: ab wann die Prozente überhaupt etwas bedeuten

**Unter 20 gewerteten Spielern wird keine Prozentzahl berichtet.** Der Messjob gibt dann
nur absolute Zahlen aus („7 von 13 gewerteten Spielern kamen in ≥2 Spielwochen wieder").

Begründung ohne Statistik-Theater: Bei n = 20 verschiebt **eine einzige Person** die
Quote um 5 Prozentpunkte — das ist bereits ein Viertel des gesamten Gelb-Bands. Bei
n = 10 ist das ganze Gelb-Band (20–39 %) exakt **zwei Personen** breit; ob die Ampel
gelb oder rot zeigt, entscheidet dann, ob ein einzelner Spieler zufällig in der
Pokalwoche im Urlaub war. Eine Ampel, die an einer Person hängt, ist keine Ampel.

**Was unter n = 20 stattdessen die Entscheidung trägt** (qualitative Signale, jedes mit
Beleg-Pflicht — kein „gefühlt gut angekommen"):

1. **Der Kader-Beweis:** Gibt es mindestens EIN echtes Team, bei dem ≥5 Nicht-Admin-Spieler
   in ≥2 Spielwochen wiederkamen? Ein vollständig lebendiger Kader beweist mehr als eine
   dünn verteilte Quote — er zeigt, dass der Mechanismus funktioniert, wo die
   Voraussetzungen stimmen. (Direkt aus den WQ-Rohdaten ablesbar, je Team gruppiert.)
2. **Die Benachrichtigungs-Kette (M5):** Werden `own_stats`-Benachrichtigungen versendet
   und binnen 72 h geöffnet? Jede geöffnete ist ein belegter Wiederkehr-Moment.
3. **Unaufgeforderte Rückmeldungen:** Feedback-Formular-Einträge und dokumentierte
   WhatsApp-/persönliche Rückmeldungen an Patrick/Jonatan — wörtlich protokolliert, mit
   Datum, positiv wie negativ. (Lina sammelt in P2 ohnehin Onboarding-Befunde echter
   Tester — gemeinsame Ablage.)
4. **Freiwilligkeit über Pflicht hinaus bei Admins:** Trägt ein Admin mehr ein als das
   Pflicht-Endergebnis (vollständige Box-Scores, Team-Posts)? Das ist bei kleinem n das
   stärkste Einzelsignal — er investiert Ehrenamtszeit, die niemand verlangt.

Bei n < 20 lautet die ehrliche Empfehlung an Patrick & Jonatan dann nicht „Go/No-Go
anhand der Quote", sondern: Entscheidung anhand dieser vier Signale plus der Frage,
ob eine **verlängerte Testphase in der Rückrunde** (Cutover verschieben) mehr Erkenntnis
bringt als ein Cutover auf dünner Basis. Das auszusprechen ist Teil meines Auftrags;
entscheiden tun es die beiden.

---

## 5. Was das Ergebnis NICHT beweisen kann — vorab festgehalten

1. **Keine Aussage über kalte Nutzer.** Die Kohorte ist warm geworben (persönliche
   Vereinsansprache, Scorpions-Nähe). Ein grünes Ergebnis sagt: „Das Produkt hält warm
   geworbene Nutzer." Es sagt NICHTS darüber, ob Phase 5 (bundesweite Öffnung, kalte
   Kanäle) funktioniert — das ist eine andere Kohorte mit anderem Funnel.
2. **Keine Kanal-Kausalität.** `signupSource` sagt, woher jemand kam, nicht warum er
   blieb. Aufschlüsselungen nach Kanal sind bei diesem n Anekdoten.
3. **Neugier-Effekt nicht abtrennbar.** 7 gewertete Spielwochen reichen nicht, um „schaut es
   sich noch an, weil es neu ist" von „hat es in seinen Alltag eingebaut" zu trennen.
   Ein grünes Ergebnis ist ein Indiz für Produkt-Zug, kein Beweis für Dauer-Retention
   über eine ganze Saison.
4. **Das Ergebnis gilt für die Seite MIT Beispieldaten.** Patricks Entscheidung vom
   21.08. lässt die Seed-Inhalte für die Testphase stehen („lebendige Website").
   Die gemessene Wiederkehr enthält also einen unbekannten Anteil „die Seite wirkte
   belebt". Nach dem Demo-Purge (Roadmap 2, Cutover) kann die Wiederkehr anders
   ausfallen — das Ergebnis ist auf die Nach-Purge-Seite nicht 1:1 übertragbar.
   (Das ist keine Kritik an der Entscheidung, nur ihre Messfolge.)
5. **Admin-Aktivität beweist keinen Produktwert** (Pflicht, §1.2) — und umgekehrt
   beweist Spieler-Fernbleiben bei gerissener Vorbedingung (§3.4) kein Desinteresse.
6. **Grün ist bei diesem n ein starkes Indiz, kein statistischer Beweis.** Auch über
   n = 20 bleiben die Bänder grob. Die Ampel ersetzt nicht das Urteil von Patrick &
   Jonatan; sie verhindert nur, dass das Urteil die Zahl nachträglich zurechtbiegt.
7. **Nicht-Messbares fehlt strukturell:** ausgeloggte Nutzung (§2.6), Mitlesen über
   den Bildschirm des Nebenmanns, Gespräche in der Kabine. Die Zahl untertreibt eher,
   als dass sie übertreibt — auch das gehört im Dezember dazugesagt.

---

## 6. Falsifizierbarkeit meiner eigenen These

Meine These vom 13.08. (`docs/RETENTION-BEFUND-2026-08-13.md`): **Es fehlen keine
Funktionen, sondern Verbindungen** — der größte Hebel war R1 („Deine Zahlen stehen"
als Benachrichtigung), inzwischen gebaut. P2 ist der erste Test dieser These an echten
Nutzern. Woran ich im Dezember erkennen würde, dass sie **falsch** war:

- **F1 — Die Verbindung wird gesehen und trägt nicht:** `own_stats`-Benachrichtigungen
  werden versendet UND überwiegend geöffnet (M5), aber die WQ bleibt rot. Dann war die
  Verbindung da, der Nutzer hat sie benutzt — und kam trotzdem nicht wieder. Das hieße:
  Das Problem ist der **Wert des Inhalts** (die Zahlen selbst tragen nicht), nicht seine
  Auffindbarkeit. Meine These wäre widerlegt; die Konsequenz gehört zu Mats (Bedarf 1
  neu prüfen), nicht zu mir.
- **F2 — Nutzer benennen fehlende Funktionen:** Im Tester-Feedback (Formular + dokumentierte
  Rückmeldungen) wird **dieselbe konkrete Funktion von ≥3 unabhängigen Personen** vermisst.
  Drei unabhängige Nennungen bei Dutzenden Nutzern sind bei dieser Größenordnung kein
  Rauschen mehr. Dann fehlten eben doch Funktionen — Mats' „wird NICHT gebraucht"-Liste
  und meine These wären an dieser Stelle gemeinsam zu revidieren, offen vor Patrick
  (Tandem-Regel: Widersprüche werden nicht stillschweigend aufgelöst).
- **F3 — Der Stats-Hook zieht nicht (H2 kippt):** Die Kern-Aufruf-Diagnose (§1.3) zeigt,
  dass wiederkehrende Spieler die Stats-/Liga-Flächen NICHT bevorzugt aufrufen, sondern
  z. B. nur den Feed. Meine gesamte Hebel-Priorisierung hing an Mats' Bedarf 1 + Neles
  Hook; kippen die, war die Verbindungs-Arbeit richtig gebaut, aber am falschen Motiv
  aufgehängt.

Tritt keiner der drei Fälle ein und die WQ ist grün oder gelb-mit-erklärbarer-Ursache,
gilt die These als vorläufig gestützt — nicht bewiesen (§5.6).

---

## 7. Abgleich mit Mats' Hypothesen (Tandem-Pflicht)

| Hypothese | Wird durch diese Messung… |
|---|---|
| **H1** (Checklist-Abschluss → Wiederkehr) | prüfbar: WQ-Rohdaten je Konto × `checklist_step_done`-Events. Bei kleinem n nur als Beobachtung, nicht als Quote. |
| **H2** (Stats als Zugpferd) | direkt geprüft über die Kern-Aufruf-Diagnose (§1.3) — zugleich mein F3. |
| **H3** (Doppelerfassungs-Müdigkeit) | direkt gemessen als M3, mit definierter Rolle als Vorbedingungs-Ampel (§3.4). |
| **H4** (Matching-Liquidität) | nicht Teil dieser Definition — separate Zählung (Anfragen/Bewerbungen absolut) bleibt bei Mats' Halbzeit-Check. |
| **H5** (Kampagnen-Spikes) | Kanal-Aufschlüsselung über `signupSource`/`src_landing` läuft mit, trägt aber keine Schwelle (§5.2). |
| **H6** (WhatsApp-Dominanz) | nicht Teil dieser Messung (Einladungswege), bleibt bei Mats. |
| **H7** (Echte-Liga-Effekt) | in P2 nur halb prüfbar: Es gibt nur EINE Region mit echter Ansprache (Niers) — der A/B-Vergleich echte vs. Demo-Region hat keine zweite Zelle. Ehrlich: H7 bleibt nach P2 offen, egal wie die WQ ausfällt. |

Dieser Abschnitt geht als Zuarbeit an Mats (sein P2-Halbzeit-Check und sein
Phase-3-Abgleich laut Kampagnenplan bauen darauf auf).

---

## 8. Einbezogene Kollegen, Zuständigkeiten, offene Punkte

- **Mats (Tandem, Pflicht):** §7 ist seine Arbeitsgrundlage; Widersprüche zwischen seiner
  Community-Recherche und den P2-Beobachtungen gehen offen an Patrick.
- **Kai (Messjob):** §2 ist seine Bauvorlage. Der Auftrag nennt ihn als Umsetzer; laut
  Rollenverteilung liegt Analytics-Implementierung bei Ben — die Zuordnung entscheidet
  Patrick/Ole, die Vorlage funktioniert für beide. Offene Bau-Punkte:
  `isInternal`-Verifikation auf Prod (§2.2 Punkt 3), Co-Admin-Klärung (§1.2),
  Kalender-Gegenprobe gegen TeamSL kurz vor Messbeginn (§2.4). Der Spielwochen-Kalender
  selbst ist seit 23.08.2026 gefüllt (`lib/spielwochenNiers2026.mjs`).
- **Lina:** Ihre Onboarding-Befunde aus echten Testern (P2) sind Teil der qualitativen
  Signale (§4) und der Gelb-Diagnose (§3.1).
- **Nele:** Kanal-Lesarten (`signupSource`) für ihre Phase-3-Kampagnenauswertung — mit
  der Warnung aus §5.2 (Anekdoten, keine Quoten).
- **Nora:** Kein neuer Rechtsberührungspunkt erkennbar — die Messung nutzt ausschließlich
  bereits erhobene Felder, es wird nichts Neues erfasst und nichts nach außen gegeben.
  Diese Einschätzung ist meine, nicht ihre; falls der Messjob doch neue Ereignistypen
  einführt, gilt die bestehende Konvention (Feedback/Analytics-Skill) und im Zweifel ihr Blick.
- **Ole:** keine Prioritätsverschiebung vorgeschlagen — bewusst: Diese Definition kostet
  vor dem 14.09. nur kleine Vorab-Punkte (§2.2/2.4), der Messjob selbst kann während
  P2 entstehen; erster Pflichtlauf ist der Zwischenstand am 30.11., die Ampel rechnet
  auf dem Stand vom 14.12. (§1.4).
- **Vivien:** nicht einbezogen — kein Retention-Hebel mit Designbedarf in diesem Auftrag
  (es wird definiert, nicht gebaut).
- **Hanna:** Ergebnis-Nachtrag ins Backoffice steht als Folgeschritt aus (nicht Teil
  dieser Datei).

**Keine Dark Patterns:** Diese Definition misst nur. Sollte in P2 jemand vorschlagen, die
WQ durch Erinnerungs-Spam, künstliche Verknappung oder Ähnliches zu „verbessern", gilt:
Das würde die Messung entwerten UND gegen die Projektgrundsätze verstoßen — der ehrliche
Weg, die WQ zu heben, sind funktionierende Anlässe (Spieltag → Zahlen → Benachrichtigung),
und genau die sind gebaut.

---

## Änderungsprotokoll

| Datum | Änderung | Begründung | Entschieden von |
|---|---|---|---|
| 23.08.2026 | Erstfassung, festgeschrieben | Auftrag Patrick: Definition vor Messung | Ronja (Vorlage), Freigabe Patrick offen |
| 23.08.2026 | Wertungsstichtag 30.11. → **14.12.2026** (§1.4, §2.4, §2.5); Kalender-Verweise auf die gemessenen Dateien; 8. Spielwoche (14.12.) ausdrücklich von der Ampel ausgeschlossen; Zwischenstand 30.11. ohne Ampel eingeführt | Gemessener Spielwochen-Kalender (`docs/SPIELWOCHEN-KREIS-NIERS-2026.md`): Herbstferien-Lücke lässt bis 29.11. nur 5 Spielwochen — gewertet wäre nur, wer bis 04.10. registriert; die Kampagnen-Kohorte fiele aus Kalender-, nicht aus Produktgründen aus der Wertung. Alternative „Wertungsfenster je Spieler relativieren" verworfen (ungleiche Latten in einer Quote). Änderung VOR Messbeginn, noch ohne Nutzungsdaten. | Ronja, Freigabe Patrick offen |
