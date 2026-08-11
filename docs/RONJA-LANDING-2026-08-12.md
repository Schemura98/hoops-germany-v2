# Landing-Page-Verständnistest — „Eine Saison, sechs Spielzüge"

**Auftrag von Patrick, 12.08.2026 · Ronja (retention-analystin) · Hoops Germany v2 (live)**

**Patricks Frage, wörtlich:** „…beweglich beim Scrollen soll sinnhaft die ‚alles was man
braucht'-Sektion durchlaufen. Somit lernt man spielerisch die Vorteile und Funktionen kennen."
Geprüft wird **Verständnis**, nicht Ästhetik oder Technik (dafür sind Vivien und Tobias zuständig).

**Status der Befunde:** Alle mit „beobachtet" markierten Aussagen habe ich selbst im Browser
nachvollzogen (Live-Seite hoopsgermany.de, lesend; ergänzend lokaler Dev-Server gegen die Dev-DB
für die zwei eingeloggten Personas). „Vermutet" markiert Hypothesen über echte Erstbesucher, die
ich nicht direkt messen kann — dafür steht je ein Messvorschlag. Keine erfundenen Zahlen.

---

## 0. Pflicht-Startpunkte (Spiegelung)

Gelesen vor dem Test: `docs/BEDARFSANALYSE-2026-08-09.md` (Mats, inkl. Hypothesen-Liste H1–H7),
`docs/HERO-KAMPAGNEN-CHECK-2026-08-11.md` (Nele), `components/landing/LandingHero.js`,
`components/landing/HeroScrollStage.js`, `components/landing/LandingFeatures.js`,
`components/landing/FeatureMocks.js`, `components/landing/FeatureProgressRail.js`.

**Stand der Implementierung:** Alle in Patricks Auftrag beschriebenen Änderungen sind live
(verifiziert 12.08.2026, hoopsgermany.de) — NRW-Korrektur an beiden Stellen, sechs animierte
Szenen, Fortschritts-Anzeige mobil (Balken) und ab 1280px (Punkte), Ball-in-Korb-Animation im
Hero.

---

## 1. Personas + geprüfte Wege

Mats' Bedarfsanalyse nennt **Gruppen**, keine benannten Einzelpersonen — anders als bei HGH gibt
es hier keine Aylin-artige Personas-Doku. Ich habe daher zwei Personas **aus Mats' Gruppen
abgeleitet** und das als Annahme kenntlich gemacht:

- **„Sven", Spieler ohne Team** — abgeleitet aus Mats' Gruppe 1c (Vereinslose/Hobby-Spieler/
  Wiedereinsteiger) und Bedarf 1 (eigene Stats, kostenlos, ohne Frust). Getestet mit dem
  dokumentierten Dev-Test-Account `sven.adler@test.de` (CLAUDE.md, Free Agent, kein Team) —
  **nur gegen die Dev-DB**, wie vorgeschrieben.
