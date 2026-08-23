# Team-Admin-Tour „Der Spielberichtsbogen" — Konzept

> **Konzept-Dokument, kein Code. Nele (marketing-manager), 23.08.2026, Auftrag Patrick.**
>
> Auftrag wörtlich sinngemäß: „Eine interaktive Tour, die einem Team-Admin zeigt, was er
> alles machen kann und was seine Aufgaben sind. Die Aufgaben sollen kleinen Aufwand
> suggerieren, damit er nicht abgeschreckt ist. Und ihm soll nahegelegt werden, dass er
> das Ganze als Live-Punktezähler nutzen kann — oder es einfach im Anschluss kurz
> eintippt, damit das Ergebnis live geht und die Spieler ihre Stats erhalten."
>
> Zielgruppe: **Z2 (Team-Admins, Trainer, Ehrenamt)** aus `docs/ZIELGRUPPEN.md`.
> Deren Kernsatz trägt jedes Wort dieser Tour: *„Aufwand zuerst und ehrlich benennen
> (‚dauert zwei Minuten'), nie ‚mächtiges Verwaltungstool'. Nutzen fürs Team
> formulieren, nicht für die Plattform."* Und die belegte FuPa-Lektion:
> **Sichtbarkeit ist der Motor der Datenpflege** — Vereine pflegen freiwillig,
> wenn sie dafür gesehen werden.
>
> Vorbild-Mechanik: `components/onboarding/WelcomeTour.js` + `TourSteps.js`
> (Spieler-Tour). Der ANONYM-Speicherausgang entfällt hier — `/team/admin`
> verlangt Login, die Tour läuft immer für ein Konto.

---

## 0. Faktenbasis — am Code verifiziert, 23.08.2026

Jede Produktaussage der Wortlaute unten hängt an einer dieser Zeilen
(Muster `docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md` — nichts versprechen,
was das Produkt nicht hält):

| Aussage | Beleg |
|---|---|
| Panel hat 6 Reiter: Kader, Anfragen, Spielplan, Ergebnisse, Tryouts, Einstellungen | `app/team/admin/page.js:29` (`TABS`) |
| Aufgaben-Leiste zählt offene Posten und sagt auch „nichts offen" explizit | `components/team/AufgabenLeiste.js`, `lib/useTeamAufgaben.js` |
| Ergebnis-Meldung = zwei Zahlenfelder (Eigene Punkte, Gegner-Punkte) + Einreichen | `ErgebnisseTab.js` ~Z. 388–437 |
| Stimmen beide Meldungen überein → Etikett **„Bestätigt"** (Quelle `beidseitigBelegt()`); ein vom Hoops-Team gesetztes Ergebnis heißt „Ergebnis steht" | `ErgebnisseTab.js:336`, `lib/matchScore.js` |
| Statistik-Editor (PKT/AST/REB je Spieler) ist **ab Spielbeginn** offen und **jederzeit** speicherbar | `ErgebnisseTab.js:266` („Spieler-Statistiken kannst du jederzeit erfassen"), `:291` (`isOver`-Schwelle = Spieldatum erreicht) |
| Vor abgeschlossenem Spiel wird **keine** Benachrichtigung versendet — Zwischenspeichern ist gefahrlos | `lib/statsNotify.js:60` (`if (match.status !== "completed") return 0`) |
| Nach der Ergebnismeldung wird der Versand **nachgeholt** — der Punktezettel-Weg endet also nicht ohne die Nachricht | `app/api/team/submit-match-result/route.js:261` ruft `notifyOwnStats` ebenfalls |
| Benachrichtigt wird **genau einmal je Spieler und Spiel**, nur Spieler **mit eigenem Konto** und mit mindestens einem Wert; bei Widerspruch (mismatch) gar nichts | `lib/statsNotify.js`, Regeln 1–4 im Dateikopf |
| Der Admin sieht nach dem Speichern „Statistiken gespeichert – N Spieler wurden über die eigenen Zahlen benachrichtigt" (nur die echte Erst-Versand-Zahl) | `ErgebnisseTab.js:234–242` |
| Drei Einladewege: Suche bestehender Konten (schnellster), persönlicher Platz-Link, allgemeiner Team-Link | CLAUDE.md Feature-Stand „Teams" |
| Tryout-Ausschreibung erscheint öffentlich auf `/tryouts` | CLAUDE.md Feature-Stand „Scouting" |
| Es gibt KEINEN Live-Ticker und KEINE Zwischenstands-Anzeige für andere (bewusste Entscheidung) | `docs/BEDARFSANALYSE-2026-08-09.md`, „wird NICHT gebraucht"-Liste |
| Tab-Deeplink `?tab=` existiert bereits | `app/team/admin/page.js:65` |

⚠️ **Eine Stelle, an der ich beim Bau exakt zitiert haben will statt aus dem
Gedächtnis:** Der genaue Wortlaut der Spieler-Benachrichtigung steht in
`lib/statsNotify.js` (Kurzname im Projekt: „Deine Zahlen stehen"). Wenn die Tour
die Nachricht wörtlich zitiert, muss das Zitat beim Bau gegen die Datei gehalten
werden — nicht gegen dieses Konzept.

---

## 1. Mechanik-Empfehlung: Dialog-Folien mit Zitat-Karten, KEINE Spotlights

**Empfohlen: dieselbe Folien-Mechanik wie die Spieler-Tour** (Overlay-Dialog,
Weiter/Zurück/Überspringen, Segmentleiste, Escape, Fokusfalle, Scroll-Sperre über
`lib/scrollSperre.js`) — je Schritt zeigt die Folie eine **Miniatur des echten
Bauteils als Zitat-Karte**, so wie `StepFeed` heute die Ergebnis-Karte des Feeds
zitiert und `AvatarZitat` den Avatar der Leiste. Wo es sinnvoll ist, trägt die
Folie zusätzlich einen **„Zeig mir das"-Link auf den echten Reiter**
(`?tab=ergebnisse` — der Deeplink-Mechanismus existiert), der die Tour schließt
und hinführt. Das macht sie interaktiv, ohne einen Spotlight-Apparat zu bauen.

Warum keine Coach-Marks/Spotlights über den echten Elementen:

1. **Die Entscheidung ist im Projekt schon einmal gefallen** (Lina, 14.08.2026,
   Kommentar in `TourSteps.js`): eine neue Overlay-Mechanik ist teuer, und die
   Plattform hat gerade erst eine schwebende Ebene abgeschafft. Das Zitat-Muster
   ist die erprobte Alternative — „Wer sie hier sieht, erkennt sie oben wieder."
2. **Die Ziel-Elemente laden asynchron.** Aufgaben-Leiste und Spiele-Liste stehen
   beim Seitenaufbau erst als Skeleton bzw. gar nicht (bei `status: "error"`
   rendert die Leiste nichts). Ein Spotlight auf ein Element, das noch nicht oder
   nie da ist, ist genau die Fehlerklasse, die dieses Projekt dreimal teuer
   bezahlt hat. Eine Zitat-Karte ist immer da.
3. **Mobil zuerst:** Auf 360 px liegt die Tab-Leiste unter der Aufgaben-Leiste im
   Scroll — ein Spotlight müsste scrollen, klemmen, nachmessen. Der Dialog von
   unten (Bogenfläche, Daumenreichweite) ist gelöst und abgenommen.

Wer Spotlights trotzdem will, entscheidet das bewusst als eigenen Auftrag mit
eigenem Test-Budget — dieses Konzept ist auf die Folien-Mechanik geschrieben.

---

## 2. Die Schrittfolge — 6 Schritte

**Dramaturgie in einem Satz:** Erst „so wenig ist es wirklich" (die Leiste sagt
dir, was ansteht — oft nichts), dann die zwei Kernmomente (Ergebnis in unter
einer Minute; Box-Score → deine Spieler bekommen ihre Zahlen), dann der
Punktezettel-Tipp als KANN, dann Kader/Tryouts als „wenn du willst", dann Schluss.

Titel folgen der Sprache der bestehenden Tour (kurz, behauptend, uppercase-fähig).
Texte: Du-Ansprache, max. ~46ch-freundlich, kein Wort, das das Produkt nicht hält.

---

### Schritt 1 · „Dein Überblick" — die Aufgaben-Leiste

- **Ziel-Element/Reiter:** Aufgaben-Leiste oben im Panel (`AufgabenLeiste.js`).
  Zitat-Karte: eine Miniatur der Leiste mit einem Beispiel-Posten
  („1 · Ergebnis fehlt") und daneben dem Leerzustand — beide gekennzeichnet als
  „Beispiel" (dieselbe Regel wie `StepFeed`: erfundene Inhalte tragen das Band).
- **Überschrift:** `Ein Blick statt sechs Reiter`
- **Text (final):**
  > Diese Leiste oben zählt, was gerade ansteht — eine Beitrittsanfrage, ein
  > fehlendes Ergebnis. Ein Tipp darauf bringt dich direkt hin. Und steht da
  > nichts an, ist wirklich nichts zu tun. Du musst hier nicht regelmäßig
  > vorbeischauen — die Leiste wartet auf dich, nicht umgekehrt.
- **Warum dieser Schritt (Aufwands-Botschaft):** Der erste Satz der Tour nimmt
  die größte Z2-Angst — „noch ein Tool, das ich pflegen muss". Die Leiste ist
  der Beweis, dass das Panel dem Admin die Suche abnimmt statt sie ihm
  aufzuerlegen. „Oft nichts" ist hier keine Floskel: Die Leiste sagt den
  Leerzustand ausdrücklich (Ronjas R3-Bau). Der Schlusssatz („wartet auf dich,
  nicht umgekehrt") ist die Anti-Drohkulisse in einem Bild.

---

### Schritt 2 · „Nach dem Spiel" — das Ergebnis

- **Ziel-Element/Reiter:** Reiter **Ergebnisse**. Zitat-Karte: die zwei
  Zahlenfelder `Eigene Punkte : Gegner-Punkte` mit Einreichen-Knopf als
  Miniatur; darunter die Statuszeile „Bestätigt" mit gefüllter Beleg-Lampe —
  Band „Beispiel". Optional: „Zeig mir das"-Link auf `?tab=ergebnisse`.
- **Überschrift:** `Ein Ergebnis: zwei Zahlen`
- **Text (final):**
  > Eure Punkte, Gegner-Punkte, Einreichen — das ist die ganze Meldung, sie
  > dauert keine Minute. Der Gegner meldet unabhängig; sagen beide dasselbe,
  > steht das Spiel als „Bestätigt" da. Ein Ergebnis, das hinterher niemand
  > bestreitet — dafür brauchte es nur deine zwei Zahlen.
- **Warum dieser Schritt:** Das ist die eine Aufgabe, die wirklich wiederkehrt —
  und sie ist ehrlich klein (zwei `<input type="number">`, gemessen am Code).
  „Dauert keine Minute" ist die vom Auftrag ausdrücklich erlaubte, ehrliche
  Aufwandszusage. Der letzte Satz koppelt den kleinen Aufwand an den großen
  Ertrag (Kernpositionierung Belegbarkeit) — wörtlich die Z2-Motivation aus
  `docs/ZIELGRUPPEN.md`: „ein Ergebnis, das hinterher niemand bestreitet".
  ⚠️ Bewusst NICHT: „eure Zahlen glauben" — doppelt bestätigt ist das
  **Ergebnis**, nicht der Box-Score. Genau dieser Fehler war in der Spieler-Tour
  der teuerste Korrekturfall (14.08.2026, Kommentar in `WelcomeTour.js`).

---

### Schritt 3 · „Der beste Moment" — der Box-Score

- **Ziel-Element/Reiter:** Aufklapper „Spieler-Statistiken erfassen" im
  Ergebnisse-Reiter. Zitat-Karte: zwei Zeilen der PKT/AST/REB-Tabelle als
  Miniatur, darunter die grüne Erfolgszeile „Statistiken gespeichert – 8 Spieler
  wurden über die eigenen Zahlen benachrichtigt." — Band „Beispiel".
- **Überschrift:** `Deine Spieler bekommen ihre Zahlen`
- **Text (final):**
  > Punkte, Assists, Rebounds — eine Tabelle, du füllst nur aus, was einer
  > gemacht hat. Sobald das Ergebnis eingetragen ist, bekommt jeder erfasste
  > Spieler mit eigenem Konto automatisch die Nachricht, dass seine Zahlen
  > stehen — und du siehst, wie viele es waren. Zehn Minuten von dir, und das
  > ganze Team hat etwas davon.
- **Warum dieser Schritt:** Das ist der Belohnungsmoment, den die Tour verkaufen
  soll — und er ist echt gebaut: automatischer Versand (`statsNotify`),
  Erfolgsmeldung mit echter Erst-Versand-Zahl (`ErgebnisseTab:234`). Die
  FuPa-Lektion (Sichtbarkeit als Motor) wird hier eingelöst, ohne sie zu
  benennen: Der Admin ist der, der sein Team glücklich macht.
  ⚠️ **„mit eigenem Konto" steht bewusst im Text:** Slot-Spieler ohne Account
  bekommen nichts (`statsNotify` Regel 1). Ohne den Einschub verspräche die Tour
  eine Nachricht an Leute, die keine bekommen können — und der Einschub arbeitet
  sogar für uns: Er ist das leise Argument, den Kader über echte Konten
  aufzubauen (Schritt 5 nimmt den Faden auf).
  ⚠️ „Zehn Minuten" ist eine ehrliche Schätzung für einen vollen Box-Score,
  keine gemessene Zahl — wenn Patrick sie zu hoch oder zu niedrig findet,
  entscheidet er; eine konkrete kleine Zahl schlägt hier ein vages „schnell".

---

### Schritt 4 · „Wenn du magst" — der Punktezettel

- **Ziel-Element/Reiter:** derselbe Statistik-Editor; keine neue Fläche.
  Zitat-Karte: keine — dieser Schritt ist reiner Text, damit das KANN nicht wie
  eine dritte Pflichtfläche aussieht.
- **Überschrift:** `Dein Punktezettel am Spielfeldrand`
- **Text (final):**
  > Die Statistik-Tabelle ist ab Spielbeginn offen und speichert jederzeit —
  > du kannst also direkt hier mittippen, statt einen Zettel zu führen und ihn
  > später zu übertragen. An deine Spieler geht dabei nichts raus: Die
  > Nachricht kommt erst, wenn das Ergebnis eingetragen ist. Und genauso gut
  > trägst du alles nach dem Spiel in Ruhe ein — beides ist richtig.
- **Warum dieser Schritt:** Patricks „Live-Punktezähler"-Idee, in der ehrlichen
  Fassung: Der Editor **ist** ab Spielbeginn nutzbar (`isOver`-Schwelle) und
  Zwischenspeichern löst nachweislich keinen Versand aus
  (`statsNotify.js:60`) — der Tipp erspart die Doppelerfassung Zettel→Plattform,
  also genau das Z2-Ausschlusskriterium. Der Schlusssatz macht das KANN
  unmissverständlich: Wer nach dem Spiel einträgt, macht nichts falsch. Kein
  Wort über Ticker, Zuschauer oder Zwischenstände (siehe Abschnitt 5).
  ⚠️ Bewusst keine Offline-Zusage („funktioniert auch ohne Netz") — Roadmap 17
  ist nicht gebaut, und Hallen haben Funklöcher. Der Text verspricht nur
  „speichert jederzeit", nicht „speichert überall".

---

### Schritt 5 · „Dein Team" — Kader, Anfragen, Tryouts

- **Ziel-Element/Reiter:** Reiter **Kader** (mit einem Satz zu **Anfragen** und
  **Tryouts**). Zitat-Karte: die drei Einladewege als schlichte Dreizeilen-Liste
  (Suche · Platz-Link · Team-Link), kein Formular-Nachbau.
- **Überschrift:** `Einladen ohne Zettelwirtschaft`
- **Text (final):**
  > Drei Wege in deinen Kader: Wer schon ein Konto hat, ist über die Suche in
  > Sekunden drin. Sonst schickst du einen persönlichen Platz-Link — oder den
  > Team-Link einmal in die Mannschaftsgruppe. Meldet sich jemand von selbst,
  > wartet das unter „Anfragen", du gibst nur frei. Und je mehr deiner Spieler
  > ein eigenes Konto haben, desto mehr bekommen nach jedem Spiel ihre Zahlen.
- **Warum dieser Schritt:** Kader-Aufbau ist die einzige Einmal-Arbeit mit
  spürbarem Umfang — deshalb steht er hinten (erst der Ertrag, dann die
  Investition) und ist als „drei Wege, alle klein" gerahmt. „Einmal in die
  Mannschaftsgruppe" ist die WhatsApp-first-Ansprache aus `docs/ZIELGRUPPEN.md`,
  ohne eine App zu nennen. Der Schlusssatz verzahnt den Schritt mit dem
  Belohnungsmoment aus Schritt 3 — Kaderpflege bekommt einen Grund, der dem
  Team nützt, nicht der Plattform.
  **Tryouts** stehen bewusst NICHT im Fließtext, sondern als optionale
  Fußzeile der Folie (eine Zeile, gedämpfte Farbe):
  > Ihr sucht Verstärkung? Unter „Tryouts" ist ein Probetraining schnell
  > ausgeschrieben — es erscheint öffentlich auf der Tryouts-Seite.
  So ist die Funktion genannt (Auftrag: „wenn du willst"), ohne die
  Kernbotschaft des Schritts zu verwässern.

---

### Schritt 6 · „Das war's" — der Schluss

- **Ziel-Element/Reiter:** keiner. Abschlussfolie.
- **Überschrift:** `Mehr ist es nicht`
- **Text (final):**
  > Ergebnis melden, wenn eins ansteht — den Rest sagt dir die Leiste oben.
  > Diese Tour findest du jederzeit wieder, unten im Panel.
- **Knöpfe:** Primär `Zum Panel` (schließt die Tour, `completed=true`).
  Sekundär (Ghost) `Nochmal von vorn` — bewusst KEIN Deep-Link auf einen
  bestimmten Reiter: Welcher Reiter dran ist, sagt die Aufgaben-Leiste; ein
  fester Link würde ihr widersprechen, wenn dort etwas anderes offen steht.
- **Warum dieser Schritt:** Die Schlussfolie wiederholt die Aufwands-These der
  Tour in zwei Sätzen und übergibt an die Fläche, die ab jetzt führt (die
  Leiste) — dieselbe Übergabe-Idee wie die Spieler-Tour mit ihrer Checkliste,
  nur ohne Fortschrittsbalken: Ein Team-Admin hat hier keine „Startschritte"
  abzuarbeiten, und eine Prozentzahl würde genau die Pflichtenliste erfinden,
  die die Tour vermeiden soll.

---

## 3. Auslöse-Logik — Empfehlung

**Merkfeld:** `Player.adminTourSeen` (Boolean, default `false`) — **am Player,
nicht am Team.** Begründung: Die Tour gehört der Person, nicht dem Verein.
Co-Admins (erkennbar an `teamAdminOf`, dasselbe Feld für Haupt- wie Co-Admin —
geklärt 23.08.2026) sollen sie ebenso sehen; ein Team-Feld würde sie nur dem
ersten zeigen. Speicher-Route analog `mark-welcome-seen`
(z. B. `POST /api/player/mark-admin-tour-seen`), Fehler beim Speichern werden
wie dort verschluckt — die Tour käme schlimmstenfalls noch einmal, das ist der
billigere Fehler.

**Start:** Beim Aufruf von `/team/admin`, wenn (a) der Besucher als Team-Admin
authentifiziert ist, (b) `adminTourSeen` nicht gesetzt ist und (c) die Seite
ihren Grundzustand geladen hat (`useCurrentTeam` ready) — nicht früher, sonst
öffnet sich der Dialog über einem Skeleton. **Nicht** direkt nach der
Teamgründung auf `/team/create` starten: Die Tour erklärt Flächen, die es nur
auf `/team/admin` gibt, und die Gründung endet ohnehin dort.

⚠️ **Vorrang-Regel gegen Dialog-Stapel:** Ein frisch registrierter Gründer kann
`welcomeSeen: false` UND `adminTourSeen: false` tragen — dann würden zwei Touren
gleichzeitig aufgehen (die WelcomeTour startet routenunabhängig aus dem
Root-Layout). Regel: **Die Spieler-Tour hat Vorrang; die Admin-Tour startet in
dieser Sitzung nicht automatisch**, sondern beim nächsten `/team/admin`-Besuch
(oder über den Wiederaufruf-Link). Zwei gestapelte Modals wären außerdem ein
neuer Fall für `lib/scrollSperre.js` — vermeiden statt verwalten.

**Bestands-Admins:** `adminTourSeen` ist bei ihnen ebenfalls ungesetzt — sie
bekommen die Tour beim nächsten Besuch genau einmal. Empfehlung: so lassen
(Aufgaben-Leiste und Benachrichtigt-Zähler sind jung, die Tour erklärt ihnen
Neues). Auf `hoops_prod` betrifft das nach dem Seed-Riegel nur eine Handvoll
echter Admins. **Entscheidung liegt bei Patrick** — wer sie Bestands-Admins
ersparen will, setzt das Feld einmalig per Skript.

**Wiederaufruf:** Ein unaufdringlicher Link im Panel selbst, unterhalb der
Tab-Inhalte (Muster des Footer-`TourLink`, eigenes Event
`hg:open-admin-tour`). **Nicht** den bestehenden Footer-Link mitbenutzen — der
öffnet die Spieler-Tour, und ein Link, der je nach Rolle etwas anderes öffnet,
ist eine Falle. Beschriftung: „Kurz erklärt: deine Aufgaben als Team-Admin".

---

## 4. Ton — die drei Regeln dieser Tour

1. **Respekt vor der Zeit ist DAS Argument.** Jeder Schritt nennt den Aufwand
   zuerst und ehrlich („zwei Zahlen", „keine Minute", „eine Tabelle") und den
   Ertrag fürs Team danach. Nie umgekehrt, nie „mächtig", nie „einfach mal
   ausprobieren".
2. **Nutzen fürs Team, nicht für die Plattform.** Kein Satz endet auf „…damit
   die Plattform wächst". Die Belohnung heißt: dein Team wird gesehen, deine
   Spieler bekommen ihre Zahlen, dein Ergebnis bestreitet niemand.
3. **KANN heißt KANN.** Der Punktezettel und die Tryouts sind Angebote. Die Tour
   sagt bei beiden ausdrücklich, dass der andere Weg genauso richtig ist. Eine
   Tour, die Ehrenamtlichen neue Pflichten vorliest, produziert genau die
   Abschreckung, gegen die sie gebaut wird.

---

## 5. Was die Tour bewusst NICHT sagt

- **„Live-Ticker", „Live-Punktezähler", „andere sehen den Zwischenstand".**
  Es gibt keinen Ticker und keine Zwischenstands-Anzeige für Dritte — bewusste
  Bedarfsanalyse-Entscheidung. Die wahre Fassung ist der Punktezettel-Schritt:
  ein Erfassungswerkzeug für den Admin selbst. Auch das Wort „live" bleibt
  draußen — es weckt genau die falsche Erwartung.
- **Keine Offline-Zusage.** Roadmap 17 (Erfassung mit Offline-Puffer) ist nicht
  gebaut. „Speichert jederzeit" ja, „funktioniert im Funkloch" nein.
- **Keine Pflichten-Drohkulisse.** Kein „du musst", kein „sonst", keine Fristen,
  keine rote Dringlichkeit. Auch die Aufgaben-Leiste wird als Entlastung
  erzählt, nicht als To-do-Diktat.
- **Keine Nutzer- oder Reichweitenzahlen.** Nutzerzahlen sind für außen gesperrt
  (Seed-Anteil); eine Tour, die „viele Spieler warten schon" behauptet, wäre ein
  Fall für Nora (§ 5 UWG) und für MUSTER-ZAHLEN-DIE-LUEGEN.
- **Kein „ersetzt TeamSL".** Die Verbands-Erfassung bleibt für Z2 verpflichtend;
  jede Hoops-Eingabe ist heute ehrlich eine zweite. Die Tour verkleinert diese
  zweite Eingabe („zwei Zahlen", Punktezettel statt Zettel) — sie darf nicht
  behaupten, die erste falle weg.
- **Kein Benachrichtigungs-Versprechen an Spieler ohne Konto** — deshalb der
  Einschub „mit eigenem Konto" in Schritt 3.
- **Kein „doppelt bestätigte Zahlen".** Doppelt bestätigt ist das ERGEBNIS
  (`teamAResult`/`teamBResult`); der Box-Score kommt von einem Admin. Der
  teuerste Textfehler der Spieler-Tour wird hier nicht wiederholt.

---

## 6. Übergabepunkte

- **Analytics:** eigene Ereignisnamen nach dem bestehenden Muster —
  `admin_tour_step` / `admin_tour_completed` / `admin_tour_skipped` (Abbruch
  trägt den Schritt-Key als Zusatzfeld, wie in `WelcomeTour.js`). **Nicht** die
  `tour_*`-Namen der Spieler-Tour mitbenutzen: zwei Touren in einer Abbruchkurve
  sind zwei Gruppen in einer Zahl. Versand über `lib/trackEvent.js`, das seit
  Roadmap 39 zentral über `lib/analyticsClient.js` läuft (webdriver-Riegel
  inklusive — Suite-Läufe vergiften die Kurve nicht).
- **Feedback:** Der Chip „Onboarding / Einstieg" in `app/feedback/page.js`
  (`AREAS`) deckt die Tour ab — kein neuer Chip nötig. Beim Bau die Skill
  `update-feedback-analytics` trotzdem durchgehen (Analytics-Bündelung der
  neuen Ereignisse).
- **Onboarding-Flächen:** Beim Bau die Skill `update-onboarding-surfaces`
  ausführen; danach **Lina-Check** (onboarding-referentin) mit ihrer einen
  Frage: Findet ein Admin, der die Tour weggeklickt hat, den Wiederaufruf-Link —
  und stolpert der Vorrang-Fall (frischer Gründer, zwei Touren) sauber?
- **Gates:** Wie jede nutzersichtbare Änderung — Kai (Tests: Auto-Start-Wächter
  analog `hg_welcome_token`; ⚠️ die Suite muss `adminTourSeen` auf den
  Dev-Testkonten bedenken, dieselbe Falle wie Tobias' `welcomeSeen`-Vermerk vom
  22.08.) und Tobias (Browser, mobil zuerst).
- **Wortlaut-Quelle:** Dieses Dokument liefert die finalen Texte. Weicht beim
  Bau etwas ab (Platz, Zeilenfall), entscheidet der Text am gebauten Stück —
  aber jede inhaltliche Abweichung (neue Zusage, neue Zahl) geht vor dem Deploy
  zurück an mich für den Zielgruppen-Check.

---

## 7. Offene Fragen an Patrick

1. **Bestands-Admins:** Tour beim nächsten Besuch einmal zeigen (Empfehlung)
   oder per Skript für sie stummschalten?
2. **„Zehn Minuten" in Schritt 3:** Trägt die Schätzung für einen vollen
   Box-Score aus deiner/Jonatans Praxis? Wenn nicht, nenne die ehrliche Zahl —
   eine konkrete kleine Zahl schlägt ein vages „schnell", aber nur, wenn sie
   stimmt.
3. **Tryout-Fußzeile in Schritt 5:** reicht dir die eine Zeile, oder soll
   Tryouts einen eigenen (siebten) Schritt bekommen? Meine Empfehlung: die
   Zeile — jede zusätzliche Folie bezahlt die Aufwands-Botschaft der ganzen Tour.

---

## Perspektiv-Check (Zielgruppen-Instanz, Pflicht vor Abgabe)

*Ein ehrenamtlicher Trainer, 35, verwaltet sein Team abends am Handy, hat die
TeamSL-Pflicht schon hinter sich und öffnet /team/admin zum zweiten Mal:*
Schritt 1 sagt ihm, dass er nichts suchen muss — das ist die Antwort auf seine
eigentliche Frage („was kommt da auf mich zu?"). Schritt 2/3 nennen Aufwand in
Zahlen, die er nachprüfen kann, und der Benachrichtigt-Moment ist der erste
Grund, das Ding nicht nur zu dulden, sondern zu mögen. Der Punktezettel ist für
ihn plausibel, WEIL dabei nichts rausgeht — ein Trainer will keine Halbzeit-
Zahlen an sein Team funken. Schwächster Punkt: Schritt 5 ist der textlängste;
wenn gekürzt werden muss, fliegt zuerst der „Anfragen"-Satz (die Leiste aus
Schritt 1 fängt diesen Fall ohnehin). Keine Stelle verspricht ihm etwas, das
das Produkt nicht hält — geprüft gegen Abschnitt 0.
