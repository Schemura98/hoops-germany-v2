# Inspirations-Notiz: Newsfeed – der Feed selbst

**18.08.2026 · Skill `design-trend-recherche` · Stufe L (Voll-Sweep)**
Vorschlag dazu: `docs/NEWSFEED-ENTWURF-2026-08-18.md`

## Auftrag + Stufe

Patrick, 18.08.2026: *„ich finde den NewsFeed auch nicht sonderlich kreativ und neu
redesigned. recherchier nochmal nach modernen / nicht KI-generiert aussehenden Designs
die wirklich originell sind."*

**Stufe L**, weil Redesign einer Kernfläche mit Wow-Anspruch. Zusätzlich: Es ist die
**zweite** Runde mit demselben Wortlaut (15.08.: „keinen eigenen Charakter, sieht
KI-generiert aus"). Eine Wiederholung derselben Rückmeldung nach einem umgesetzten
Redesign ist selbst ein Befund und wird unten behandelt.

## Register vor Suche (Regel 2) — was übernommen wurde

Aus `INSPIRATION-NEWSFEED-DESKTOP-2026-08-15.md` und `-2026-08-13.md` **ohne erneute
Suche übernommen**:

- uxpatterns.dev, Aktivitäts-Feed: *„Do not hide critical next steps below large
  promotional modules."*
- amotdesign, Scoreboard-UI: *„What to show first, rather than what to cut"* —
  Hierarchie über Größenabstufung bei **gleichbleibender Position**.
- FuPa/kicker/ligaportal: In dieser Branche stehen **Daten vor Community**.
- **Negativbefund, weiter gültig:** Sorte A (Awwwards & Co.) ist für diese Aufgabe
  unergiebig — dort werden Auftritte prämiert, keine Gebrauchsflächen.

Neu gesucht wurde nur das **Delta**, das die vorigen Sweeps nicht abgedeckt haben: nicht
die Anordnung der Zonen (das war 15.08.), sondern **der Feed-Eintrag selbst** und die
**mobile** Nebenspalte.

## Suchschnitt

Gestaltung einzelner Feed-Einträge in einer Sport-Community, in der die Einträge
**inhaltlich sehr verschieden** sind (Ergebnis, Box-Score, Transfer, Tryout, Wortmeldung),
heute aber **alle gleich** aussehen. Zielgruppe Liga-Spieler NRW (Z1) und Team-Admins (Z2),
mobil ist Hauptfall.

---

## Was ich am Produkt gemessen habe (Grundlage, nicht Referenz)

Zum ersten Mal in dieser Sweep-Reihe **gesehen**, nicht nur gemessen: Playwright nimmt
Bildschirmfotos auf, `Read` stellt sie dar. Die Skill hielt das bisher für unmöglich —
das galt für `computer{screenshot}` in der Vorschaufläche, nicht für Playwright.
**Diese Grenze ist damit aufgehoben** (siehe Fortschreibung im Quellen-Register).

Gemessen auf 1440×900, angemeldet:

| Befund | Wert |
|---|---|
| Abgegrenzte Flächen im Newsfeed | **9** (nach dem 15.08.-Umbau; vorher 18) |
| Beiträge im Feed | 6 sichtbar, **alle formal identisch** |
| Textbreite je Beitrag | 700 px für Sätze um 40–60 Zeichen |
| Feed-Ränge | **1** — der Entwurf vom 15.08. sah **2** vor |
| Ergebnisse/Zahlen im Feed | **0** von 6 Beiträgen |
| Mobil: Kästen vor dem ersten Beitrag | **4** (Spiele, Vorschläge, Tabelle, News) |

**Der zentrale Befund:** Der Umbau vom 15.08. hat die **Ränder** der Seite gelöst (Tafel
oben, Schiene rechts) und die **Mitte** unberührt gelassen. Der Feed ist die größte Fläche
der Seite und der einzige Teil ohne Gestaltung. Mobil ist der Umbau gar nicht angekommen —
dort stehen weiterhin vier gleichförmige Kästen, und mobil ist der Hauptfall.

---

## Referenzen

| Quelle | Sorte | Was daran stark ist | Übernommen | Bewusst nicht |
|---|---|---|---|---|
| **Strava, „Activity Stats in the Feed"** (`support.strava.com/hc/en-us/articles/15422373796493`) | B | Der Feed-Eintrag zeigt **nicht immer dieselben Felder**, sondern die, die bei *diesem* Ereignis bemerkenswert sind — mit hartem Schwellenwert: *„For a running activity, the elevation will appear in place of pace/speed if the elevation gain is greater than 100ft per mile."* Dazu: *„There is no way to customize the stats"* — die Auswahl trifft das Produkt, nicht der Nutzer. Und eine Platzregel: Felder entfallen, wenn die vorherigen zu breit geraten. | **Das Kernprinzip des Entwurfs.** Ein Ergebnis-Beitrag zeigt den Punktestand, ein Box-Score die auffälligste eigene Zahl, ein Transfer die Stationen. Ebenso: Die Auswahl trifft das Produkt — keine Einstellmöglichkeit. | Die konkreten Schwellenwerte (Höhenmeter/Meile) — sportfremd. Und die Platzregel „Feld fällt weg, wenn es nicht passt": bei uns entscheidet die **Art** des Ereignisses, nicht der Zufall der Textlänge. |
| **NN/G, „Cards: UI-Component Definition"** (`nngroup.com/articles/cards-component`) | B | Der Satz, der die ganze Aufgabe umdreht: *„Card layouts typically deemphasize the ranking of content."* Und: *„When presenting very homogenous items … consider using a standard vertical list."* Dazu *„Cards take more space"* und *„Card layouts are less scannable than lists."* | Die **Diagnose**: Hoops zeigt heterogenen Inhalt in homogener Form — der schlechteste der drei Fälle. Karten sind laut NN/G genau für **heterogene** Inhalte richtig; die Antwort ist also nicht „mehr Karten", sondern **unterschiedliche Formen für unterschiedliche Ereignisse**. | „Card-Layout" als Optik (Kästen mit Schatten, Raster). Die Anzeigetafel-Sprache bleibt: Flächen und Haarlinien, keine schwebenden Kacheln. |
| **Mobile-Accordion-Praxis** (`poper.ai/blog/mobile-accordion-design`) | B | Benennt genau das mobile Muster von Hoops als Antipattern: der Aufklapp-Pfeil **oben rechts**, „two thumbs of stretch away from where any human actually holds a phone". Dazu die Regel: sekundäre Inhalte **eine Ebene tiefer**, nicht vor den primären. | Die mobile Neuordnung: Der Feed beginnt oben; Nebeninhalte kommen **nach** dem Einstieg bzw. in eine waagerechte Leiste. | Ein Schubladen-Menü („drawer") als Ersatz — die Quelle nennt selbst die schlechte Auffindbarkeit; unsere Nebeninhalte sind nicht Navigation. |
| **MDN — Container Queries** | C | Eine Komponente misst ihren **eigenen** Container statt des Fensters. | Empfehlung mit Einschränkung, unverändert aus dem 15.08.-Sweep: dieselbe Ergebniskarte funktioniert in Feed, Tafel und Schiene. | Kein Umbau des Bestands darauf. |