- **„Max", Team-Verantwortlicher** — abgeleitet aus Mats' Gruppe 1b (Team-Organisatoren/
  Ehrenamt) und Bedarf 4 (minimaler Pflegeaufwand als Ausschlusskriterium, nicht als Feature).
  Getestet mit `max@test.de` (Team-Admin „Test Baskets") — ebenfalls Dev-DB.

**Geprüfte Wege:**
1. Ausgeloggt, Mobile 375×812, Live-Seite hoopsgermany.de: Hero → alle sechs Szenen → „So
   funktioniert's" → News → Footer-CTA. Vollständig gescrollt, dokumentiert.
2. Ausgeloggt, Desktop 1440×900, Live-Seite: derselbe Weg, zusätzlich Fortschritts-Punkte rechts.
3. Eingeloggt als Sven (Dev), Mobile: personalisierter Hero.
4. Eingeloggt als Max (Dev), Mobile: personalisierter Hero (Team-Admin-Variante).
5. Live-Seite `/ligen`, ausgeloggt: Realitätsabgleich zu Szene 4 (s. Abschnitt 5).

Für die Szenen-Zeitmessung (Abschnitt 3) habe ich zusätzlich die tatsächlichen
Opacity-/Transform-Werte der Live-Seite alle 100 ms ausgelesen (kein Screenshot-Raten, sondern
gemessene Werte aus dem laufenden DOM) — Rohdaten dort zitiert.

---

## 2. Szene für Szene: Was erklärt die Bewegung wirklich?

Frage laut Auftrag: Was hat die Bewegung *erklärt*, was hätte man ohne Text verstanden, wo ist
Dopplung, wo erklärt die Animation etwas, das nirgends im Text steht?

| # | Szene | Beobachtung | Urteil |
|---|---|---|---|
| 1 | Aufstellung (Profil) | Zahlen (18.4/6.1/4.2) zählen beim Erscheinen hoch. | **Dekorativ, keine eigenständige Lehre.** Der Text sagt „sammle Punkte, Assists & Rebounds" — das Hochzählen bebildert „sammeln" hübsch, aber wer nur die Bewegung sieht (Ton aus, Text überflogen), lernt nichts, was nicht auch ein Standbild zeigen würde. Harmlos, kein Fix nötig. |
| 2 | Kader füllt sich | Drei Kader-Zeilen erscheinen nacheinander (gestaffelt, ~150 ms Versatz). | **Trägt etwas bei, das der Text nicht sagt:** die Inkrementalität des Kaderaufbaus („einen nach dem anderen einladen"). Passt zur Eyebrow „Kader füllt sich". Funktioniert auch ohne Text plausibel lesbar. |
| 3 | Doppelt bestätigt | Siehe Abschnitt 3 — der wichtigste Einzelbefund. | **Dopplung, und die Animation trägt die Kernaussage NICHT eigenständig.** |
| 4 | Tabelle sortiert sich | Zwei Zeilen tauschen per Transform die Position (0,55 s). | **Zeigt DASS sortiert wird, nicht WARUM/WANN.** Der Text liefert die Kausalität („nach jedem bestätigten Spiel") — die Animation zeigt nur einen isolierten Tausch, ohne sichtbare Verbindung zu Szene 3 (kein „dieses Ergebnis hat gerade diese Verschiebung ausgelöst"). Funktional getrennt von der vorherigen Szene, obwohl die Erzählung („ein Spielzug in sechs Szenen") das nahelegt. Kein Fix-Zwang, aber eine Lücke. |
| 5 | Der nächste Zug (Scouting) | Drei Avatare poppen gestaffelt auf, „5 Bewerbungen" zählt hoch. | Zeigt „Bewerbungen trudeln ein" – nicht wörtlich im Text, aber naheliegend und stimmig. Funktioniert eigenständig. |
| 6 | Nachspielzeit (Feed) | Zwei Textzeilen „schreiben sich" (Clip-Path), danach Herz + Kommentar-Zahl. | Zeigt „ein Beitrag entsteht und bekommt Reaktionen" — nicht wörtlich im Text, plausible Ergänzung, funktioniert eigenständig. |

**Generelles Muster:** Szenen 2, 5, 6 fügen der Bewegung einen eigenständigen, auch ohne Text
verständlichen Gedanken hinzu („etwas entsteht/füllt sich über Zeit"). Szene 1 ist reine
Verzierung. Szene 4 zeigt das Resultat, nicht den Mechanismus. Szene 3 — die laut Auftrag
wichtigste — ist die einzige, bei der Text und Animation dieselbe Aussage machen sollen, es aber
nicht gleich gut tun (Detail folgt).

---

## 3. Der wichtigste Einzelpunkt: Versteht man „zwei Teams melden unabhängig" in Szene 3?

**Kurzantwort: Nein, nicht zuverlässig aus der Bewegung allein — die Beschriftung daneben trägt
die eigentliche Aussage.** Beleg folgt.

### Gemessene Choreografie (Live-Seite, echte DOM-Werte, nicht geschätzt)

Ich habe die Karte auf einer frischen Seite in den Sichtbereich gebracht und die Opacity von
Score, „Bestätigt"-Label und den beiden „eingereicht"-Badges alle 100 ms ausgelesen:

| Zeit ab Trigger | Team-A-Badge „eingereicht" | Team-B-Badge „eingereicht" | Score „78:65" | „Bestätigt" |
|---|---|---|---|---|
| 0–100 ms | erscheint | — | unsichtbar | unsichtbar |
| ~300 ms | **voll sichtbar** | — | unsichtbar | unsichtbar |
| ~450–720 ms | voll sichtbar | **erscheint, wird voll sichtbar** | unsichtbar | unsichtbar |
| **~720–900 ms** | **voll sichtbar** | **voll sichtbar** | unsichtbar | unsichtbar |
| ~900–1024 ms | verblasst | verblasst | beginnt einzublenden | unsichtbar |
| ~1024–1332 ms | weg | weg | wird voll sichtbar | beginnt einzublenden |
| ~1433 ms | weg | weg | voll sichtbar | **voll sichtbar** |

**Das Fenster, in dem beide Teams gleichzeitig als „eingereicht" zu sehen sind, beträgt rund
180–250 ms** (von ca. 720 ms bis 900 ms) — innerhalb einer Gesamtsequenz von rund 1,4–1,5
Sekunden (deckt sich mit Patricks Einschätzung „1,4 Sekunden Bewegung"). Die Beschriftung
„eingereicht" selbst ist **9px groß** (`text-[9px]`, `FeatureMocks.js` Zeile 167) — kleinster
Text auf der gesamten Landing-Page.

### Was das für einen echten Betrachter bedeutet

- Ohne begleitenden Text würde ich als Betrachterin die Bewegung so lesen: „ein Kreis blinkt
  links, dann rechts, dann wird eine Zahl groß, dann ein grüner Haken." Das liest sich wie „ein
  Ergebnis kommt rein und wird bestätigt" — nicht spezifisch wie „zwei UNABHÄNGIGE Meldungen, die
  erst bei Übereinstimmung als bestätigt gelten". Der Unterschied zu einer einzelnen
  Admin-Eingabe mit anschließender Bestätigung ist aus der Bewegung allein **nicht** ableitbar.
- Der Fließtext daneben sagt es vollständig und richtig: „Beide Teams tragen ihr Ergebnis
  unabhängig ein – erst wenn sie übereinstimmen, ist es bestätigt." Auf Mobile (375×812) sind
  Text und Karte gleichzeitig im Bildschirmausschnitt sichtbar (selbst nachvollzogen,
  Screenshot) — das Verständnis kommt also zustande, aber **über das Lesen, nicht über das
  Sehen**.
- Kontrollprobe: Bei `prefers-reduced-motion` (Barrierefreiheits-Pfad, selbst im Code
  nachvollzogen: `FeatureMocks.js` `useSequence`) werden die „eingereicht"-Badges **komplett
  übersprungen** — reduzierte Nutzer sehen ausschließlich den Endzustand (78:65, Bestätigt) und
  verlassen sich zu 100 % auf den Text. Das ist kein Bug, bestätigt aber strukturell: **das
  Vertrauensmerkmal lebt im Text, nicht in der Bewegung.**

### Warum das für beide Personas wichtig ist

- **Sven (Spieler ohne Team):** Für ihn ist die Aussage ein Qualitätsversprechen für die eigenen
  Stats/Tabellen (Bedarf 1 „ohne Frust") — er muss verstehen, dass die Zahlen nicht von einer
  Person allein gepflegt werden.
- **Max (Team-Admin):** Für ihn ist es das Entlastungsversprechen aus Bedarf 4 („nicht ich
  allein trage die Pflege") — genau die Zielgruppe, deren Ehrenamts-Knappheit laut Mats das
  strukturelle Dauerthema ist. Wenn er die Doppel-Meldung nur aus dem Text und nicht aus dem
  „Gefühl" der Animation mitnimmt, ist das kein Beinbruch (er liest vermutlich den Text, er ist
  die im Zweifel gründlichere Zielgruppe) — aber die Chance, das stärkste Argument auch beim
  bloßen Scrollen (ohne genaues Lesen) hängenzubleiben zu lassen, wird verschenkt.

**Einordnung:** Die Bewegung ist nicht falsch oder irreführend — sie ist zu schnell und zu klein
beschriftet, um die Kernaussage *eigenständig* zu tragen. Das ist der zentrale MUSS-Befund
(Abschnitt 6).

---

## 4. Zusatzfund: die Ball-in-Korb-Animation im Hero (beobachtet, nicht im Auftrag isoliert gefragt, aber Teil desselben Scroll-Erlebnisses)

Ich habe die Ball-Bewegung auf Mobile (375×812) live per DOM-Messung (nicht Vermutung)
nachvollzogen, da ein Screenshot zum richtigen Zeitpunkt bei einer 1,4-Sekunden-Animation kaum
zuverlässig zu treffen ist:

- Bei Scroll-Position y≈80px ist der Ball **voll sichtbar** (oben im Bild, teils von der Navbar
  angeschnitten) — Screenshot bestätigt das.
- Bereits bei y≈120px (40px weiter gescrollt) ist die Ball-Opacity **0** — und bleibt es bis
  mindestens y=400px, also während des gesamten weiteren Falls und der „Landung".
- Das Korb-Emblem an der Schaltfläche erscheint separat und unabhängig sichtbar (Opacity 1 ab
  y≈320px) — **ohne dass der Ball sichtbar ankommt.**

**Grund (aus dem Code nachvollzogen, `HeroScrollStage.js`):** Der Ball blendet bewusst aus,
sobald er auf Höhe des Textblocks ist (Vivien/Tobias-Entscheid vom 11.08., um Flackern hinter der
Schrift zu vermeiden) und kommt danach nicht mehr zurück, weil er zu diesem Zeitpunkt im
Bild bereits weit genug gefallen ist, dass der Rest seines Falls hinter dem Text-Fade-Puffer
oder knapp daneben liegt. Ergebnis: **Auf dem für Patrick als Hauptfall benannten 375px-Mobile
sehe ich einen kurzen Ball-Blitz oben im Bild — und danach poppt einfach ein kleines Körbchen an
der Schaltfläche auf, ohne dass ich den Ball dort ankommen sehe.** Die erzählte Choreografie
„Ball fällt und landet mit Swish im Korb" ist auf diesem Referenz-Breakpoint faktisch **zwei
unverbundene Mikro-Events**, kein durchgehend sichtbarer Fall.

Das ist eine Werkzeug-/Handwerks-Frage (Timing-Tuning), keine Verständnis-Frage im engeren Sinn —
ich melde sie trotzdem, weil sie dieselbe Wirkungslogik betrifft wie Szene 3: eine hübsch gemeinte
Bewegung, die auf dem Referenz-Breakpoint nicht das tut, was die Konzept-Beschreibung verspricht.
Da das reine Handwerk/Timing betrifft, das nicht in meinen Auftrag fällt (Ästhetik/Technik sind
Viviens/Tobias' Feld), gebe ich das als Beobachtung weiter statt selbst eine Lösung vorzuschreiben.

---

## 5. Realitätsabgleich Szene 4 ↔ `/ligen` (Ehrlichkeits-Check, positiv)

Da Szene 4 eine schön gefüllte Tabelle zeigt und Nele am 11.08. belegt hat, dass nur ~5 von
damals 63 offiziellen Ligen echte Teams haben, habe ich geprüft, ob ein Nutzer, der von Szene 4
motiviert zu `/ligen` weiterklickt, dort in eine Enttäuschung/Sackgasse läuft.

**Befund: Nein — die Live-Seite ist hier bereits ehrlich gebaut.** `/ligen` zeigt unter „Aktive
Ligen entdecken" nur Ligen mit Teams, alle klar mit einem **„BEISPIELDATEN"-Badge** markiert. Der
Klick auf „Alle 83 Ligen durchsuchen" zeigt die übrigen Ligen unter dem Filter „In Vorbereitung"
mit explizit „0 Teams" — kein leerer Tabellen-Blindflug, sondern eine benannte Lücke (selbst
gezählt: von 83 Ligen im Katalog sind zum Testzeitpunkt weniger als 20 mit Teams belegt, die
meisten davon zusätzlich als „BEISPIELDATEN" markiert). Szene 4 selbst trägt kein
„Beispieldaten"-Label — das ist aber vertretbar, weil sie erkennbar eine Produkt-Miniatur/ein
Mockup ist (wie Szenen 1–3, 5–6 auch), keine Behauptung über den heutigen Ist-Zustand. Hier sehe
ich **keinen Handlungsbedarf**, sondern bestätige der Verlinkung an Mats/Nele, dass die
Konsistenz-Sorge aus dem 11.08.-Check auf `/ligen` bereits sauber gelöst ist.

---

## 6. Priorisierte Befunde

### MUSS (vor dem nächsten Turnier-Feedback-Zyklus)

**M1 — Szene 3 „Doppelt bestätigt": Die Kernaussage lebt im Text, nicht in der Bewegung.**
Beobachtung: siehe Abschnitt 3 — nur ~200 ms gemeinsame Sichtbarkeit beider „eingereicht"-Badges
bei 9px Schriftgröße, Gesamtsequenz ~1,4 s. Wirkung (qualitativ): Nutzer, die scrollen statt lesen
(der von Nele explizit benannte Fall — Handy in der Halle, keine Zeit), nehmen vermutlich „ein
Ergebnis wird bestätigt" mit, aber nicht spezifisch „zwei unabhängige Meldungen" — genau das
Merkmal, das laut Bedarfsanalyse/Neles Kampagnen-Check das eigentliche Vertrauens- und
Entlastungsargument ist. Das ist eine Hypothese über Erstbesucher, keine Messung — Validierung
unten. Aufwand grob: klein (Timing-/Größen-Parameter in `FeatureMocks.js`, keine
Struktur-Änderung) — liegt aber bei Vivien/Patrick, nicht bei mir zu entscheiden, wie.
**Messvorschlag (mit vorhandenem Analytics-Tool umsetzbar):** Kein Klick-Event nötig, weil hier
Verständnis, nicht Klickverhalten geprüft wird — dafür eignet sich Analytics nicht direkt. Realer
Validierungsweg: Johnny fragt bei den nächsten Turnier-Feedback-Gesprächen (~17.08., ohnehin
geplant) gezielt eine Zusatzfrage: „Was passiert bei Hoops, wenn ein Spiel vorbei ist — wer trägt
das Ergebnis ein?" Antworten, die „beide Teams" nennen, ohne dass der Nutzer den Fließtext noch
einmal aufruft, wären ein starkes Signal, dass die Bewegung inzwischen trägt.

### SOLLTE (bekannt, hier eigenständig auf der Live-Seite bestätigt)

**S1 — Feedback-Button im eingeloggten Hero: Position bestätigt Neles Befund vom 11.08.**
Ich habe das selbst für beide Personas (Sven, Max) auf Mobile nachvollzogen: „Feedback" ist in
beiden Fällen der letzte von fünf Buttons, Ghost-Stil, während „Zum Feed" den einzigen
Primär-Platz belegt. Keine neue Information, aber eine unabhängige Zweitbestätigung — erhöht die
Sicherheit der Empfehlung. Kein neuer Messvorschlag nötig, Neles Befund steht.

**S2 — Ball-Landung auf Mobile faktisch unsichtbar (Abschnitt 4).** Beobachtung: Ball-Opacity
fällt bereits bei y≈120px auf 0 und bleibt dort bis mindestens y=400px, während das Korb-Emblem
unabhängig auftaucht. Wirkung (qualitativ): Der als Kampagnen-Baustein gedachte „Sprungball"
bleibt auf dem Hauptfall-Breakpoint ein kaum wahrnehmbarer Blitz statt einer sichtbaren Landung —
geringes Risiko, weil Nele bereits belegt hat, dass die meisten Tester über den QR-Code direkt zu
`/signup` gehen und den Hero gar nicht sehen. Für organischen/Wiederkehr-Traffic (die Zielgruppe
dieser Fläche) ist es trotzdem eine verschenkte Delight-Gelegenheit, kein Verständnisproblem.
Aufwand: vermutlich klein (Timing-Parameter), liegt technisch bei Vivien.

### Optional / kein Handlungsbedarf, aber vermerkt

**O1 — Szene 4 zeigt das Resultat einer Sortierung, nicht deren Auslöser** (Abschnitt 2). Die
Erzählung „ein Spielzug in sechs Szenen" suggeriert Kontinuität zwischen Szene 3 (Ergebnis
bestätigt) und Szene 4 (Tabelle sortiert sich), die visuell nicht eingelöst wird — beide Szenen
funktionieren aber je für sich korrekt. Nur relevant, falls die Choreografie später ausgebaut
wird.

**O2 — Desktop-Fortschrittsanzeige ohne sichtbares Label.** Ab 1280px zeigt die Anzeige sechs
kleine Punkte (8px) ohne sichtbaren Text — nur ein `title`-Tooltip bei Hover. Auf Mobile gibt es
dagegen den klaren Text „3 / 6 · Doppelt bestätigt". Funktioniert als reine Fortschritts-Textur,
trägt aber auf Desktop keine Orientierungs-Information bei, die ein Nutzer ohne Hover
mitbekommt. Geringe Priorität, da Desktop laut Neles Check ohnehin der Präsentations-, nicht der
Kampagnen-Fall ist.

**O3 — Kein Rückkehr-Signal im eingeloggten Hero.** Für beide Personas (Sven, Max) zeigt der
personalisierte Hero ausschließlich eine generische Begrüßung + Button-Menü, keine persönliche
Neuigkeit (offene Freigaben für Max als Team-Admin, nächstes Spiel, ungelesene
Benachrichtigungen). Das ist keine Dark-Pattern-Frage, sondern eine ehrliche Chance: ein Team-Admin
mit offenen Beitrittsanfragen hätte einen echten, nicht-manipulativen Grund wiederzukommen, wenn
er das im Hero sieht statt es suchen zu müssen. Vermutet, nicht gemessen — siehe Messvorschlag
unten. Diese Beobachtung geht als Zuarbeit an Lina (Onboarding-Flächen), da sie näher an
Wiedereinstiegs-Signalen arbeitet als an reiner Landing-Verständlichkeit.

**O4 — Kein Wachstums-/Aktivitäts-Signal für ausgeloggte Wiederkehrer.** Die Startseite zeigt
keine Zahl wie „schon X Spieler in NRW dabei" — der einzige Teil der Seite, der sich zwischen
zwei Besuchen tatsächlich ändert, ist der RSS-News-Block ganz unten (echte, datierte externe
News, selbst geprüft: aktuellste Meldung vom 11.08.). Der liegt aber weit unten, nach „So
funktioniert's" — vermutlich unterhalb dessen, was ein Scroll-müder Wiederkehrer erreicht. Kein
MUSS, weil eine erfundene Zahl ein Dark Pattern wäre und eine echte Zahl aktuell vermutlich klein
und wenig werbewirksam ist (Testphase) — nur als ehrlich validierbare Idee für später vermerkt.

---

## 7. Abgleich mit Mats' Hypothesen (H1–H7)

Die Landing-Page selbst ist kein Ort, an dem sich Wiederkehr-Verhalten messen lässt (dafür bräuchte
es eingeloggte Nutzungsdaten über Zeit) — entsprechend berühre ich nur die Hypothesen, die die
Landing-Page tatsächlich betrifft:

- **H2 (Stats als Zugpferd):** Szene 1 (Profil/Stats) steht bewusst an erster Stelle der
  Sechs-Szenen-Erzählung — das *Framing* der Seite stützt H2, ist aber kein Beleg für H2 selbst
  (dafür bräuchte es echte Bereichs-Besuchsdaten aus `/admin/analytics`, die ich hier nicht
  erhoben habe). **Status: nicht prüfbar mit diesem Auftrag, offen.**
- **H7 (Echte-Liga-Effekt):** Der `/ligen`-Check in Abschnitt 5 zeigt, dass die Seite den
  Unterschied zwischen „Beispieldaten" und „In Vorbereitung" bereits sauber kommuniziert — eine
  Voraussetzung dafür, dass H7 später überhaupt fair testbar wird (sonst wüssten Nutzer gar nicht,
  ob ihre Region „echt" oder „Demo" ist). **Status: weiterhin offen, aber die Datenehrlichkeit als
  Voraussetzung ist bestätigt.**
- Alle anderen Hypothesen (H1, H3–H6) betreffen Nutzungsverhalten nach dem Login bzw. über Zeit —
  außerhalb dessen, was ein Landing-Page-Verständnistest zeigen kann. Keine Aussage von mir dazu
  in diesem Bericht.

---

## 8. Kollegen einbezogen

- **Mats (Tandem, Pflicht):** Bedarfsanalyse als Grundlage der beiden Personas; H2/H7-Rückmeldung
  oben geht an ihn zurück.
- **Nele:** Befund S1 (Feedback-Button-Position) ist eine unabhängige Zweitbestätigung ihres
  Checks vom 11.08. — keine neue Erkenntnis, aber Bestätigung. Der Realitätsabgleich in Abschnitt
  5 knüpft an ihre 63/5-Liga-Zählung an und entlastet sie (keine neue Baustelle auf `/ligen`).
- **Lina (Onboarding):** O3 (fehlendes Rückkehr-Signal im eingeloggten Hero) geht als Zuarbeit an
  sie, da sie die Onboarding-/Wiedereinstiegs-Flächen verantwortet.
- **Ben (Analytics):** Kein neuer Auftrag — der Messvorschlag zu M1 ist bewusst kein
  Analytics-Event (Verständnis lässt sich über Klicks nicht messen), sondern eine Zusatzfrage im
  bestehenden Tester-Feedback-Gespräch. Bens vorhandene Infrastruktur (`trackEvent()`,
  `/api/analytics/track`) wäre aber die richtige Stelle, falls Patrick später doch
  Hero-CTA-Klicks oder Szenen-Sichtbarkeit tracken lassen möchte (bisher nicht instrumentiert,
  selbst im Code geprüft: nur Pageviews + Onboarding-Events existieren aktuell).
- **Vivien:** nicht neu beauftragt — M1 und S2 sind Beobachtungen aus Nutzersicht, keine
  Design-Entscheidung; die Umsetzung (falls gewünscht) liegt bei ihr/Patrick.
- **Tobias:** keine funktionalen Fehler gefunden, die an ihn zu übergeben wären — alles beobachtete
  Verhalten war das der Konzeption entsprechende Rendering, kein Absturz/keine Konsolenfehler
  aufgefallen (nicht systematisch geprüft, das ist sein Feld).

---

## 9. Annahmen, klar gekennzeichnet

- Die zwei Personas (Sven, Max) sind aus Mats' Gruppenbeschreibung abgeleitet, nicht aus einer
  benannten, belegten Persona-Doku (die es für Hoops anders als für HGH nicht gibt).
- Alle Aussagen darüber, wie ein *echter* Erstbesucher die Szenen vermutlich liest, sind
  Hypothesen (meine eigene, geschulte Nutzerbrille), keine gemessenen Daten — durchgehend mit
  Messvorschlag versehen, wo möglich.
- Die Ball-Animation-Messung (Abschnitt 4) bezieht sich auf den Referenz-Breakpoint 375×812 unter
  Chrome-Emulation; auf anderen Mobilgeräten/Browsern kann der genaue Scroll-Versatz leicht
  abweichen, die Größenordnung (kurzer Blitz, dann unverbundenes Korb-Emblem) halte ich für
  robust, weil sie aus der Code-Logik (`ballOpacityNearText`) folgt, nicht aus einem Zufallstreffer.
