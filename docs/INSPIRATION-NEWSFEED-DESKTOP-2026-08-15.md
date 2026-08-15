# Inspirations-Notiz: Newsfeed Desktop

**Vivien (design-spezialistin) · 15.08.2026 · Skill `design-trend-recherche`**
Entwurf dazu: `docs/NEWSFEED-DESKTOP-2026-08-15.md`

## Auftrag + Stufe

Desktop-Ansicht des Newsfeeds neu denken, nachdem Patrick sie als
„KI-generiert, ohne eigenen Charakter" beurteilt hat.

**Stufe L (Voll-Sweep)** — nach Schritt 0 der Skill: Redesign einer Kernfläche
mit ausdrücklichem Wow-Anspruch. Die Vorgänger-Notiz vom 13.08.2026
(`INSPIRATION-NEWSFEED-2026-08-13.md`) lief als **M** und war für ihren Zweck
richtig; sie hat aber genau die Frage offengelassen, die jetzt trägt, und dort
auch benannt: *„Kein Blick auf konkurrierende Sport-Apps (FuPa u. a.) in diesem
Sweep — deren Feed-IA wäre ein sinnvoller Kandidat für den nächsten M-Sweep."*
Dieser Sweep holt genau dieses Delta nach. **Register vor Suche (Regel 2) hat
funktioniert:** Die uxpatterns-/getstream-Referenzen wurden nicht erneut
gesucht, sondern aus der Notiz vom 13.08. übernommen.

## Suchschnitt

Feed-Informationsarchitektur für eine Amateursport-Community, Zielgruppe
Liga-Spieler NRW (Z1) und Team-Admins (Z2), **Desktop** als Anlass, mobil bleibt
Hauptfall. Branchenschnitt bewusst zweigeteilt: Amateursport-Portale (die echte
Konkurrenz um Aufmerksamkeit) **und** allgemeine Social-Feeds (das Muster, dem
die Seite heute faktisch folgt).

---

## Referenzen