---

## Gegenprobe (Pflicht bei Stufe L)

### 1. Was machen in dieser Branche alle gleich?

**Social-Feeds** (das Muster, dem Hoops heute folgt): Avatar links, Name, Zeitangabe,
Fließtext, darunter Herz und Sprechblase — für **jeden** Eintrag identisch. Das ist die
Form, die eine KI erzeugt, wenn man „Newsfeed" sagt, und genau deshalb liest Patrick sie
als „KI-generiert". Es ist keine Frage von Farbe oder Schrift; es ist die **Gleichförmigkeit
bei ungleichem Inhalt**.

**Sport-Portale** (FuPa, kicker, ligaportal): stellen Daten voran, haben aber selten einen
Community-Feed — sie lösen das Problem, indem sie es vermeiden.

### 2. Was machen wir bewusst anders?

Der Feed-Eintrag beantwortet nicht „**wer** hat etwas geschrieben", sondern „**was ist
passiert — und ist es belegt**". Damit wird die Belegbarkeit, das einzige echte
Alleinstellungsmerkmal, vom Randvermerk zum Bauprinzip des Feeds.

Konkret abweichend vom Branchen-Einerlei:
- **Verschiedene Ereignisse sehen verschieden aus** (Strava-Prinzip), statt einer Einheitszeile.
- **Zahlen sind das Motiv**, nicht die Verzierung — in der Display-Schrift, groß, mit Beleg-Marke.
- **Der Verfasser tritt zurück.** Bei einem bestätigten Ergebnis ist die Quelle das Spiel,
  nicht die Person. Avatar und Name führen nur dort, wo jemand tatsächlich etwas *sagt*.

### 3. Was ist Mode, was ist Handwerk?

- **Handwerk (übernommen):** ereignisabhängige Feldauswahl · Hierarchie über Größe bei
  gleichbleibender Position · sekundäre Inhalte eine Ebene tiefer · Listen für Homogenes,
  Formen für Heterogenes.
- **Mode (verworfen):** Bento-Kachelmosaike (schon 15.08. verworfen, gilt weiter) ·
  Glassmorphism · animierte Zähler an jeder Zahl · KI-generierte Vorschaubilder.
  Alle stehen auf Viviens Ausschlussliste und werden durch Prämierung nicht zulässig.

---

## Umsetzbarkeit

Alles mit Bestand baubar: Tailwind, die vorhandenen Primitive, `lib/matchScore.js`
(`beidseitigBelegt()` als **einzige** Quelle für jede Aussage mit dem Wort „bestätigt"),
die Post-Typen aus `lib/recordTransfer.js` und den Auto-Posts. **Keine neue Abhängigkeit.**

## Nicht geprüft — ehrlich benannt

- **Kein Blick auf FuPa/kicker im laufenden Betrieb.** Beide blocken den automatischen
  Abruf (403, im Quellen-Register seit 15.08.). Die Branchenaussage stützt sich auf
  App-Store-Texte und Suchauszüge, nicht auf gesehene Oberflächen.
- **Sorte D (Video) weiterhin nicht verfügbar** — `ffmpeg`/`yt-dlp` fehlen. Es wurde kein
  Bewegtbild ausgewertet.
- **Keine Nutzerdaten.** Ob Ergebnisse im Feed tatsächlich häufiger gelesen werden als
  Wortmeldungen, ist **nicht gemessen** — das wäre Ronjas Feld und bräuchte eine Messung,
  keine Vermutung. Der Entwurf begründet sich aus der Produktpositionierung, nicht aus
  Nutzungszahlen.
- **Der mobile Entwurf ist nicht am Gerät geprüft**, nur an emulierten Größen.