| Quelle | Sorte | Was daran stark ist | Übernommen | Bewusst nicht |
|---|---|---|---|---|
| **FuPa App-Store-Eintrag** (`apps.apple.com/de/app/fupa/id942371609`) | B | Die **Eigenwerbungs-Reihenfolge** ist die ehrlichste IA-Aussage, die man ohne Seitenzugriff bekommt: Liveticker → Live-Tabellen → Toralarm → Aufstellungen → Transfermarkt. Kein Social-Feed in der Aufzählung. | Der Befund, dass Ergebnis-Aktualität in dieser Branche vor Community steht — Grundlage für die Tafel als oberstes Element | Die Ticker-/Push-Logik selbst: Hoops hat keine Live-Erfassung, ein „Toralarm"-Äquivalent wäre eine Funktion, die es nicht gibt |
| **kicker.de** (Seitentitel „Spieltag - Tabelle - News - Statistiken") | B | Selbstgewählte Reihenfolge im Titel setzt Spieltag/Tabelle vor News | Bestätigung desselben Musters | Nichts — die Seite selbst war **nicht** abrufbar (403), nur das Titel-Fragment. Als Einzelbeleg zu dünn |
| **ligaportal.at** (Such-Zusammenfassung) | B | „Live-Ticker, Spielpläne, Tabellen, Spielberichte, …" — Daten vor redaktionellen Formaten | dritter Beleg desselben Musters | dito, nur Snippet |
| **Scoreboard-UI-Prinzipien**, amotdesign (`note.com/amotdesign/n/n5b8f495a7321`) | B | *„What to show first, rather than what to cut"* — Hierarchie über **Größenabstufung bei gleichbleibender Position**, nicht über Weglassen. Zweitens: Ein Statuswechsel darf nur den betroffenen Teilbereich verändern. | Beides. Erstes trägt die Tafel-Registerlogik (dieselbe Stelle, andere Größe). Zweites ist die Regel für die **Beleg-Marke**: Sie ändert nur ihr eigenes Segment, nicht die Kartenfarbe | Broadcast-Overlay-Optik (LED-Segmentschrift o. Ä.) — die Verwerfung von 12.08. gilt weiter |
| **MDN — CSS Container Queries** | C | Eine Komponente misst **ihren eigenen Container**, nicht den Viewport — dieselbe Ergebnis-Karte funktioniert in Tafel, Feed und Schiene | Als **Empfehlung mit Einschränkung** (§8.2 des Entwurfs): Tailwind 3.4.1 hat kein Container-Plugin, natives CSS in `globals.css` statt neuer Abhängigkeit | Kein Umbau bestehender Komponenten darauf — hier nur für die neuen Teile, sonst wird aus einer Aufräum-Chance ein Großprojekt |
| **MDN — CSS Subgrid** | C | Verschachtelte Karten erben Spurgrößen vom Elternraster — löst „Karte und Seitenleiste passen optisch nicht zusammen" | Für die Ausrichtung der Tafel-Register | Nicht für den Feed — dort ist eine Spalte, es gibt nichts auszurichten |
| **MDN — CSS Scroll-driven Animations** | C | Animation an Scroll-Fortschritt statt an JS-Listener, ohne Main-Thread-Last | **Nichts.** Bewusst geprüft und **verworfen** — Begründung unten | die gesamte Mechanik, auf dieser Seite |
| **SaaSFrame, Bento-Guide 2026** | B | *„Size = Visual Hierarchy"* — Kachelgröße codiert Priorität unabhängig von Position | Das Prinzip: Die Tafel ist wichtig, **weil** sie groß ist, nicht weil sie oben steht | Die dort genannten Zahlen (2,6× Verweildauer, 23 % schneller) — unbelegte Sekundärzitate des Artikels. **Nicht zitieren, nirgends.** Und die Bento-Optik als Ganzes: verspielte Kachelmosaike sind für eine tägliche Gebrauchsfläche Mode, nicht Handwerk |
| **Awwwards, Kategorie Sports** + Eintrag **OptaPro** (KOTA Websites) | A | OptaPro ist thematisch am nächsten (Sport-Analytics, B2B). Die Kategorie insgesamt: fast nur Marken-/Editorial-Seiten (F1-Teams, Ducati, Lacoste), Motion- und Story-Fokus | Nichts Konkretes | **Wichtiger Negativbefund:** In der gesamten prämierten Sportkategorie gibt es **kein** Community-/Scoreboard-Vorbild. Für diese Aufgabe ist Sorte A weitgehend unergiebig — wie schon beim Bewerbungs-Sweep vom 12.08. |

---

## Gegenprobe (Pflicht bei Stufe L)

### 1. Was machen in dieser Branche alle gleich?

**Die Rangfolge Ergebnis → Tabelle → Statistik → News/Community.** Bei allen vier
einsehbaren Beschreibungen (FuPa, kicker, ligaportal, MaxPreps) identisch. Keine
beschreibt einen Social-Feed als beherrschendes Startseiten-Element.

**Der eigentliche Ertrag dieses Sweeps ist aber ein anderer, und er war nicht
erwartet:** Die Gegenprobe sollte zeigen, wovon wir uns absetzen. Sie hat
stattdessen gezeigt, dass Hoops sich **bereits abgesetzt hat — in die falsche
Richtung.** Der heutige Newsfeed folgt dem Muster allgemeiner Social-Plattformen
(Beiträge mittig, Daten am Rand), nicht dem der Sportbranche. Genau daher rührt
der „austauschbar"-Eindruck: Die Seite ist austauschbar, nur mit LinkedIn statt
mit FuPa.

**Was wir bewusst anders machen:** *keins von beidem.* Ein reines Ergebnisportal
wäre FuPa mit weniger Daten; ein reiner Social-Feed ist der Status quo. Der
Unterschied ist die **Bindung von Zahl an Person plus Beleg** — die Beleg-Marke
ist deshalb kein Zierrat, sondern der einzige Punkt, an dem sich beide Muster
nicht kopieren lassen.

### 2. Was davon ist Mode, was ist Handwerk?

| | Urteil |
|---|---|
| Größenabstufung statt Weglassen (Scoreboard-Prinzip) | **Handwerk** — übernommen |
| Container Queries / Subgrid | **Handwerk** — übernommen, mit Einschränkung |
| Ergebnis-Priorität vor Community | **Handwerk** — übernommen als Argument für die Tafel |
| Bento-Kachelmosaik | **Mode** — Prinzip („Größe = Hierarchie") übernommen, Optik nicht |
| Scroll-gesteuerte Animation | **Mode an dieser Stelle** — verworfen, s. u. |

**Die eine bewusste Absage, die begründet gehört:** Mein Auftrag führt
scroll-gesteuerte Gestaltung als Kernrepertoire, und die Technik ist geprüft und
verfügbar. Trotzdem hier **nein**. Eine tägliche Gebrauchsfläche ist das Gegenteil
einer Landingpage: Was beim ersten Besuch beeindruckt, ist beim dreißigsten eine
Bremse. Bewegung heißt hier **Ankunft** (etwas Neues meldet sich an), nie
**Reise** (Inhalt an Scrollfortschritt gekoppelt). Auf der Startseite gilt das
Gegenteil weiter.

### 3. Gegen Viviens Ausschlussliste geprüft

Keine violett-blauen Verläufe, kein Neon-Glow, kein Glassmorphism, keine
Deko-Partikel, keine 3D-Blobs, keine Emoji als Gestaltung. Der Entwurf
**entfernt** Flächen, statt welche hinzuzufügen. Kein Fund dieses Sweeps landet
auf der Liste.

---

## Umsetzbarkeit

Ohne neues Werkzeug und ohne neue npm-Abhängigkeit. Vorhanden und
wiederverwendet: `SplitFlap`, `CountUp`, `Reveal`, `staffel()`, `Card`,
`matchVerification`, `teamScores`. Einzige technische Neuerung wären native
Container Queries als CSS in `app/globals.css` — die Datei führt bereits eigenes,
kommentiertes CSS.

---

## Nicht geprüft / Grenzen (ehrlich)

- **Keine der Wettbewerbsseiten war direkt abrufbar.** `fupa.net` (Abruf
  gescheitert), `maxpreps.com` (403), `kicker.de` (403), `ligaportal.at` (nur
  Snippet). Das Branchenmuster stützt sich auf **Selbstbeschreibungen**
  (App-Store-Text, Seitentitel, Suchzusammenfassungen), nicht auf gesehene
  Oberflächen. Für die Frage „welche Rangfolge hält der Betreiber selbst für
  seinen Verkaufsgrund" ist das brauchbar; für „wie sieht es aus" ist es
  **kein** Beleg.
- **Kein Beleg für die naheliegende These**, dass Amateursport-Nutzer primär
  wegen Ergebnissen kommen. Gesucht und **nicht gefunden**. Die FanQ-Studie
  „Amateursport in der Krise?" wurde angelesen und behandelt
  Vereins-Herausforderungen, nicht App-Nutzung. Die These bleibt **[INDIZ]** aus
  den Selbstbeschreibungen, nicht [BELEGT]. Im Entwurf entsprechend vorsichtig
  formuliert.
- **`siteinspire.com` mit Sport-Filter: abgerufen, aber leer** — keine Treffer
  zurückgeliefert (evtl. ungültiger Filterparameter). Also geprüft, nicht
  übersprungen.
- **soccerwatch/AISCOUT und Hudl** in dieser Runde nicht bzw. nur oberflächlich
  geprüft. Hudl ist ohnehin Video-Analyse für Trainer, thematisch entfernt.
- **Sorte D (Video) nicht genutzt** — es lag kein Referenzvideo vor.
- **Eigene Aufnahmen dagegen belegt:** Der Ist-Zustand wurde per
  Playwright/Chromium bei 390/1280/1600/1728 px aufgenommen und **angesehen**,
  nicht nur gemessen. Aussagen über die *heutige* Seite sind damit belegt;
  Aussagen über die *entworfene* Seite sind es naturgemäß nicht.

---

## Fortschreibung

`quellen-register.md` und `referenz-register.md` sind mit diesem Sweep
aktualisiert (neue Sorte-B-/C-Quellen, drei 403-Befunde, Branchenzeile
Sport-Community).
