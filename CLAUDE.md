# Hoops Germany – Vollständige Projektspezifikation
## Briefing für Claude Code Neustart

---

## 0. AKTUELLER STAND (Überblick · Stand 19.08.2026)

> 🟢 **v2 IST LIVE auf https://hoopsgermany.de** (seit 24.06.2026). Hostinger-VPS `92.113.25.249`
> (Ubuntu 24.04), Code in `/root/hoops-v2` (Branch **`redesign`**), PM2-Prozess **`hoops-v2` auf Port 3001**,
> DB **`hoops_prod`** (Atlas). Alte Seite läuft als Rollback-Fallback weiter (PM2 `sports`, Port 3000,
> DB `test`) → Rollback = Nginx zurück auf 3000. Deploy: `cd /root/hoops-v2 && git pull && npm run build &&
> pm2 restart hoops-v2` (bei neuen Dependencies vorher `npm install`). Claude-SSH-Key `~/.ssh/hoops_vps`
> (lokal); VPS-Repo-Zugang via Deploy-Key (SSH-Alias `github-hoops`).
> ⚠️ **NICHT DEPLOYT, NUR COMMITTET (20.08.2026, `d4f9465`): DIE LADEANIMATION DES HEROS HAT NIE
> STATTGEFUNDEN — und die Nacharbeit an `5080879` hatte selbst zwei Fehler.** Beide Gate-Blocker
> sind behoben, Kai und Tobias haben diesen Stand noch **nicht** gesehen.
> **(1) Die Zeichnung sollte sich beim Laden selbst zeichnen — sie tat es nie.** Eine Zahl ohne
> Einheit (`--len`) machte die ganze CSS-Regel ungültig; das Strichmuster fiel auf `none`, die
> Animation hatte nichts, woran sie ziehen konnte. **Sie stand trotzdem an drei Stellen als
> Zusage** (Bauteil, Stylesheet, diese Datei). Repariert statt gestrichen; belegt an gezeichneten
> Bildpunkten bei **gesetzter** Animationszeit in Chromium, WebKit und Firefox.
> ⚠️ **Zwei eigene Sonden waren vorher wertlos, und das ist die Lehre:** Die erste zählte
> `stroke-dashoffset`-Werte — die ändern sich **auch im Defekt** (48 Wechsel bei `dasharray:none`).
> Die zweite maß nach Wartezeit ab `waitForSelector` und meldete WebKit als abweichend; gemessen
> war die **Ladezeit**, nicht die Animation. Vierter Fehlalarm dieser Bauart im Projekt.
> **(2) Der Ring lag hinter dem Willkommens-Schild** (eingeloggt, 9 von 11 Fenstern, bis −44,8 px).
> Ursache: Die Zeichnung war so hoch wie die Bühne, die Bühne wächst mit dem Inhalt — also wuchs
> die Zeichnung mit der Anmeldung. **Fünfte Auflage von „Stellschraube gegen Restbetrag"**
> (Roadmap 20b). Nicht den Term um einen Fall erweitert (das wäre die sechste): Die Zeichnung hat
> jetzt eine eigene, inhaltsunabhängige Höhe. Abstand auf **zwölf** Fenstern und in **beiden**
> Anmeldezuständen konstant — 24,0 px ausgeloggt, 27,0 px eingeloggt.
> ⚠️ **Und mein erster Anlauf war auf Desktop ein Rückschritt:** Mit fester Kastenhöhe endete auch
> die Zeichnung dort — auf 1440×900 hörten die Dreipunkt-Linien **92 px vor dem Abschnittsende in
> der Luft auf**. Gebaut, **angesehen**, verworfen. Gelöst über `overflow: visible`: Der Kasten
> bestimmt nur noch den Maßstab, beschnitten wird von der Bühne.
> **Gestaltung (Vivien):** Das orange Willkommens-Schild ist eine Eyebrow-Zeile. Nach dem
> Freistellen standen zwei orange Marken übereinander — von zwei gleichfarbigen Zeichen betont
> keines mehr etwas. **Ob die Zeile überhaupt bleibt, gehört Nele:** Sie sagt „Willkommen zurück",
> die Überschrift darunter „Hey Max, schön, dass du da bist!" — zweimal derselbe Gruß, wörtlich
> der Befund, mit dem Nele am 19.08. das ausgeloggte Eyebrow gestrichen hat.
> ⚠️ **Ein Querlauf bleibt und ist NICHT aus dieser Runde:** Eingeloggt auf **genau 1024 px** ist
> das Dokument **1089 px** breit — die Seite lässt sich seitlich wegschieben. Quelle ist die
> Navigationsleiste (`components/layout/Navbar.js`, hier nicht angefasst); mit geklemmter
> Zeichnung derselbe Wert, in allen drei Browsern.
> ⚠️ **Offen bei Kai** (nicht gebaut, weil Testarbeit an dieser Fläche ihm zugewiesen ist):
> ein Wächter dafür, dass die Einblendung **stattfindet** · der eingeloggte Hero in
> `hero-standbild.spec.mjs` · ein Wächter gegen die Rückkehr von `non-scaling-stroke`.
> Prüfmaße stehen in `tests/e2e/README.md`.
> Build durch · Playwright **225 grün + 1 übersprungen** (226 laut `--list`, 28 Dateien) ·
> `design-audit --check` ohne Abweichung.
>
> ⚠️ **NICHT DEPLOYT, NUR COMMITTET (20.08.2026): DER HERO DER STARTSEITE IST EIN STANDBILD.**
> Patrick hat den scroll-gesteuerten Dunk vom Vortag **als Ganzes zurückgenommen** („die Hero
> Animation sieht nicht gut aus … alles zusammen — neu ansetzen"). Kein Push, kein Deploy —
> beides war nicht beauftragt. Entwurf: `docs/HERO-NEUANSATZ-2026-08-20.md`,
> Sweep: `docs/INSPIRATION-HERO-2026-08-20.md`.
> **Der schwerste Befund war kein Animationsfehler, sondern Arithmetik:** Die Bühne stand auf
> `calc(100vh - 4rem)` und zog damit **64 px** ab, wo **109 px** abzuziehen waren (Navigationsleiste
> **plus** Testphase-Band). Sie war 45 px zu hoch, ragte unten aus dem Bild, und weil ihr Inhalt in
> genau dieser zu hohen Box zentriert wurde, rutschte er nach unten. Ergebnis auf 360 px:
> **rund 215 px leere Fläche über der Überschrift — über 40 % der sichtbaren Höhe, im oberen
> Drittel.** Die naheliegende Korrektur (4 rem → 6,8 rem) wurde **bewusst nicht** gemacht: Sie
> wäre nach der Testphase wieder falsch, und zwar wieder unsichtbar falsch. Die Bühne trägt jetzt
> **keine Viewport-Einheit mehr**.
> Gebaut: `components/landing/HeroCourt.js` (Spielfeld-Zone streng in Draufsicht, aus FIBA-Maßen
> gerechnet) + `components/landing/HeroStage.js`. Entfallen: `HeroDunk.js` und
> `HeroScrollStage.js` (1.041 Zeilen), die Weiche `hero-dunk-hoch`/`-quer` und der Ring-Farbblitz.
> **Null JavaScript im Hero**, null Bilddaten; die Zeichnung zeichnet sich **einmal beim Laden**
> (900 ms, reines CSS, `no-preference`-Klammer → Grundzustand ist die fertige Zeichnung).
> ⚠️ **DER WICHTIGSTE SATZ, UND ER BETRIFFT DIE ARBEITSWEISE:** Der zurückgenommene Hero war auf
> zwei Nachkommastellen **vermessen und nie angesehen**. Die halb leere obere Bildhälfte stand in
> keinem Bericht, und **keiner der damals grünen Tests konnte sie sehen** — keiner hat gefragt, ob
> das erste Bild oben etwas ZEIGT. Bewacht jetzt durch `tests/e2e/hero-standbild.spec.mjs` (23
> Fälle, ersetzt `hero-dunk.spec.mjs` + `hero-erstes-bild.spec.mjs`). **Beide Gegenproben
> gefahren:** Zeichnung ausgeblendet → P1 auf allen sieben Fenstern rot; `pt` fest → P2 rot **nur
> auf 1440** (−19 px), grün auf den anderen sechs.
> ⚠️ **UND DIE VIERTE AUFLAGE VON „STELLSCHRAUBE GEGEN RESTBETRAG" (Roadmap 20b), diesmal meine:**
> `pt` in `rem` ist gesetzt, die Korblage ist ein Restbetrag aus Fenstermaßen — bei `slice` ist der
> Maßstab das **Maximum** aus Bühnenhöhe/720 **und Fensterbreite/1200**. Mit festem `pt` gemessen:
> 360–430 px → 23 px Abstand, 768×1024 → 9 px, **1440×900 → −20 px, der Korb lag auf der
> Überschrift** (weißer Text auf `#F07A27` = **2,59 : 1**). Behoben mit
> `max(10rem, calc(14.7vw + 1.5rem))`; nachgemessen 23–27 px auf allen sieben Fenstern.
> **Mein Auge hatte „eng" gesagt, die Messung sagte „überlappt" — Ansehen und Messen fangen
> verschiedene Fehlerklassen.**
> ✅ **ERLEDIGT mit `5080879`:** Der Perspektivbruch ist weg — `components/landing/KorbRuhe.js`
> ist neu in Draufsicht gezeichnet. Hier stand er bis zum 20.08. noch als OFFEN; die Zeile war
> beim Nachziehen liegengeblieben.
> ⚠️ **Zahl korrigiert:** Hier stand „**211 grün** + 1 übersprungen". Gezählt sind es
> **225 grün + 1 übersprungen** (226 laut `--list`, 28 Dateien). Nicht schätzen, zählen —
> `npx playwright test -c tests/e2e/playwright.config.mjs --list`.
> ⚠️ **Nebenbefund, nicht mein Auftrag:** `data-spur="desktop"` in der Feature-Strecke liefert
> `d=""` — ein leerer Pfad mit `pathLength="1"` im ausgelieferten Blatt.
>
> ✅ **DEPLOYT: `04ba621`** (20.08.2026) – **Die Nachrichten-Karten der Startseite ragten auf
> Handys über den Bildschirm.** Auf 360 px war die Seite **426 px breit**, ließ sich seitlich
> wegschieben, und jede der sechs Nachrichten verlor rechts ein Stück. Live nachgemessen nach
> dem Fix: **360 → 360 · 390 → 390 · 768 → 768.**
> ⚠️ **Die Ursache war eine AUSLASSUNG, kein Rechenfehler** (Befund Vivien): Das Gitter hieß
> `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` – Tablet und Desktop erklärten ihre Spalten,
> **mobil erklärte es niemand.** Ohne Ansage legt CSS eine Spalte vom Typ `auto` an, und die
> richtet sich nach ihrem **Inhalt** statt nach dem Bildschirm. Der Inhalt war ein Quellenname
> aus dem Live-Feed („GT/ET Göttinger Tageblatt - Eichsfelder Tageblatt", 266,6 px, nicht
> umbrechbar) → **386,2 px in einem 280-px-Platz**, und alle sechs Karten teilen sich diese
> eine Spalte. Behoben mit `grid-cols-1` (Untergrenze 0 statt `auto`) und `gap-3`.
> ⚠️ **DER SATZ, DER HÄNGENBLEIBT:** *Die Kürzung mit „…" stand die ganze Zeit im Markup und
> konnte nie greifen.* `truncate` ist ein **Angebot** – „ich mache mich kleiner, **wenn** mir
> jemand eine Breite vorgibt". Niemand gab eine vor. Die Spalte fragte die Karte, wie breit sie
> sein will, und die Karte antwortete mit der Breite ihres Textes.
> ⚠️ **Zweiter Befund, von Vivien selbst gefunden und live bestätigt:** Kürzungspunkte und Datum
> lagen auf **einer Kante – 0,00 px**, auf allen Breiten, **auf Desktop schon vorher**. Dann
> liest sich „…20.08.2026" als ein Ausdruck. Dieselbe Regel wie beim Hero-Ball: kein Kontakt,
> keine geteilte Kante. Jetzt konstant 12,00 px.
> ⚠️ **Und der Grund, warum es nie jemand fand, ist der eigentliche Lehrsatz: Die Nachrichten
> kommen erst NACH dem Laden.** Direkt nach dem Seitenaufbau gemessen ist die Seite sauber
> (360 = 360, null Karten); erst sechs Karten später sind es 426. **Jede Querscroll-Prüfung, die
> nicht auf den Feed wartet, ist nicht falsch gebaut – sie kommt zu früh.**
> ✅ **Tobias' Gate:** 13 Breiten von 320 bis 1440 je Seitenbreite = Fensterbreite · Gegenprobe
> mit abgeklemmtem Fix reproduziert exakt 386,2 px · Belastungstest mit einem Quellennamen aus
> **96 zusammenhängenden Zeichen ohne Trennmöglichkeit**: Karte bleibt 280 px · 0 Konsolen- und
> Netzwerkfehler · Nebengewinn: Die Ladeplatzhalter sind jetzt gleich breit wie die Karten, die
> Fläche springt beim Eintreffen nicht mehr von 280 auf 386.
> ⚠️ **Nebenwirkung, bewusst in Kauf genommen** (Gestaltung Vivien, von Tobias mitgetragen): In
> einem 12 px schmalen Band werden Quellennamen neu gekürzt, die vorher ganz zu sehen waren –
> **genau die, die vorher am Datum klebten**. „ein bis zwei Buchstaben gegen die Lesbarkeit der
> ganzen Zeile".
> ⚠️ **NEBENBEFUND, NICHT ANGEFASST:** Dieselbe fehlende Spalten-Ansage steht an zwei weiteren
> Stellen – `app/player/newsfeed/page.js:136` und `components/team/tabs/KaderTab.js:497`. Vivien
> hat dort **keinen Defekt gemessen** und deshalb nichts geändert: „das blind zu ändern wäre
> eine Behauptung statt eines Befunds."
> Bewacht durch `tests/e2e/nachrichten-karten.spec.mjs` – **der Feed wird abgefangen und durch
> feste Meldungen ersetzt.** Grund: Der Fehler trat nur auf, weil an diesem Tag zufällig eine
> Meldung mit langem Quellennamen dabei war. **Ein Schutz, dessen Auslösung davon abhängt, was
> ein fremder Verlag heute veröffentlicht, ist keiner.**
>
> ✅ **Davor deployt: `07150cf`** (20.08.2026, Roadmap 23 erledigt) – **Die Testsuite prüft jetzt
> die ausgelieferte Fassung** (`npm run build` + `next start`) statt `npm run dev`. Stellschrauben,
> jede beim Start **gedruckt**: `E2E_PORT` (isolierte Arbeitsbäume), `E2E_MODUS=dev` (schneller
> Weg **ohne** Gate-Anspruch), `E2E_BUILD=auto|aus`.
> ⚠️ **`reuseExistingServer` übernimmt keinen fremden Server mehr** – die Konfiguration prüft die
> `BUILD_ID` über `/_next/static/<BUILD_ID>/_buildManifest.js`. Am nachgestellten Zombie belegt:
> alter Server auf 3000, neuer Build auf der Platte → Lauf bricht ab und nennt beide Auswege.
> **Diese Woche hat ein verwaister `npm start` zweimal einen veralteten Build ausgeliefert.**
> ⚠️ **`E2E_MODUS=dev` zerstört den Production-Build** (`next dev` überschreibt `.next`).
> **Kosten:** Lauf 227,5/228,0 s (~3,8 min inkl. Build), Build 10,8–12,3 s warm / 20,5 s kalt.
> ⚠️ **Der Gewinn war sofort eingelöst:** Derselbe Commit, dieselbe Minute – `next dev` **2 grün**,
> `next start` **2 rot**. Das waren die Nachrichten-Karten (s. o.), ein Fehler, den die alte
> Konfiguration per Konstruktion nicht sehen konnte.
> ⚠️ **ZUR ZAHL „6 ROT" AUS DEM URSPRUNGSBEFUND – sie war nie ein Rätsel, ich habe falsch
> gerechnet:** Es waren **nicht** sechs Befunde, sondern zwei, verteilt auf sechs Testfälle –
> M1 (Nachrichten-Karten) sind **2**, M2 (Kais fest verdrahteter Host in
> `sicherer-pfad.spec.mjs`) sind **4**. Kai hat zwei vollständige Läufe gefahren: außer diesen
> beiden kein roter Test. Seine Vermutung, die „vier übrigen" stammten aus einem älteren Stand,
> ist damit gegenstandslos – die Rechnung geht ohne sie auf.
> ⚠️ **Kais eigener Fehler unterwegs, mit der besten Einordnung des Tages:** Sein erster Anlauf
> baute in **jedem** Arbeitsprozess neu; die `BUILD_ID` wechselte mitten im Lauf, 26 Dateien rot,
> 206 Tests nicht gelaufen. Dazu hielten sich seine Warte-Schleifen **gegenseitig am Leben**
> (`pgrep -f` fand die anderen Warte-Shells, in deren Kommandozeile derselbe Suchbegriff stand).
> Sein Fazit: **dieselbe Fehlerform dreimal an einem Tag in drei Kostümen** – eine Prüfung, die
> ihren Vergleichswert fest verdrahtet · eine Messung, die ihre eigene Stellgröße verändert ·
> ein Detektor, der sich selbst mitzählt. **Merksatz (steht seit 18.08. in dieser Datei): Eine
> Messung darf ihren eigenen Gegenstand nicht mitmessen.**
>
> ✅ **DEPLOYT: `35b8bc0`** (20.08.2026) – **Der Hero der Startseite ist neu**, und die
> Weiterleitung nach der Anmeldung ist abgesichert. Drei Commits: `bd99263` (Vivien, der Dunk),
> `d841c4b` (Vivien, Blocker + vier Gate-Befunde), `35b8bc0` (Kai, Weiterleitung + zwei Testlücken).
>
> **Der Dunk** – eine Linienzeichnung statt des gerenderten Balls (`components/landing/HeroDunk.js`,
> Konzept `docs/HERO-DUNK-KONZEPT-2026-08-19.md`), dazu Neles Hero-Reduktion
> (`docs/HERO-AKTION-ENTSCHEIDUNG-2026-08-19.md`): **sechs Dinge im Hero wurden vier**, eine Taste
> statt drei. Gelöscht: `PlayDiagram`, `SwishSequence`, `BallSprite` und **295 KB Bilddaten** – die
> Startseite lädt null Bytes davon. **Steuerdatei ~1350 → 235 Zeilen.**
> ⚠️ **ROADMAP 20, 20b–20h SIND DAMIT GEGENSTANDSLOS** – acht Punkte, jeder mindestens eine
> Gate-Runde teuer. Der Grund in einem Satz: Der alte Ball war eine **deckende Scheibe**, die
> keinen Buchstaben berühren durfte; daraus kamen Kastenbau, Lückensuche, Verankerung und
> Konturkanal. **Eine Linie darf jeden Buchstaben kreuzen** – die Frage ist nicht mehr Geometrie,
> sondern Kontrast, und dorthin ist der Wächter gewandert. Sieben Testdateien entfielen,
> **jede begründet in `tests/e2e/README.md`**.
> ✅ **Live nachgemessen (20.08.2026):** 4 Zeichenlinien, **alle vier versteckt** ausgeliefert,
> 0 fertig gezeichnet · Ring vorhanden · alte Ballsequenz **404** · 16 Routen je 200 ·
> `/signup` mit 6 Eingabefeldern.
>
> ⚠️ **DER BLOCKER, DEN KAI FAND (K1) – und warum er lehrreich ist:** Die Seite lieferte das
> **fertige Standbild an ALLE** aus und wischte es beim Laden wieder weg. Die Pointe wurde
> gezeigt, zurückgenommen und dann erzählt. Viviens Diagnose ging tiefer als der Fehler:
> **Ob jemand `prefers-reduced-motion` gesetzt hat, ist eine Eigenschaft seines GERÄTS – der
> Server hat keines und kann es nicht wissen.** Der alte Code hat geraten, zugunsten des
> Standbilds. Es gehört jetzt dem Stylesheet, nicht einer JavaScript-Entscheidung.
> **Merksatz: Eine Regel, die schon im ausgelieferten Blatt gelten muss, darf nicht auf
> JavaScript warten.** Bewacht durch `tests/e2e/hero-erstes-bild.spec.mjs` – es liest das
> **rohe Server-Blatt**, nicht die Seite im Browser. Kais Gegenprobe: 6 Mutationen, 5 rot.
>
> ⚠️ **DIE WEITERLEITUNGS-LÜCKE (Kai K4, vorbestehend):** Nach Anmeldung/Registrierung wurde
> das Ziel aus der Adresszeile **ungeprüft** übernommen. Angriff: Ein Link auf unsere **echte**
> Anmeldeseite, der Nutzer meldet sich wirklich bei uns an – und landet auf einer nachgebauten
> Maske, die „noch einmal" nach dem Passwort fragt. Belegt: Mit der alten Prüfung protokollierte
> Playwright `navigated to "http://evil.com/"`.
> **Die Prüfung stand VIERMAL da und war viermal umgehbar** – `startsWith("/") &&
> !startsWith("//")` lässt den **Rückwärtsstrich** durch, und der Browser macht aus
> `/\evil.com` ein `https://evil.com/`. Jetzt **eine** Quelle: `lib/sichererPfad.js`, an allen
> fünf Stellen (Login, Signup, OAuth-Landing, beide Google-Endpunkte). Sie bildet **nicht nach,
> was der Browser tut, sondern fragt ihn**: Ziel auflösen, Ursprung vergleichen.
> Tobias: 26 Angriffsformen abgewiesen, 13 legitime Ziele durchgelassen.
> ⚠️ **Kais erste Fassung war ZU STRENG** und ließ `/spieler?q=max mustermann` still auf den
> Newsfeed fallen – kein Fehler, keine Meldung, nur die falsche Seite. Die Browser-Funktion
> wandelt `%20` bereits in ein Leerzeichen um. **Eine Abwehr, die zu viel abweist, ist ein
> stiller Ausfall wie jeder andere.**
> ⚠️ **Ein abgewiesenes Ziel führt jetzt still zum Newsfeed.** Absicht (eine gelungene Anmeldung
> soll nicht mit einer Fehlermeldung quittiert werden), von Tobias mitgetragen. Die eigentliche
> Gefahr der Stille ist die andere Richtung: Würde ein **legitimes** Ziel fälschlich abgewiesen,
> merkt es weder Nutzer noch Betreiber – dagegen grast Kais Test die Startseite ab und prüft
> jeden dort verlinkten Zielwert.
> ⚠️ **NICHT GEPRÜFT:** Der **Google-Weg ist nie durchgelaufen** (lokal keine Schlüssel) – das
> sind **drei der fünf** geänderten Stellen. Und `/signup` mit `?next=` lief bei beiden Prüfern
> **nicht durchs Formular**, nur über `/login`. Einmal echt auf Prod durchspielen.
>
> ⚠️ **DER SCHWERSTE BEFUND DES TAGES BETRIFFT NICHT DEN CODE, SONDERN UNSER WERKZEUG (Kai H1):**
> **Die gesamte Playwright-Suite läuft gegen `npm run dev`** – fest verdrahtet in
> `tests/e2e/playwright.config.mjs`. Sie kann Fehler, die **nur in der ausgelieferten Fassung**
> auftreten, per Konstruktion nicht sehen. Belegt am selben Commit in derselben Minute:
> **Entwicklung 231 grün / Produktion 225 grün, 6 rot.** Die Projektregel „vor Deploy immer die
> Production-Runtime testen" und das Werkzeug widersprechen sich. **Alle früher protokollierten
> „grün"-Zahlen sind Dev-Zahlen.** Umstellung ist keine Nebenarbeit → Roadmap 23.
>
> ⚠️ **UND EIN ECHTER FEHLER AUF DER STARTSEITE, VORBESTEHEND UND SEIT LÄNGEREM LIVE (Kai M1):**
> Auf **360 und 390 px** ragen die Nachrichten-Karten über den Bildschirm – die Seite ist dort
> **426 px breit statt 360**. Der Leser verliert rechts ein Stück jeder Nachricht. Verursacher
> ist der Einblend-Rahmen in `components/NewsWidget.js` (Karte bei x=40, 386 px breit). Kai hat
> `bd99263` eigens gebaut und gegengemessen: dort identisch. **Nur in der Produktionsfassung
> sichtbar** – deshalb hat es nie ein Test gefunden. → Roadmap 24.
>
> ⚠️ **ZWEI ANGABEN VON VIVIEN STIMMEN NICHT** (Befund Tobias, beides Doku, nicht Produkt):
> (1) „Vollständig verdeckt ist der Ball in **keinem einzigen Bild**" – über 48 gemessene Bilder
> gibt es **genau eines** (~16 ms). Ursache: Sie hat **Fläche** gemessen, der Ball ist ein
> **Umriss ohne Füllung**, und mit 24 Stichproben rutscht ein 16-ms-Fenster durch.
> (2) Ihr Abstand „89/92 px" zur Navigationsleiste ist nicht reproduzierbar (Tobias misst
> 76,6/79,7). Der Kern stimmt jeweils, die Zahl nicht.
>
> ⚠️ **KAI HAT SICH SELBST GEBREMST, und das gehört festgehalten:** Zu seinen kleineren Punkten
> K5–K9 aus der Vorrunde sagt er, er könne sie **nicht bestätigen** – sein damaliger Bericht
> liegt nirgends im Arbeitsbaum. *„Aus dem Gedächtnis eine Unbedenklichkeitsbescheinigung
> auszustellen wäre genau die Sorte Zusicherung, die ich in diesem Bericht zweimal als Befund
> melde."* **Folge: Gate-Berichte gehören ins Repo, nicht nur in die Sitzung.** → Roadmap 25.
>
> ✅ **Davor deployt: `062989e`** (19.08.2026) – **`/signup` kam LEER beim Nutzer an.** Das
> ausgelieferte HTML trug 0 Eingabefelder, 0 `<main>` und 0 Verweise auf Datenschutz und
> Impressum; `useSearchParams()` ließ beim statischen Vorrendern die umschließende
> `<Suspense>`-Grenze auf ihren **leeren** Ersatzinhalt fallen. Im Browser war nach dem Nachladen
> alles da – **deshalb fiel es monatelang niemandem auf, und ein Browser-Test wäre immer grün
> geblieben.** Der Haken wurde an zwei Stellen benutzt, beide laufen ohnehin erst im Browser;
> sie lesen die Adresszeile jetzt direkt, wie es der Google-Effekt in derselben Datei immer tat.
> ⚠️ **Der Punkt für Nora:** Die Rechtsverweise, die sie am 13.08. für genau diese Seite
> verlangt hat (Art. 13 DSGVO, § 5 DDG), waren eingebaut – und erreichten das ausgelieferte
> Blatt nie. Live nachgemessen: 6 Eingabefelder, 1 `<main>`, je 3 Verweise.
> Bewacht durch `tests/e2e/signup-ohne-js.spec.mjs` (liest das rohe Server-Blatt).
>
> ✅ **Davor deployt: `cf02293` → `a4c6811`** (19.08.2026) – **Sponsor-Report auf sechs Zahlen**
> (Auftrag Patrick, Urteil Tobias: „ein Sponsorendokument braucht sechs starke Zahlen mit je
> einem erklärenden Satz, nicht dreißig"). Neun Abschnitte mit ~30 Kennzahlen wurden zwei
> Abschnitte mit sechs Zahlen, jede mit Erklärsatz.
> ⚠️ **Drei Zahlen darin logen**, und eine davon war mein eigener Fehler:
> (1) „Ligen im Katalog" – meine Begründung war **erfunden**: Ich hatte eine Zahl aus der Dev-DB
> mit einer aus Prod verrechnet und von „77 → 51" erzählt. Auf Prod waren es 51 vorher und 51
> nachher; die Demo-Kreisligen tragen `official: false`. Der Filter bleibt als Schutzgeländer.
> (2) **Bestandszahlen trugen ein Prozent-Wachstum, das etwas anderes misst** – `entityStats`
> rechnet die NEUEN Anmeldungen der letzten 30 Tage gegen die 30 davor, daneben stand der
> Gesamtbestand. „4 Vereine +100 %" liest sich als Verdopplung. Jetzt „davon N neu in 30 Tagen".
> (3) **Der Report zeigte Anstiege und verschwieg Rückgänge** (Befund Kai H1, ebenfalls meiner):
> `wachstumsText` gab bei jedem Wert ≤ 0 `null` zurück. Real: auf Prod Seitenaufrufe **−34 %**,
> Besucher **−39 %**, beide ohne jedes Abzeichen. Ein Hinweis erschien **nur bei guten
> Nachrichten**. Jetzt beidseitig, mit Deckel in beide Richtungen.
> ⚠️ **Und der Sponsorenlink zeigte ein ANDERES Blatt als die Backoffice-Vorschau** (Kai H2 /
> Tobias H-1): `newLast30` stand als „interne Wachstumsrohdaten" auf der Ausschlussliste, also
> fehlte draußen die Zeile „davon N neu in 30 Tagen" – ohne Fehler, ohne Meldung. Darüber steht
> „Zeitraum: letzte 7 Tage". **Ich hatte in der Vorschau geprüft, die das Problem nicht hat.**
> Entfernt, mit Begründung im Code: Beliebteste Inhalte (**fünf Klarnamen** unter einer
> gedruckten Zusicherung, es würden keine personenbezogenen Daten genannt), Regionale Stärke
> (>90 % Seed), Wiederkehrende (0), Sitzungsdauer (4 s), Aktive Nutzer, Beliebteste Seiten
> (rohe Pfade inkl. `/player/update-password`).
> ⚠️ **NEUE AUFLAGE TOBIAS, ersetzt die alte:** Die PDF-Auflage ist **für den Report aufgehoben**
> (Klarnamen auf allen drei Wegen weg, im Druck geprüft). An ihre Stelle treten zwei engere:
> **(a) Kein CSV-Export aus dem Sponsoren-Reiter** – die Datei schreibt weiterhin fünf
> Spielernamen mit (`content.topPlayers`), eine Knopfbreite neben „Sponsoring-Report öffnen".
> **(b) Kein Freigabelink nach draußen, bis B1 entschieden ist:** Der Sponsor wählt den Zeitraum
> selbst, und bei „90 Tage"/„1 Jahr" zeigt der Report **„+100 %"**, wo im Vorzeitraum **gar
> nichts** gemessen wurde (`growth()`: `if (!prev) return cur > 0 ? 100 : 0`). Der 300-%-Deckel
> greift nicht, weil 100 darunter liegt. Auf Prod **nicht** nachgemessen.
> Bewacht durch `tests/e2e/sponsor-report.spec.mjs` (3 Fälle). ⚠️ Kais Mutationsmatrix fand
> **3 Überlebende von 15** – zwei davon geschlossen: Der Feldgleichheits-Test prüft jetzt die
> **ausgelieferte Nutzlast** statt den Quelltext (eine Textsuche blieb grün, wenn jemand den
> Helfer schlicht nicht mehr aufrief), und der Klarnamen-Test hat eine Schranke auf die
> Namensliste (bei leerer Liste lief er ins Nichts).
>
> ✅ **ZULETZT DEPLOYT: `7da3905`** (18.08.2026, fünfter Deploy des Tages) – Silbentrennung ohne Stummel
> (Vivien) + Backoffice-Kennzahl, die nur wachsen konnte. Live: 16 Routen je 200, Trennregel im
> ausgelieferten CSS belegt (`hyphenate-limit-chars: 8 5 4` **und** die `-webkit-`-Variante –
> ohne die fiele Safari zurück). Playwright 260/260 + 1 übersprungen.
>
> ⚠️ **ZWEI OFFENE PUNKTE, DIE NIEMAND VERGESSEN DARF:**
>
> **(1) KEIN PDF AUS `/admin/sponsor-report` NACH AUSSEN GEBEN** (Auflage Tobias). Der Report
> sichert oben zu, keine personenbezogenen Daten zu enthalten – und listet vier Absätze weiter
> **fünf Klarnamen**. Der teilbare Link ist sauber gefiltert (Positivliste in
> `app/api/analytics/public-report/route.js`, Spielernamen ausdrücklich ausgeschlossen, u. a.
> weil 16-/17-Jährige darunter sein können); der **PDF-Weg ist es nicht**. Zwei Wege nach
> draußen, nur einer geschützt – und der ungeschützte trägt den PDF-Knopf. **Vorbestehend.**
> Gehört zu **Nora**.
>
> **(2) Der Sponsor-Report zieht „Regionale Stärke" und „Beliebteste Inhalte" aus dem
> GESAMTBESTAND** – auf `hoops_prod` gemessen **406 Spieler, davon 375 Seed (92 %)**; Teams
> 66/60, Beiträge 310/296. Zwei Abschnitte tiefer steht gedruckt, Nutzer- und Teamzahlen seien um
> Testkonten bereinigt – das gilt aber nur für einen Teil der Seite. Derselbe Gegenstand wie die
> 4.073 Seed-Likes aus Roadmap 2, **§ 5 UWG**. Solange kein Link draußen ist, ist es nicht akut;
> ab dem ersten verschickten Link sofort.
>
> ⚠️ **UND EIN TEST IST GEBAUT, ABER NICHT BEWIESEN:** Die Ellipsen-Regel in
> `kein-abgeschnittener-text.spec.mjs` (gewollte Kürzung mit „…" ist kein Befund) – meine
> Gegenprobe mit einem hart beschnittenen Satz OHNE „…" wurde **nicht gefangen**, und der Grund
> ist ungeklärt. Wer die Regel anfasst, fängt bei dieser Gegenprobe an.
>
> ✅ **Davor: `96eba14`** (18.08.2026, vierter Deploy des Tages) – Newsfeed-Umbau Teil 2,
> Viviens drei Gestaltungspunkte, Patricks abgeschnittene Überschrift. Am Server verifiziert.
> Live nachgemessen: 16 Routen je 200 · Kontaktseite trägt „Kontakt", **3 Eingabefelder, 1
> Absenden-Knopf** · Überschrift der Startseite auf 390 px vollständig im Bild (96 % randfüllend)
> · 0 Laufzeitfehler. Build durch · Playwright **257/257 + 1 übersprungen** (26 Dateien).
>
> ⚠️ **DER WICHTIGSTE BEFUND DES TAGES – und er war meiner:** Ich hatte
> `app/kontakt/page.js` mit dem Inhalt von `app/about/page.js` überschrieben. Das
> Kontaktformular war weg, der Footer verlinkte weiter „Kontakt", die Seite zeigte auf sich
> selbst. Hergang: ein Sicherungsbefehl mit Ausweichpfad
> (`cp app/about/page.js … || cp app/kontakt/page.js …`) – der **erste** Teil gelang, also lag
> `about` in der Sicherung, und das Zurückspielen schrieb sie über `kontakt`.
> **Was NICHT passierte, ist das Eigentliche:** Der Build lief durch. **253 Tests blieben grün.**
> Der Diff wurde von Kai gelesen, ohne dass die Datei auffiel. Gefunden hat es **nur** Tobias'
> Browser-Gate – jemand, der die Seite aufgerufen hat. Eine Seite, die durch eine andere ersetzt
> wird, ist syntaktisch fehlerfrei; sie ist nur die falsche Seite.
> **Regel daraus: Das Browser-Gate ist keine Formsache.** Bewacht durch
> `tests/e2e/seiten-identitaet.spec.mjs` (Überschrift passt zum Weg · kein doppelter
> spezifischer Titel · Kontaktseite hat Eingabefelder) – Gegenprobe mit nachgestelltem
> Fehlgriff: dreifach rot.
>
> ⚠️ **Zweiter schwerer Befund (Kai B1): Endlosschleife in der neuen Schienen-Mechanik.**
> Der 1-px-Rahmen ist Teil der gemessenen Höhe – ihn abzuschalten vergrößerte den Innenbereich
> um genau diesen Pixel, die Antwort kippte, der Rahmen kam zurück. **120 Wechsel pro Sekunde,
> ohne Ende**, bei genau einer Fensterhöhe (die pro Konto woanders liegt). Die Toleranz zu
> erhöhen hätte das Fenster nur verschoben. **Behoben: Rahmenbreite bleibt, nur die FARBE wird
> durchsichtig** – die Geometrie ändert sich nie mehr. Nachgemessen 0 statt 120 Wechsel.
> **Merksatz: Eine Messung darf ihre eigene Stellgröße nicht verändern.**
>
> ✅ **Davor: `da7756b`** (18.08.2026, dritter Deploy des Tages) – **Newsfeed-Umbau**: Ergebnisse
> führen mit dem Punktestand statt mit einem Satz, der Beleg ist eine eigene Zeile mit **drei**
> Stufen, wer im Box-Score steht sieht seine Zahlen daneben (`components/posts/ErgebnisInhalt.js`,
> `lib/eigeneZahlen.js`). Mobil: vier gleichförmige Aufklapp-Kästen → **eine** Wegweiser-Zeile
> (48 statt ~192 px, Tippziele 44 px). Neuer Tour-Schritt „Dein Feed" (Position 2 von 6).
> Testdaten `scripts/seed-feed-lebendig.mjs`. Grundlage: `docs/INSPIRATION-NEWSFEED-2026-08-18.md`.
> Build durch · Playwright **232/232** (gegen `--list`, bei `load` 1,7) · **Tobias freigabefähig** ·
> **Kai erst nach einer Korrektur** – alle Befunde abgearbeitet. 16 Live-Routen je 200.
> ⚠️ **DER WICHTIGSTE SATZ DIESES DEPLOYS** (Befund Kai, hoch): Ergebnis-Beiträge auf `hoops_prod`
> haben die neuen `meta`-Felder **NICHT** – gemessen **5 von 5 alt, 0 neu**, weil sie nur bei einer
> Ergebnisänderung entstehen und die 137 abgeschlossenen Spiele sich nicht mehr ändern. Auf der
> Dev-DB ist es **umgekehrt**. **Der Zustand, den 100 % der Live-Beiträge haben, ist lokal weder
> für einen Entwickler noch für ein Browser-Gate auslösbar.** Mein erster Rückfall-Zweig hätte
> jedem dieser Beiträge den Klickweg zum Spiel genommen – ohne dass es kaputt ausgesehen hätte.
> ✅ Nachgeprüft mit einem eigens erzeugten Altbeitrag am identischen Code: Verweis vorhanden,
> Ziel korrekt, Mauszeiger klickbar, 0 Fehler.
> ✅ **NACHTRAG 18.08.2026: Die zwei offenen Testlücken sind geschlossen** (`26be1c9`).
> `tests/e2e/eigene-zahlen.spec.mjs` – vier Fälle gegen den Datenschutzfall („sieht jemand fremde
> Zahlen als *deine*"), Sollwerte pro Konto aus der API gelesen statt fest eingetragen.
> `tests/e2e/newsfeed-mobil.spec.mjs` – 360/375/390/430 px, Tippziele **gemessen statt aus der
> Klasse gelesen** (Kai: „behaupten und messen sind zweierlei"), plus ein Fall gegen die Rückkehr
> der Aufklapp-Kästen. Alle Gegenproben gefangen. Suite **241/241**, 23 Dateien.
> ⚠️ Beim Bauen zwei eigene Fehler: Der erste Anlauf war falsch rot (suchte im ganzen Dokument
> statt in `main` und fand die Navigationsleiste), und eine Gegenprobe lief **glatt durch** – ein
> natives `<details>` trägt kein `aria-expanded`, der Test war gegen die halbe Fehlerklasse blind.
> **Eine Gegenprobe, die durchläuft, ist ein Befund am Test, nicht am Code.**
>
> ⚠️ **Live NICHT angemeldet nachgemessen** – `/post/[id]` verlangt Anmeldung, die Testkonten auf
> `hoops_prod` sind seit dem 15.08. bewusst entwertet. Die Aussage stützt sich auf den identischen
> Code lokal, nicht auf eine Live-Sichtung.
>
> ✅ **Davor: `aff17e6`** (18.08.2026, zweiter Deploy des Tages) – Newsfeed: die rechte Schiene
> versteckte bis zu 464 px ihres Inhalts auf **jedem** Desktop (Befund Patrick). Haftkante und
> Höhendeckel hängen jetzt an EINEM Schalter (`haftend` in `components/feed/Schiene.js`).
> ⚠️ **Der erste Anlauf war ein Rückschritt** (Befund Tobias im Gate): Mit zusätzlichem
> `overscroll-contain` ließ sich die SEITE nicht mehr scrollen, solange der Mauszeiger über der
> Schiene stand – eine tote Fläche über rund einem Drittel der Bildbreite, ohne Rückmeldung.
> In Chromium und WebKit reproduziert, in Firefox nicht. Zeile ersatzlos entfernt: Das
> gewünschte Verhalten (erst die Schiene zu Ende rollen) tritt in **allen drei** Browsern auch
> mit `auto` ein – die Eigenschaft hatte keinen Nutzen und einen Preis.
> Live nachgemessen: 16 Routen je 200 · im ausgelieferten CSS steht `max-height:calc(100vh - 7rem)`
> und **keine** `overscroll`-Regel in einem Desktop-Block (die eine `.overscroll-contain`-Klasse
> gehört den mobilen Menüs in `Navbar.js`/`PlayerNav.js`, dort ist sie richtig).
> ⚠️ **Nicht geprüft, ehrlich benannt:** Die Schiene selbst ist live **nicht angemeldet
> nachgemessen** – die Testkonten auf `hoops_prod` sind seit dem 15.08. bewusst entwertet. Die
> Live-Aussage stützt sich auf das ausgelieferte CSS, die Verhaltensmessung auf die lokale
> Production-Runtime desselben Commits.
>
> ✅ **Davor deployt: `787d760`** (18.08.2026; davor `cc128ed`, `f27736a`, `40dff48`, `f46a783`, `84cb7ba`) – am Server
> verifiziert (`git log` AM SERVER, nicht dieser Zeile geglaubt), Abstand zu `origin` 0,
> `pm2 restart` gelaufen, Prozess `online`. **Der ausgelieferte Code ist der aktuelle** –
> was danach liegt, sind reine Doku-Commits. Prüfen mit **zwei** Befehlen, nicht mit einem:
> ```bash
> git rev-list --count 787d760..HEAD    # wie viele Commits offen
> git diff 787d760..HEAD --stat -- . ':(exclude)docs' ':(exclude)CLAUDE.md'   # davon Code?
> ```
> ⚠️ Die zweite Zeile ist die wichtigere. Eine Zahl allein („5 offen") sagt nicht, ob ein Deploy
> **nötig** ist – dieselbe Zahl bedeutet bei fünf Doku-Commits „nichts zu tun" und bei einem
> Code-Commit „die Seite läuft veraltet".
> ⚠️ **Diese Zeile hat sich beim VIERTEN Mal geirrt** – sie sagte „NICHT DEPLOYT: 3 Commits
> nach `cc128ed`" und zählte `6750a78` nicht mit; bis zum Deploy waren es **5**. Immer
> zählen, nie schätzen: `git rev-list --count <live>..HEAD`, Server-Stand aus
> `ssh … "cd /root/hoops-v2 && git log --oneline -1"`.
> ✅ **Vor dem Deploy geprüft:** Build durch · Playwright **227/227** (gegen `--list`
> abgeglichen) · Production-Runtime (`npm start`, `BUILD_ID` kontrolliert) · **Tobias-Gate
> freigabefähig** (Gegenprobe mit abgeklemmter Federung: 231 px bzw. 255 px in EINEM Frame
> ohne Fix → 14–15 Frames mit Fix).
> ✅ **Live über die DOMAIN nachgemessen (18.08.2026):** 16 Routen je 200 · Konturkanal
> 13,84 (320) / **10,18 (360)** / **10,23 (368)** / 13,17 (375) / 30,91 (412) / 39,66 (430) ·
> wirksame Sichtbarkeit 0,80 mobil · ab 768 mit Vorscroll 400 sichtbar (39–54 %) ·
> Skip-Link und `<main>` da · **0 Laufzeitfehler** · Cache-Vorgabe `max-age=2592000` steht.
> ⚠️ **DIE FEHLALARM-FALLE HAT SICH WIEDERHOLT – IN NEUER FORM (18.08.2026).** Beim letzten
> Deploy war der Fehler eine feste Wartezeit statt `waitForSelector`. Diesmal habe ich
> korrekt auf das Element gewartet – und **trotzdem zu früh gemessen**: Der Ball ist im
> Seitengerüst vorhanden, bevor er auf seiner Ruhelage steht. Ergebnis: Deckkraft 0,00 auf
> **allen** Breiten und ein Konturkanal von 3,29 px bei 360 – hätte ich das gemeldet, wäre
> es ein Fehlalarm über genau den Defekt gewesen, der zwei Runden vorher behoben wurde.
> **Regel: auf das Element warten reicht nicht, es muss zur RUHE gekommen sein** – auf
> Deckkraft > 0,5 UND fünf Frames Lageänderung < 0,5 px warten (Muster:
> `scratchpad/live-nachmessen.mjs`). Danach stimmten die Werte auf zwei Nachkommastellen
> mit den protokollierten überein.
> ⚠️ **Und die zweite Hälfte derselben Falle:** Bei 768/900/1280 meldete dieselbe Sonde
> „Ball FEHLT". Auch das ist kein Defekt – ab 768 px steht der Ball bei `scrollY = 0` auf
> Deckkraft 0,000 (in Roadmap 20f protokolliert). **Eine Sichtbarkeitssonde ohne Vorscroll
> verwirft auf Desktop-Breiten per Konstruktion jeden Messpunkt.**
> ⚠️ **ZUM DRITTEN MAL STIMMTE DIESE ZEILE NICHT — diesmal aus einem neuen Grund:**
> Sie führte `f46a783` als live, der Server stand aber schon auf `40dff48`. Eine
> **andere Sitzung** (Skip-Link) hatte selbst deployt. Vorher lag es zweimal daran,
> dass committet und die Zeile gepflegt wurde, ohne zu deployen; jetzt kann auch
> das Gegenteil passieren. **Der Befehl bleibt maßgeblich, nie die Zeile:**
> `ssh … "cd /root/hoops-v2 && git log --oneline -1"`
> ⚠️ **Und die Prüfbasis hat sich unter beiden Gates bewegt:** Die Skip-Link-Arbeit
> landete per Fast-Forward auf `redesign`, während Kai und Tobias `f5b1b3f`
> prüften. Kai hat gewarnt, weil sie `app/page.js`, `app/layout.js` und
> `app/globals.css` berührt – die Flächen, die Bühnenhöhe und Eyebrow-Lage
> bestimmen. **Nachgemessen: das Fundament hielt** (elf Breiten, identische Werte).
> Es ging gut aus; die Regel bleibt trotzdem, dass parallele Sitzungen einen
> eigenen Worktree brauchen (Methodik-Lehre 0).
> ⚠️ **Zwei Dinge, die dieser Deploy über das Vorgehen gelehrt hat:**
> (1) Der Server trug eine **lokale Änderung an `package-lock.json`** (nur entfernte
> `libc`-Metadatenfelder, Artefakt einer älteren npm-Version – **keine Paketversionen betroffen**).
> `git pull` wäre kollidiert; verworfen mit `git checkout -- package-lock.json`, nachdem der Diff
> angesehen war. **Vor dem Verwerfen hinsehen, nicht danach.**
> (2) **`npm install` war NICHT nötig** – in den 31 Commits änderte sich nur eine *devDependency*
> (`@playwright/test`), der `dependencies`-Block ist unverändert. Ein `npm install` hätte Playwright
> samt Browsern auf den VPS gezogen. **Also prüfen:**
> `git diff <live>..HEAD -- package.json` – und nur bei echten `dependencies` installieren.
> ⚠️ **Roadmap 21 ist mit diesem Deploy scharf geworden:** Die Ball-Sequenz (107 KB AVIF) liegt
> unter `/images/` und hat **keine Cache-Vorgabe** – auf der Einstiegsseite jedes Erstbesuchers,
> bei jedem Aufruf neu.
> ⚠️ **Diese Zeile stand tagelang auf „fünf Commits" und war damit um den Faktor fünf falsch** –
> es wurde committet und die Zeile gepflegt, ohne den Abstand zum Deploy neu zu zählen. Genau
> die Fehlerform, die weiter unten schon zweimal für den Rollback-Zeiger protokolliert ist.
> **Nicht schätzen, zählen:** `git rev-list --count 164c784..HEAD`.
> ✅ **Stand nach Runde SIEBEN: beide Gates freigabefähig mit Auflagen** – die
> Auflagen sind umgesetzt, ebenso Tobias' H1 und Kais K1. Build durch, Playwright **227/227** (gegen `--list`
> abgeglichen). Live ist `f46a783`; auf `redesign` liegt der Stand danach.
> ⚠️ **Der Hauptbefund der Runde war eine Zusicherung, die es nicht gab:** Der
> Kommentar, mit dem ich das Streichen der Bildzahl-Schwelle begründet habe,
> verwies auf ein „≤ 80 ms"-Stillstands-Maß im Laufzeit-Test – **das existierte
> nicht.** Kai und Tobias haben es **unabhängig** gefunden. Kais Einordnung: sein
> K4-Muster eine Ebene höher, *nicht eine Konstante ohne Verwendung, sondern eine
> **Übergabe an nichts***. Es ist jetzt gebaut, mit Tobias' Bewegungsvorbehalt.
> ⚠️ **Und die Regressionslücke war groß:** Kais Matrix zeigte **13 von 14**
> Umkehrungen dieses Mechanismus stumm, darunter die Verankerung selbst.
> Ursachen: 360/368 px kamen in **keiner** Viewport-Liste vor, „wirksam sichtbar"
> bleibt auch bei kaputter Lage 80 %, und **niemand prüfte den Kanal**, den
> Vivien zur Vorgabe gemacht hatte. Geschlossen durch
> `tests/e2e/hero-konturkanal.spec.mjs`.
> ⚠️ **Die zwei Zahlen in diesem Absatz waren beim letzten Mal beide falsch** (Befund Kai:
> „24" statt 27, „146/146" statt 150/150) – und sie stehen unmittelbar unter der
> Anweisung „Nicht schätzen, zählen". **Die Regel hat sich selbst eingeholt.** Beide Zahlen
> sind messbar: `git rev-list --count 164c784..HEAD` und `npx playwright test --list`.
> Kais Deploy-Empfehlung war „noch nicht", begründet mit einem 20-px-Satz nach der Landung auf
> jedem mobilen Laden – der ist behoben und durch drei neue Tests gedeckt. **Offen sind fünf
> Gestaltungspunkte bei Vivien** (s. Roadmap 20c) sowie zwei bewusst zurückgestellte
> Prüf-Lücken (Kais M7/M8; die Abdunkelung greift mobil überhaupt nie).
> **Zuletzt deployt: `164c784` (15.08.2026 abends, am Server verifiziert).** Newsfeed-Umbau
> („Die Anzeigetafel nach dem Spiel") nach zwei Gate-Runden. Kern: **`beidseitigBelegt()` in
> `lib/matchScore.js`** – die EINE Quelle für jede Aussage mit dem Wort „bestätigt".
> ⚠️ **Warum das der wichtigste Fix des Tages ist:** Live nachgemessen tragen **137 von 137**
> abgeschlossenen Spielen auf Prod `resultStatus: "confirmed"` **ohne** beidseitiges
> `submittedBy` (Seed-Bestand). Der Zwischenstand hätte also **jedes einzelne Spiel** als
> „beidseitig bestätigt" ausgewiesen – kein Randfall, der Gesamtbestand.
> Weiter: Anzeigetafel mit drei Registern (inkl. **„Deine Zahlen"** – die erste eigene Zahl, die
> der Newsfeed je zeigte) · zwei Zonen statt drei Spalten (Feed 700 px statt 544) · Feed mit
> zwei Rängen · eine Schiene statt fünf Karten · Checkliste ab 50 % einzeilig (504 → 39 px) ·
> erster Beitrag mobil bei **y = 888 statt 1491**.
> ✅ Live geprüft: sieben Seiten je 200, `/match/[id]` zeigt korrekt **kein** Beleg-Abzeichen.
> Alt-Beiträge im Feed tragen weiter „Endergebnis" – das ist für ein Admin-Ergebnis **wahr**,
> es steht also nirgends live eine Falschaussage (`syncMatchResultPost` läuft nur bei einer
> Änderung am Spiel; ob nachmigriert wird, ist eine Entscheidung, kein Fehler).
> Davor: **`074bcf1`** (15.08.2026, am Server verifiziert – `pm2 restart` gelaufen,
> Live-Seiten je 200, Sicherheitsfix am echten Verein nachgemessen). Sechste/siebte Runde:
> **öffentlich abrufbare Einladungstoken geschlossen** (`app/api/team/fetchsingleteaminfo`) ·
> Positions-Platzhalter vereinheitlicht · **Newsfeed-Filter ragte in den Feed**.
> ⚠️ **Der Sicherheitsfix allein reichte nicht:** Er stoppt das Leck, entwertet aber nicht die
> zwei bereits abrufbaren Token (`send-invite-email` erneuert nur `if (!claimToken)`,
> `slotsFreigeben` fasst offene Plätze nie an). Die zwei Token auf `hoops_prod` wurden deshalb am
> 15.08. **rotiert** (Entscheidung Patrick; `tmp/prod-claimtoken-rotieren.mjs`, Beleg über die
> Tokenlänge: 0 alte / 2 neue, `add-slot` erzeugt 32 Hex-Zeichen, die Rotation 48).
> ⚠️ **Folge, die jemand wissen muss:** Die bis dahin verschickten Einladungslinks dieser zwei
> Kaderplätze sind tot. Der Team-Admin (Mönchengladbach Scorpions e. V.) muss sie im Panel neu
> verschicken – **niemand hat ihn benachrichtigt.**
> ⚠️ **Zur Zeile selbst:** Hier stand `cabb62d`, am Server lief `da1abca`. Das war diesmal
> harmlos (`da1abca` ist ein reiner Doku-Commit direkt nach `cabb62d`, also derselbe Code) –
> aber die Zeile soll ab jetzt den **Zeiger nennen, den `git log` AM SERVER ausgibt**, nicht den
> Commit, den man für den letzten Codestand hält.
> Davor: **`cabb62d`** – fünfte Runde: **alle elf
> offenen Gate-Punkte** aus Roadmap 15 abgearbeitet. Kern: **`lib/scrollSperre.js`** (zwei Overlays
> hinterließen bei falscher Schließreihenfolge eine **dauerhaft gesperrte Seite** – nur ein Reload
> half) · Hinweis auf `/team/create` für alle, die dort landen, obwohl sie im Kader stehen (sonst
> versehentlich ein Zweitverein) · Kaderkarte ohne doppelte Position (die rechte Spalte trägt jetzt
> **nur** Status) · Glocken-Leerzustand für alle Rollen · Tour-Schritt 3 ausgeloggt ehrlich ·
> optimistisches Speichern wird bei Fehlern zurückgenommen. Davor: **`551ab46`** – vierte Runde: **Notiz an den
> verdrängten Team-Admin** (`team_admin_revoked`; er verlor die Rechte seit der dritten Runde und
> hätte es erst gemerkt, wenn `/team/admin` ihn abweist – ausgelöst an **drei** Stellen, inkl. dem
> `remove`-Zweig, der ebenfalls schwieg) · Klickziel bewusst **nicht** `/team/admin`, sondern die
> Vereinsseite · Notiz erst **nach** dem Speichern des Nachfolgers, sonst nennt sie jemanden, der
> nie einer wurde. Davor: **`2503433`** – dritte Runde: **stille Notiz
> an den umgehängten Spieler** (neuer Typ `team_assigned`; er war sonst die einzige Person, die von
> einer Änderung an seinem Profil nichts erfährt – nur bei ECHTER Zuordnungsänderung) ·
> **Symbol-Tabelle `NOTIF_ICON` für BEIDE Glocken** (die in `Navbar.js` hatte gar keine und zeigte
> für jeden Typ einen Basketball) · **verdrängter Team-Admin verliert seine Rechte** (er behielt
> über `teamAdminOf` vollen Zugriff auf `/team/admin`, obwohl das Team auf jemand anderen zeigte –
> in `setteamadmin` UND `transfer-team-admin`) · `positionLabel` mit `hasOwnProperty`
> (`position: "__proto__"` hätte `/spieler` und `/transfermarkt` für alle Besucher zerlegt).
> Davor: **`9f9fb77`** – zweite Runde des Tages:
> **Admin-Korrekturen posten nicht mehr öffentlich** (`recordTransfer({ still: true })`, nur in
> `setteamadmin` – Entscheidung Patrick auf Kais Befund) · **Rechtsverweise auf ALLEN drei
> kontoerzeugenden Wegen** (`components/layout/RechtsLinks.js`; sie fehlten auf `/team/join` und
> `/team/claim` völlig – Noras einziger Pflichtpunkt, Art. 13 DSGVO/§ 5 DDG) · **„ab 16" wird
> begründet, bevor das Formular ausgefüllt ist** (Neles Texte auf `/signup`, `/about`, beiden
> Einladungsseiten; die sechs Mindestalter-Meldungen liegen jetzt in `lib/constants.js`) ·
> **Sicherheitsfix `positionLabel`** (`position: "__proto__"` gab `Object.prototype` zurück und
> hätte `/spieler` und `/transfermarkt` für alle Besucher zerlegt – Befund Kai) · Fokusfalle,
> mobiles Menü mit Escape, Avatar-Zitat im Textfluss.
> Davor: **`5b84f69`** – Linas erster Einsatz: **Plattform-Tour ohne Konto**
> repariert (sie ist über den Footer ausgeloggt erreichbar und meldete dort einen Speicherfehler
> über einen Versuch, den es nie gab; Schlussfolie „Du hast schon angefangen" über „0 von 4 · 0 %";
> beide Ausgänge führten in die Anmeldemaske) · **Tour-Schritt 1 versprach zu viel** (doppelt
> bestätigt ist das *Ergebnis*, nicht der Box-Score) · **„Mein Profil" wird im Onboarding
> demonstriert** (Avatar-Zitat) · Klickflächen, Escape in der Suche, Transfer-Protokoll in
> `setteamadmin`. Nach Gates von Kai und Tobias, deren Befunde in `582d59d` eingearbeitet sind.
> Davor: `3c38959` (Altersnachweis, s. u.), `5073951` (Alt-Ligen bleiben bedienbar), `560e1e6`
> (**Newsfeed-Umbau**: Spieltag-Leiste am Kopf; Footer mit Impressum/Datenschutz, das fehlte dort
> völlig; `h1`; mobil beginnt der Feed 500 px weiter oben), `27a04fe` (Kaderplatz-Freigabe, acht
> Wege), `e7a38ce`, `275f124` (Nachtschicht).
> **Rollback-Kette:** `04ba621` (aktuell live) → `07150cf` (nur Werkzeug) → `d2cfa47` → `35b8bc0` → `d841c4b` → `bd99263` (Dunk, vor den
> Gate-Befunden) → `062989e` (letzter Stand vor dem Hero-Umbau) → `a4c6811` → `cf02293` →
> `7da3905` → `96eba14` → `da7756b` → `aff17e6` → `787d760` → `cc128ed` → `dba7baa` → `f4c2d15` → `e00b64a` → `f27736a` → `40dff48` → `f5b1b3f` → `f46a783` → `84cb7ba` → `75f2c3a` → `bc7ccad` → `6e2fbe1` → `1bcf854` →
> `4d03ba2` → `76aa289` → `1d2e3ae` → `1dc617f` → `d07c475` → `2be664e` → `cd51c92` →
> `164c784` (der Stand vor dieser Serie, bis 17.08. live) → `66f9000` → `4f64af7` → `4f3811d` (Newsfeed-Umbau,
> von beiden Gates blockiert – NICHT dorthin zurück) → `f23757b` → `074bcf1` (letzter Stand vor
> dem Newsfeed-Umbau) → `48e8a16` → `c65419d` → `da1abca` (der Stand vom
> 15.08. vor dieser Runde) → `cabb62d` (fünfte Runde) → `551ab46` (vierte Runde 14.08.) → `2503433` (dritte) → `9f9fb77` (zweite) →
> `5b84f69` (erste) → `5197d2c` (der Stand, der bis zum 14.08. tatsächlich lief) → `3c38959` →
> `5073951` → `560e1e6` → `27a04fe` → `e7a38ce` → `275f124` → `a8e4fd4` (vor der Nachtschicht) →
> `562c629` (vor dem gesamten Redesign). Auf dem VPS per
> `git checkout <hash> && npm run build && pm2 restart hoops-v2`.
> ⚠️ **Zum zweiten Mal in zwei Tagen stimmte diese Zeile nicht:** Sie führte `3c38959` als
> zuletzt deployt, auf dem Server lief aber `5197d2c` (am 13.08. war es `78d833a` gegen
> tatsächlich `a8e4fd4`). Der Grund ist immer derselbe – es wird committet und die Zeile
> gepflegt, ohne dass derselbe Vorgang auch deployt. **Vor jedem Rollback am Server nachsehen
> (`ssh … "cd /root/hoops-v2 && git log --oneline -1"`), nicht dieser Zeile glauben.**
>
> ⚠️ **PLATTFORM AB 16 JAHREN** (Entscheidung Patrick, 13.08.2026). Wirkt an **fünf** Stellen:
> `LEAGUE_AGE_GROUPS` = `["Senioren", "U18"]` (eine U16-Liga ist die Altersklasse UNTER 16) ·
> **`/signup`**, **`/team/join/[token]`** und **`/team/claim/[token]`** verlangen die
> Selbstauskunft „mindestens 16" · `playerregister` erzwingt sie **serverseitig** ·
> der **Google-Weg** legt neue Konten nur mit dem Cookie `g_oauth_minage` an ·
> `update-profile` weist ein **neu eingetragenes** Geburtsdatum unter 16 ab.
> Bewusst **kein Pflicht-Geburtsdatum**: `age`/`birthdate` sind über die öffentliche Profil-API
> einsehbar – ein Pflichtfeld hätte die Datenmenge vergrößert. Beleg je Konto:
> `Player.minAgeConfirmedAt`.
> Auf `hoops_prod` wurden 9 U16-Ligen, 4 Demo-Teams, 4 Beispielprofile entfernt; **kein echter
> Datensatz war betroffen, 0 echte Profile unter 16**.
> ⚠️ Ein Test in `tests/e2e/auth.spec.mjs` liest den **Quelltext** und prüft, dass jeder
> Aufrufer von `playerregister` die Bestätigung mitschickt – genau diese Lücke ließ die
> Einladungswege an 19 grünen Tests vorbei brechen. **Neuer Aufrufer ⇒ Feld mitschicken.**
> ✅ **Geklärt am 14.08.2026 (Nora, `docs/RECHT-MINDESTALTER-2026-08-14.md`): Die Selbstauskunft
> ist das richtige Instrument und darf NICHT zur Einwilligung umgebaut werden.** Art. 8 DSGVO
> greift nur bei Einwilligung als Rechtsgrundlage – die Datenschutzerklärung nennt aber Vertrag
> (lit. b); und „Ich bin mindestens 16" ist eine **Tatsachenangabe, keine Willenserklärung**
> (man widerruft sein Alter nicht), als Einwilligung formuliert trüge der Satz im Streitfall
> nichts. Art. 28 DSA stützt zusätzlich die Entscheidung gegen ein Pflicht-Geburtsdatum.
> ⚠️ Beim Anwalt (im ohnehin geplanten Termin, kein neuer Kostenpunkt): **§§ 107, 108 BGB** –
> ist der unentgeltliche Nutzungsvertrag mit einem 16-Jährigen ohne Eltern wirksam? Wenn nein,
> wackelt lit. b. Dazu F4-a bis F4-c aus Noras Befund.
> ⚠️ Der Google-OAuth-Weg ist lokal nicht testbar (keine Keys) – **einmal echt auf Prod
> durchspielen**.
> ⚠️ **Entscheidbar für Patrick:** Bestandskonten von vor dem 13.08. haben keinen Altersbeleg,
> und `models/Player.js` verbietet zu Recht das nachträgliche Setzen. Einmalige Bestätigung
> beim nächsten Login? In der Testphase billig.
>
> ⚠️ **Wer `Player.teamId` ändert, MUSS `slotsFreigeben` aufrufen** – die verbindliche Liste aller
> acht Wechselwege steht im Kopf von `lib/rosterSlots.js`. Sie war dreimal hintereinander
> unvollständig (zwei → vier → acht); zweimal erzeugte der Fix selbst ein Folgeproblem
> (verwaister `claimToken` = wiederverwendbarer Einladungslink; leerer Kaderplatz ohne
> Einladungs-Knopf). Beides gefunden von Kai, beides vor dem Deploy behoben.
>
> 🌙 **NACHTSCHICHT 13.08.2026** (Details: Chronik) – autonom gelaufen, sechs Stränge. Kern:
> **Ronjas Retention-Befund** (`docs/RETENTION-BEFUND-2026-08-13.md`) – **keine fehlende
> Funktion**, sondern überall fehlende **Verbindungen** zwischen bereits Gebautem. Ergebnis u. a.
> Benachrichtigung „Deine Zahlen stehen", Liga-Achse, `/tryouts`-Wege, Tour mit echten Handlungen.
>
> 🔎 **ENTDECKBARKEIT 14.08.2026** – **Lina Vogts erster Einsatz**
> (`docs/ENTDECKBARKEIT-BEFUND-2026-08-14.md`): Sie fragt nicht wie Ronja „warum kommt jemand
> **wieder**", sondern „findet ein Erstbesucher es beim **ersten** Mal überhaupt". Ihr Kernbefund
> war ein Defekt, den niemand gesucht hatte: Die **Plattform-Tour ist über den Footer ausgeloggt
> erreichbar** – die einzige Fläche, die vor der Registrierung erklärt – und war dort kaputt
> (Speicherfehler ohne Speicherversuch; „Du hast schon angefangen" über „0 von 4 · 0 %"; beide
> Ausgänge in die Anmeldemaske). Alles behoben, Wortlaute von Nele, Gates von Kai und Tobias.
>
> ⚠️ **Das wichtigste Dokument bleibt `docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md`** – *eine Zahl
> oder Aussage, die im Sinne des Codes stimmt und im Sinne des Lesers falsch ist*. Acht Fälle am
> 13.08. (u. a. Sponsoren-Report mit ungefilterten Beständen **und Klarnamen echter Spieler** –
> behoben, niemandem gezeigt), **vier weitere am 14.08.**: Tour-Schritt 1 versprach eine doppelte
> Bestätigung der **eigenen Zahlen** (doppelt bestätigt ist das **Ergebnis**, den Box-Score trägt
> **ein** Team-Admin ein) · der Such-Platzhalter verschwieg die mitdurchsuchten Ligen · „oben
> rechts" zeigte auf einen Avatar, den öffentliche Seiten nicht haben · und **mein eigener Fix
> erzeugte den nächsten Fall** (ein längst verfügbarer Spieler wurde aufgefordert, sich als
> verfügbar einzutragen – Befund Kai). **Vor jeder nutzersichtbaren Zahl oder Zusage dieses
> Dokument lesen.**
>
> 📜 **Vollständige Meilenstein-Chronik mit Commit-Hashes: `docs/CHRONIK.md`** (am 08.08.2026 wörtlich und
> verlustfrei aus diesem Abschnitt ausgelagert – dort stehen ALLE datierten Protokolle seit dem Go-Live).

### ⚠️ KRITISCHE Warnungen (vor jeder Arbeit lesen)
- **Datenbanken (KRITISCH – vor schreibenden DB-Aktionen lesen):** Cluster `hoops.tbhsg.mongodb.net`:
  - **`hoopsgermany`** = lokale **Dev-DB** des v2-Neubaus (lokales `.env`). `seed-demo.mjs` darf hier löschen/neu anlegen.
  - **`hoops_prod`** = **Produktiv-DB der Live-Seite v2** – schreibende Aktionen nur gezielt und abgestimmt.
  - **`test`** = **PRODUKTIV-DB der alten Live-Seite** (alter Code verbindet ohne DB-Namen → Default `test`).
    Echte Nutzer/Feedback. **NIEMALS schreiben/löschen.** Alte `test`-Daten erst beim **Cutover** löschen
    (alte Seite läuft bis dahin als Fallback). Launch-Entscheidung (final mit Patrick & Jonatan):
    kompletter Neustart, **keine Migration**.
- **Projektort:** `~/Projekte/hoops-germany-v2` (macOS, seit 15.08.2026) – **NICHT in einen
  synchronisierten Ordner legen**. Ein Sync-Dienst greift dauernd auf `.next/` und `node_modules/`
  zu, während Build und Dev-Server dort schreiben; unter Windows sperrte OneDrive dadurch `.next`.
  Auf dem Mac heißen die Kandidaten **iCloud Drive** (`~/Library/Mobile Documents/…`, auch
  `~/Desktop` und `~/Documents`, sobald „Schreibtisch & Dokumente" synchronisiert wird) und
  **Dropbox** (`~/Dropbox`). `~/Projekte` liegt bewusst außerhalb davon.
- **`npm run build` NIE parallel zu laufendem `next dev`** (überschreibt dessen `.next`-CSS → ungestylte
  Seiten/CSS-404; Dev-Server danach neu starten). Nach Dev-Server-Lock ggf. `.next` löschen vor dem Build.
  ⚠️ **Vor jedem Build den Port prüfen** – auf dem Mac (seit 15.08.2026) mit:
  ```bash
  sh scripts/port-frei.sh && npm run build
  ```
  Das Skript braucht keine Angabe zum System: Es hat **eine** Weiche, und die trennt Windows von
  allem anderen – macOS fällt in den POSIX-Zweig, nimmt dort `ss` falls vorhanden, sonst
  `lsof -tiTCP:3000 -sTCP:LISTEN` (auf dem Mac also `lsof`). Exit 1 = belegt, Exit 2 = nicht prüfbar.
  Ohne Skript geht auch `lsof -tiTCP:3000 -sTCP:LISTEN` oder schlicht ein `curl` gegen
  `http://localhost:3000`. **Nicht die Windows-Zeile `netstat -ano` übernehmen** – macOS lehnt sie
  mit „illegal option -- o" ab, und `-p` bedeutet hier **Protokoll**, nicht Prozess. ⚠️ `netstat -an
  | grep LISTEN` **funktioniert** auf dem Mac dagegen sehr wohl (am 15.08.2026 nachgemessen: findet
  die Listener); es nennt nur **keine PID**, taugt also zum Erkennen, nicht zum Beenden.
  ⚠️ **Der Grund für die Prüfung ist plattformunabhängig und bleibt:** `preview_stop` beendet den
  Dev-Server **nicht**, es löst ihn nur aus der Verwaltung – der Node-Prozess hält Port 3000
  weiter. Am 15.08.2026 lief ein Build zweimal in einen laufenden Dev-Server hinein, einmal davon
  trotz fünf vorheriger korrekter Prüfungen.
  *Historisch (Windows, bis 15.08.2026): Dort schrieb das deutsche `netstat` **`ABHÖREN`** statt
  `LISTENING`, weshalb `netstat | grep LISTEN` einen belegten Port als frei meldete – am 12.08.2026
  lief der Build genau deshalb in einen fremden Dev-Server. Auf dem Mac ist das gegenstandslos.*
- **Schema-Änderungen an Modellen greifen erst nach Dev-Server-Neustart** (mongoose cached das Model).
- **Vor Deploy immer die Production-Runtime testen** (`npm start`), nicht nur `next dev` (populate-Bug-Lehre).
- **Bei Neu-Deploy/Server-Umzug:** `deploy/nginx-hoopsgermany.conf` nach `/etc/nginx/sites-available/default`,
  Upload-Verzeichnisse `/var/www/hoops-uploads/{players,team,posts}` + Symlinks aus `public/…`
  (chown root:www-data, chmod a+rX) neu anlegen – sonst sind Bild-Uploads kaputt (Details: Chronik, 26.06./27.06.).

### 📣 Verständlich schreiben – Patrick ist kein Programmierer

*Angeordnet von Patrick am 17.08.2026, projektübergreifend. Wortgleiche Regel im General
Backoffice (Arbeitsregel 9) und in HomeGrow Homie (§11).*

Patrick ist studierter Marketier und seit fünf Jahren im Vertrieb. **Alle Erklärungen –
Befunde, Gate-Berichte, Deploy-Zwischenstände, Optionen – müssen so formuliert sein, dass
ein Informatik-Laie sie versteht.**

Das ist keine Höflichkeitsregel. Er trifft jede Entscheidung; wer ihm den Sachverhalt in
Fachsprache vorlegt, verlagert die Beweislast auf den, der entscheidet. **In diesem Projekt
wiegt das schwerer als anderswo**, weil hier eine Live-Plattform mit echten Nutzern hängt.

- **Reihenfolge umdrehen:** erst was es für die Plattform und ihre Nutzer bedeutet, dann der
  technische Mechanismus. Nicht „PM2-Prozess neu gestartet", sondern „die Seite läuft wieder
  mit dem neuen Stand – technisch: PM2 neu gestartet".
- **Jeden Fachbegriff bei erster Nennung übersetzen** – nicht streichen. Commit, Push und
  Deploy benutzt er selbst.
- **Bilder aus seiner Welt nutzen.** Er denkt in Rollen, Zuständigkeiten und Abläufen.
- **Nichts weglassen.** Verständlich heißt nicht dünner. Gerade hier: Ein Befund, den er nicht
  versteht, ist praktisch verschwiegen – auch wenn er dasteht. Die Deploy-Warnzeile oben war
  laut eigener Chronik schon dreimal falsch; solche Dinge müssen ankommen.
- **Auf Zuruf tiefer:** Sagt er „technisch", kommt die Detailebene.
- Kein Ton von oben herab. Ihm fehlt Vokabular, nicht Urteilsvermögen.

**Gilt nicht für nutzersichtbare Texte.** Diese Regel betrifft die Kommunikation MIT Patrick.
Was auf der Plattform steht, folgt weiterhin der Kernpositionierung und Neles Tonalität.

### Projektort & Umgebung
- **Lokaler Pfad: `~/Projekte/hoops-germany-v2`** auf macOS (Umzug von Windows am 15.08.2026,
  Hintergrund: `docs/UMZUG-WINDOWS-MAC.md`). **Nicht in einen synchronisierten Ordner verschieben** –
  iCloud Drive (inkl. `~/Desktop`/`~/Documents` bei aktiver Synchronisierung) und Dropbox greifen
  in `.next/` und `node_modules/` hinein, während dort gebaut wird. Genau daran scheiterte unter
  Windows OneDrive.
- **Agenten & Skills auf macOS nachgezogen (15.08.2026, Protokoll in der Chronik):** Vier Verweise
  zeigten ins Leere, obwohl die Dateien migriert **aussahen** – u. a. Maliks Pflicht-Skill
  `team-ausstattung` (liegt unter `~/.claude/skills/`, nicht im General Backoffice) und fünf
  **Zwitter-Pfade** `~\.claude\skills\` (macOS-Tilde + Windows-Backslashes, auf keinem System
  auflösbar). ⚠️ **Regel daraus:** Beim Umschreiben von Pfaden jeden neuen Pfad **gegen das
  Dateisystem halten**, nicht nur den Text lesen – „0 Ersetzungen" ist kein Erfolg, sondern ein
  unbeantworteter Zustand. Ebenso: Ein INSTALL-VERMERK beschreibt auch Zustand **außerhalb**
  seines Ordners (`~/.config/watch/.env` fehlte, der Skill hätte stumm neu eingerichtet).
- Next.js **14.2.35**, App Router, JavaScript (kein TS), Tailwind.
- `.env` lokal vorhanden (MongoDB-Atlas, `SECRET_KEY`, `CRON_SECRET`, `NEXTAUTH_URL=http://localhost:3000`). SMTP/Google noch leer.
- Start: `npm run dev` → http://localhost:3000. DB-Test: `node scripts/dbcheck.mjs`.
- **Demo-Daten befüllen: `node scripts/seed-demo.mjs`** (4 Teams, 18 Spieler + 2 Super-Admins,
  Liga 2025/26 + Vorsaison-Transfer für Max, abgeschlossene Spiele + Box-Scores, Posts, Follower,
  Bundesländer/Städte → Stats/Topscorer/Tabelle/Spielplan/Stationen/Geo-Filter gefüllt).
- **Test-Accounts (alle PW `test123`) – wirksam NUR NOCH auf der Dev-DB `hoopsgermany`:**
  Spieler `max@test.de` (= Team-Admin „Test Baskets",
  hat FIBA/Instagram + Vorsaison-Transfer), weitere `@test.de`, Free Agents `sven.adler@test.de`/`jay.carter@test.de`.
  **Super-Admins** (Spieler-Login): `p.schemura@gmail.com`, `jonatanbaenavides@gmail.com`;
  /admin-Panel: `admin`/`geheim1234` ODER `patrick`/`test123` · `jonatan`/`test123`. **`team@test.de` existiert NICHT mehr**.
  > 🔒 **VORFALL 15.08.2026 – diese Konten waren auf PROD anmeldbar.** Beim Newsfeed-Umbau lief
  > ein Login-Aufruf versehentlich gegen die Live-Seite statt gegen localhost – und
  > **`max@test.de` / `test123` funktionierte dort**, als **Team-Admin mit `teamAdminOf`**.
  > Das Passwort steht in dieser Datei: Wer die Projektdoku liest, konnte sich als
  > Vereinsverwalter anmelden – Kader ändern, Ergebnisse eintragen, Einladungen verschicken,
  > also in genau die Belegbarkeit hineinschreiben, die das Produkt verkauft. Das wog schwerer
  > als der `claimToken`-Leak vom selben Tag: Dort brauchte es erst einen Token aus einer
  > API-Antwort, hier genügte eine Zeile Dokumentation.
  > ⚠️ **Mein erster Riegel war unvollständig – zweimal falsch, beides Befund Kai (A1/A2).**
  > Ich meldete „47 Konten entwertet, der Riegel sitzt". Beides stimmte nicht:
  > **(1) Die Inventur war zu eng.** Ich suchte nach **Adressmustern** und übersah dadurch
  > die Domain **`@demo.de`** aus `seed-world.mjs` – **345 Konten** mit `test123`. Kais
  > Ansatz findet sie sofort: nicht nach Domains suchen, sondern die bekannten Passwörter
  > gegen **jeden Hash** probieren. Gemessen: **346 Konten mit bekanntem Passwort, davon
  > 41 Team-Admins.**
  > **(2) Das Passwort ist gar nicht der entscheidende Weg.** Zwei Pfade lesen `password`
  > **nie**: `app/api/auth/google/callback` matcht per `$or: [{googleId}, {email}]` und
  > adoptiert ein bestehendes Konto ohne jede Prüfung · `forgotpassword` → `resetpassword`
  > ist unauthentifiziert, ungedrosselt und verlangt kein altes Passwort. **Beide hängen an
  > der E-Mail-Adresse.** Und **`nrw-demo.de` war NICHT REGISTRIERT** (RDAP: 404) – wer sie
  > für ~5 € kauft, besitzt die Postfächer von 30 Prod-Konten, davon 6 Team-Admins.
  > **Lehre:** Eine Inventur nach Namensmuster findet, was man schon vermutet. Und
  > „Passwort entwertet" ist nur dann ein Riegel, wenn das Passwort der einzige Weg ist.
  >
  > **ERLEDIGT (15.08.2026, `tmp/prod-seedkonten-schliessen.mjs`):** Bei **393** Seed-Konten
  > wurde **`.invalid` an die bestehende Domain angehängt** (`…@nrw-demo.de` →
  > `…@nrw-demo.de.invalid`) und **346 Passwörter entwertet**.
  > RFC 2606 reserviert `.invalid` dauerhaft – die Endung ist von niemandem registrierbar,
  > damit sind Google-Adoption und Passwort-Reset tot. Anhängen statt ersetzen hält die
  > Eindeutigkeit des Index und ist umkehrbar. Der **Login per Passwort** funktioniert unter
  > der neuen Adresse weiter, denn dort ist die E-Mail nur ein Zeichenvergleich.
  > **Nachgemessen, live:** Konten mit bekanntem Passwort **346 → 0**, Konten auf der freien
  > Domain **30 → 0**, Anmeldung mit den alten Adressen → **401**, `forgotpassword` erzeugt
  > **keinen** Reset-Token (die 200-Antwort ist die gewollte Anti-Enumeration).
  > **Rollen und Kader unverändert:** 50 Team-Admins, 354 Kaderzugehörigkeiten – vorher wie
  > nachher. **Die Dev-DB ist unberührt** (18 Konten auf `@test.de`, 0 auf `.invalid`) –
  > die Testsuite hängt an genau diesen Konten.
  > **Nicht gelöscht** – 354 stehen in Kadern, 50 verwalten Vereine; das gehört an den
  > Demo-Purge (Roadmap 2). ⚠️ Die 18 `@test.de` tragen **kein `seedTag`**, die
  > Purge-Befehle erfassen sie also **nicht**; sie können dort nur sein, weil
  > `seed-demo.mjs` (die **Dev**-Basis) irgendwann gegen `hoops_prod` lief – protokolliert
  > ist das nirgends.
  ⚠️ **Demo-Team-Admin `demo.coach@nrw-demo.de`: Zugang ist WEG, und das war MEIN Fehler.**
  Patrick hatte am 15.08.2026 ausdrücklich Option 3 gewählt: Konto bleibt nutzbar, offene
  Flanke bewusst in Kauf genommen. Mein Skript hat dann **jedes** Konto mit bekanntem
  Passwort entwertet – also auch dieses. Die Adresse lautet jetzt
  `demo.coach@nrw-demo.de.invalid` und ist als Login gültig, **das Passwort ist es nicht**
  (401 nachgemessen). Wiederherstellen = Passwort auf dieser Adresse neu setzen; ein
  Passwort, das Patrick nicht kennt, setze ich nicht von mir aus.
  ⚠️ **OFFEN, der schwächste verbliebene Punkt:** Die **`admins`-Sammlung** auf `hoops_prod`
  hat zwei Einträge, `patrick` und `jonatan`, **beide mit bekanntem Passwort** – das ist das
  `/admin`-Verwaltungspanel. Nicht angetastet, weil ich dort kein Passwort setze, das
  Patrick danach nicht kennt. Siehe Roadmap 1.
  ✅ Die beiden **Super-Admin-Spielerkonten** (`@gmail.com`) sind sauber: Passwörter
  nachweislich **nicht** bekannt.

### Versionierung / Backup
- **Off-Machine-Backup: privates GitHub-Repo `github.com/Schemura98/hoops-germany-v2`.**
- Branches: **`main`** = sauberer Wiederherstellungspunkt (v2 vor Redesign), **`redesign`** = aktiver
  Arbeits-Branch (hier wird gearbeitet, nach jedem Meilenstein committen + pushen).
- `.env` ist gitignored; nur `.env.example` (leer) ist eingecheckt.

> 📌 **KONVENTION (verbindlich): Fortschritt IMMER dokumentieren.** Nach **jedem Meilenstein/Commit**:
> diesen **Abschnitt 0 kompakt aktualisieren** (Stand + Roadmap pflegen – verdichten statt anhäufen) und das
> **vollständige Meilenstein-Protokoll (was umgesetzt wurde + Datei-/Endpoint-Namen + Commit-Hash) unten an
> `docs/CHRONIK.md` anhängen**. CLAUDE.md ist die **kanonische, session-übergreifende Quelle** – das private
> Session-Gedächtnis ersetzt sie nicht. Dafür gibt es die Skill **`log-progress`** (`.claude/skills/log-progress/`).
> Nur Verifiziertes als fertig markieren; Offenes klar als offen führen.
>
> 📌 **KONVENTION (verbindlich): Bei neuen Funktionen Feedback & Analytics mitpflegen.** Wird ein
> **neuer nutzersichtbarer Bereich/eine neue Funktion** gebaut, das **Feedback-Formular** (Themen-Chip
> in `app/feedback/page.js` `AREAS`) und das **Analytics-Tool** (Bereichs-Bündelung im `$switch` von
> `app/api/analytics/summary/route.js`; bei zählbarer Kennzahl zusätzlich Plattform-Überblick +
> `app/admin/analytics/page.js`) aktualisieren. Dafür gibt es die Skill **`update-feedback-analytics`**
> (`.claude/skills/update-feedback-analytics/`).
>
> 📌 **KONVENTION (verbindlich): Bei neuen Funktionen die Onboarding-/Erklär-Flächen mitpflegen.** Wird ein
> **neuer nutzersichtbarer Bereich/eine neue Kernfunktion** gebaut, prüfen, ob die **Startseite** (Feature-Cards
> `app/page.js` `features` + `components/landing/*`), die **Plattform-Tour** (`components/onboarding/
> WelcomeTour.js`), die **Navigation** (Navbar/PlayerNav/Footer – neuer Bereich MUSS erreichbar sein) und die
> **Onboarding-Checklist** (`components/onboarding/OnboardingChecklist.js`) mitwachsen müssen. **Rechtstexte
> (Impressum/Datenschutz) nur bei echten Faktenänderungen/Dritt-Diensten – im Zweifel dem User zur rechtlichen
> Prüfung melden, nicht selbst formulieren.** Dafür gibt es die Skill **`update-onboarding-surfaces`**
> (`.claude/skills/update-onboarding-surfaces/`).
>
> 📌 **KONVENTION (verbindlich): Feature-/Scope-Entscheidungen gegen die Bedarfsanalyse prüfen.**
> Pflicht-Startpunkt bei neuen Features oder Priorisierungen: **`docs/BEDARFSANALYSE-2026-08-09.md`**
> (Marktforscher **Mats**, globale Agenten-Definition `~/.claude/agents/marktforscher.md`) — inkl. der
> „wird NICHT gebraucht"-Liste (kein Team-Chat, keine Trainingsverwaltung, keine Live-Ticker/Heatmaps).
> Nach Implementierung nutzersichtbarer Funktionen prüft die Nutzungs- & Retention-Analystin **Ronja**
> (`~/.claude/agents/retention-analystin.md`) die Hypothesen H1–H7 der Analyse am Live-Produkt
> (Nutzerbrille, ehrliche Retention-Hebel, keine Dark Patterns); ihre Befunde gehen an Mats zurück.
> Beide sind Vorschlags-Instanzen — kein Gate, Priorisierung entscheiden Patrick & Jonatan.
> **Zielgruppen-Seite dazu: `docs/ZIELGRUPPEN.md`** (Marketing-Managerin **Nele**,
> `~/.claude/agents/marketing-manager.md`, angelegt 12.08.2026) — kanonische, session-übergreifende
> Definition der fünf Zielgruppen (Liga-Spieler NRW · Team-Admins/Ehrenamt · Vereinslose ·
> Vereinsverantwortliche · lokale Sponsoren) mit „wo erreichbar / was motiviert / was schreckt ab /
> welche Ansprache", der „ist NICHT Zielgruppe"-Liste und durchgängiger Kennzeichnung
> **[BELEGT] / [INDIZ] / [HYPOTHESE]**. Pflicht-Startpunkt für Kampagnen, Werbematerial und Copy;
> **Änderungen an den Zielgruppen nur mit Patrick.**
>
> 📌 **KONVENTION (verbindlich): Vor jedem Deploy zwei Gates.** `npm run build` + Playwright
> (`npx playwright test -c tests/e2e/playwright.config.mjs`) und die Production-Runtime (`npm start`,
> nicht nur `next dev`) — danach **Kai** (`test-automatisierung`, Skills `security-review` + `review`
> auf `git diff origin/redesign..HEAD`) und für nutzersichtbare Änderungen **Tobias**
> (`qa-reviewer`, global unter `~/.claude/agents/`) als unabhängiges Browser-Gate, **mobil zuerst**.
> ⚠️ Vor Testläufen prüfen, ob ein fremder Dev-Server auf Port 3000 hängt; `npm run build` nie
> parallel dazu. Prüfskript: `sh scripts/port-frei.sh [PORT]` (Vorgabe 3000, Exit 1 = belegt) –
> taugt als Vorschaltung: `sh scripts/port-frei.sh && npm run build`. ⚠️ Ist die Browser-Vorschaufläche ausgeblendet, laufen **keine** rAF-Frames
> (`document.hidden`) — Scroll-/Animationsmessungen dort sind eingefroren und täuschen Fehler vor;
> dann Playwright gegen echtes Chromium nutzen (Muster: `tmp/hero-preview.mjs`).

### Architektur-Konventionen (etabliert, bitte beibehalten)
- **lib/**: `db.js`, `auth.js`, `serverAuth.js` (`getPlayerFromToken`, `getTeamFromToken`=Dual-Auth, `getAdminFromToken`), `clientAuth.js`, `apiResponse.js` (`ok`/`fail`/`withErrorHandling`), `slug.js`, `matchScore.js`, `timeAgo.js`, `constants.js`, `useCurrentPlayer/Team/Admin.js`.
- **API-Pattern**: `connectDB()` → prüfen → Logik → `ok()/fail()`, in `withErrorHandling`.
- **Modelle**: immer `mongoose.models.X || mongoose.model("X", …)`. ⚠️ Schema-Änderungen an Modellen greifen erst nach **Dev-Server-Neustart** (mongoose cached das Model).
- **Teams sind spieler-geführt:** kein eigener Team-Login mehr. Ein Spieler gründet ein Team via
  `/team/create` → wird Admin (`adminPlayerId`, `isTeamAdmin`, `teamAdminOf`, eigenes `teamId`).
  Verwaltung von `/team/admin` läuft über den **Spieler-Token** (Dual-Auth). `/team/login` &
  `/team/register` sind nur noch Redirects. `Team.email` ist optional (sparse).
- **Design-Sprache „Anzeigetafel“ (seit 12.08.2026, Spezifikation `docs/VISUELLE-RICHTUNG-2026-08-12.md`):** nachtblauer Grund `navy-950 #0B1220` (Navigation `navy-900 #111A2E`, Panels `navy-800 #182543`, Hover/Eingaben `navy-700 #223058`, Rahmen `navy-600 #3D5080`), Text `paper-50` / gedämpft `mist-300|400|600`, **ein** Akzent = das echte Logo-Orange `brand-500 #F07A27`, semantische Status in `signal-ok|wait|error`. Schriften: **Big Shoulders Display** (`font-display`, Headlines ab `text-2xl`, Eyebrows, große Zahlen), **Geist** (`font-sans`, Fließtext/UI), **Geist Mono** (`font-mono tabular-nums`, Zahlen in Tabellen) – Geist fehlt im Font-Katalog von Next 14.2.35, deshalb selbst gehostet aus `public/fonts/` über `next/font/local` (`lib/fonts.js`); nachladbar mit `sh scripts/fetch-fonts.sh` (holt das latin-Subset als woff2, `--dry` zeigt nur an). Radien gestuft 6/10/16px (`rounded-sm|md|lg`). **Farbentscheid Patrick 12.08.2026:** Navy statt des ursprünglich von Vivien vorgeschlagenen warmen Braun – Navy + Orange ist für ihn die Basketball-Paarung. Die Skala heißt deshalb `navy-*`; die Stufung ist unverändert, nur der Farbton wechselte. Werte von Vivien gerechnet (`docs/WOW-KONZEPT-2026-08-12.md` Abschnitt 0). **Keine Verläufe, keine Schatten, kein Glow** – Tiefe entsteht aus Flächenstufe + 1px-Haarlinie. Signatur: 2px `brand-500`-Leiste an genau drei Stellen (Unterkante Navbar/PageHeader, Oberkante der einen hervorgehobenen Karte, aktive Stat-Zahl). Primärbutton = orange Fläche mit **dunklem** Text (`text-navy-950`, 6,88:1) – weiß auf Orange wäre 2,61:1. Icons: `react-icons/pi` (Phosphor Bold), **nicht** mehr `fa`. `app/globals.css` setzt `color-scheme: dark`, damit auch browsereigene Bedienelemente dunkel rendern. Echte Assets in `public/images/` (`logo.svg` = weiße Wortmarke für Navy-Navbar; `logo-hoops.svg` = dunkle Variante, seit dem Redesign nirgends mehr im Einsatz; `login image.jpg`/`signupImage.jpg` = Motive der Auth-Seiten (der **Hero der Startseite trägt seit 12.08.2026 kein Foto mehr**), jeweils mit AVIF/WebP-Varianten `login-image-1000.*`/`signup-image-1000.*` über `AuthShell.js`). `registerimage.jpg`/`playerimage.jpg` waren nie bzw. nicht mehr im Einsatz (`/team/register` ist nur Redirect) und liegen seit 11.08.2026 archiviert in `docs/asset-archive/` (Befund: `docs/ABLAGE-AUDIT-BILDER-2026-08-11.md`). Namenskonvention für neue Bild-Varianten: `docs/NAMENSKONVENTION-BILDER.md` (Kebab-Case, `<basis>-<lange-Kante>.<format>`).
- **Wiederverwendbare Redesign-Bausteine:** `components/layout/AuthShell.js` (Split-Screen Auth),
  `components/layout/PageHeader.js` (Seitenkopf auf `ink-900` mit Marken-Leiste), `components/Avatar.js`
  (generiertes Initialen-Logo mit deterministischer Namensfarbe – Fallback für Spieler & Teams, überall),
  `components/player/PlayerProfileView.js` (komplettes Spieler-Profil), `components/CityInput.js`
  (Stadt-Typeahead), `components/CityRadiusFilter.js` (Umkreis-Filter), `components/layout/Navbar.js`
  (öffentlich, login-bewusst), `components/layout/FeedbackLink.js` (Feedback-Zugang im Sticky-Chrome
  aller drei Leisten, seit 13.08.2026 – ersetzt den schwebenden FeedbackButton, der dreimal
  unabhängig als Inhalts-Verdeckung gemeldet wurde; Mobil-Menüs scrollen seitdem selbst), `components/landing/HeroScrollStage.js` (scroll-gesteuerte Hero-Bühne
  **„Der Abschluss"**, seit 19.08.2026: ein rAF-Controller, der eine Linienzeichnung zeichnet;
  kein Pinning, `prefers-reduced-motion` zeigt ein gewähltes Einzelbild) mit
  `components/landing/HeroDunk.js` (Ring, Netz, Zug, Ball als reine Vektoren, zwei
  viewBox-Fassungen) und `components/landing/HeroGlyphs.js` (nur noch Korb-Emblem und
  Streckenball der Fortschritts-Leiste).
  ⚠️ **`PlayDiagram.js`, `SwishSequence.js` und `BallSprite` sind am 19.08.2026 ERSATZLOS
  ENTFALLEN**, ebenso die Bilddateien `public/images/ball-basketball-32x200.*` (295 KB),
  `public/images/swish/` und die beiden Erzeuger-Skripte. Die Startseite lädt wieder **null
  Bytes Bilddaten**.
- **Designsystem-Primitive (`components/ui/`):** `Button` (Varianten primary/secondary/ghost/danger/
  dangerGhost + Größen sm/md/lg, `href`→Link), `Tabs` (Umschalter mit Unterstreichung, kein Pill mehr), `Card`, `EmptyState`,
  `Loading` (Basketball-Spinner), `Skeleton`/`SkeletonCard`/`SkeletonList`, `FormAlert`
  (role=alert/aria-live), `ConfirmAction` (Bestätigungs-Popover statt `window.confirm`). Tokens in
  `lib/ui.js` (`inputClass`, `inputClassSm`, `inputClassNum`/`inputClassStat` – die beiden Zahlenfelder
  bewusst OHNE Breitenklasse, Breite setzt die aufrufende Stelle –, `cardClass`). Team-Admin-Tabs nutzen
  zusätzlich `components/team/tabs/TabAlert.js` (FormAlert-Wrapper für ihr `{type,text}`-Format).
  **Konvention:** neue/überarbeitete Seiten IMMER diese Primitive nutzen (keine Ad-hoc-Buttons/Tabs/
  Spinner, kein `window.confirm`). **Rollout abgeschlossen (Wellen 1–5 + Welle 2b für das
  Team-Admin-Panel, Commits in der Chronik)** – **mit einer Ausnahme, nachgemessen am 15.08.2026:**
  `Card` hat **2 Importe** (`components/feed/FollowSuggestions.js`,
  `components/posts/PostComposer.js` — nachgemessen 19.08.2026; die dritte Fundstelle
  `components/feed/SpieltagStrip.js` existiert nicht mehr) und `cardClass` **0 Verwendungen** (nur die Definition in
  `lib/ui.js:22`); stattdessen bauen **141 Stellen** die Panel-Fläche von Hand (`bg-navy-800` +
  `border-navy-600`). Die **141 ist eine Untergrenze**: Zeilen mit `bg-navy-800` gibt es **180** –
  die übrigen 39 sind ebenfalls handgebaute Panels, nur mit abweichender Rahmenfarbe
  (`signal-ok`, `brand-500`, dynamisch) oder ganz ohne. Betroffen sind **78 Dateien**. Alle übrigen
  Primitive sind echt im Einsatz (Button 25, Loading 19, EmptyState 15, Skeleton 13, Reveal 11,
  FormAlert 9, Tabs 6, CountUp 5, ConfirmAction/ScrollTable/SplitFlap je 3, Card 2, LinkTabs 1).
  ⚠️ **Stand 19.08.2026 nachgezogen — und der größte Teil der Drift war schon da**, bevor der
  Hero-Umbau begann: Am unveränderten Stand `062989e` gemessen Card 3→2, Reveal 12→11,
  strikt 141→143, weit 180→184. Es wurde seit dem 15.08. mehrfach an Panels gebaut, ohne die
  Baseline zu pflegen. Der Hero-Umbau selbst hat die Zahl **gesenkt** (143→141 strikt,
  184→182 weit), weil er zwei Komponenten gelöscht hat.
  Folge: Eine Änderung an der Kartensprache wirkt
  **nicht** zentral – sie muss an 141 Stellen nachgezogen werden. Das ist der größte offene
  Konsistenz-Posten des Designsystems (Umbau bewusst zurückgestellt: hohes Regressionsrisiko,
  kein sichtbarer Gewinn). **Nebenbefund:** `components/feed/FollowSuggestions.js` importiert `Card`
  und nutzt es im Leerzustand (Z. 92), baut dieselbe Fläche im Normalzustand aber von Hand (Z. 99) –
  eine Fläche, zwei Wege, in einer Datei. Vollständiger Befund:
  `docs/NEWSFEED-DESKTOP-2026-08-15.md` Abschnitt 1.4.
  **Alle Zahlen dieses Absatzes sind messbar, nicht behauptet:** `npm run design-audit`
  (`scripts/design-audit.mjs`) zählt sie neu. `--files` zeigt die Fundstellen, `--json` gibt sie
  maschinenlesbar aus, `--check` vergleicht mit der Baseline im Skript und endet mit exit 1, sobald
  etwas gedriftet ist. **Bei Drift immer BEIDES nachziehen** – die `BASELINE`-Konstante im Skript
  und diesen Absatz samt Messdatum. Der Drift ist real: 126 → 141 in drei Tagen (12. → 15.08.2026), und er wurde zwischen dem 15. und 19.08. erneut nicht gepflegt (s. o.).
  Bewusst belassen (custom/kompakt): lokale `inputClass` in
  `team/claim`, `admin/leagues`, `admin/update-match`. Optionaler Restschliff: Super-Admin-Tabellen/
  „Lädt…"-Texte auf `<Loading>`/`EmptyState`.
- **Geo-Suche:** Feld `bundesland` an Player/Team/League; `lib/geo.js` + `public/data/de-cities.json`
  (14.910 Orte mit lat/lng, lazy geladen) für Stadt+Umkreis (Haversine). Stadt-Eingabe per Typeahead
  setzt das Bundesland automatisch.
- **Onboarding-Tour, drei Regeln (seit 14.08.2026):** (1) `speichern()` in
  `components/onboarding/TourSteps.js` hat **drei** Ausgänge – `SPEICHERN_OK` / `_FEHLER` /
  `_ANONYM`. Die Tour ist über den Footer auch **ausgeloggt** erreichbar; „kein Konto" ist kein
  Fehler. Ein neuer Schritt muss alle drei behandeln, sonst entsteht entweder eine Fehlermeldung
  ohne Fehler oder – schlimmer – eine Erfolgsquittung ohne Speicherung. (2) `stand === null`
  bedeutet **„aus dem Profil vorbelegt", also gespeichert** – nicht „nichts passiert". (3) Aussagen
  über die Oberfläche („oben rechts") nur, wenn das Gemeinte auch da ist: Der Marker
  **`data-profil-avatar`** in `components/layout/PlayerNav.js` wird zur Laufzeit geprüft, weil
  PlayerNav **pro Seite** eingebunden ist und auf öffentlichen Seiten fehlt.
- **Transfer = zwei Dinge, seit 14.08.2026 trennbar:** `lib/recordTransfer.js` schreibt die
  **Station im Lebenslauf** (`TransferEvent`) UND die **Neuigkeit** (Feed-Post +
  Follower-Benachrichtigung). `still: true` schreibt nur die Station – gesetzt **ausschließlich**
  in `app/api/admin/setteamadmin/route.js`, weil dort korrigiert und nicht gewechselt wird.
  ⚠️ Für die sieben echten Wechselwege muss der Post bleiben; `tests/e2e/transfer-still.spec.mjs`
  prüft **beide** Richtungen, denn „kein Post" wirft keinen Fehler.
- **Rechtsverweise auf kontoerzeugenden Seiten:** `components/layout/RechtsLinks.js` ist die EINE
  Stelle für Datenschutz + Impressum. Jede Fläche, auf der ein Konto entsteht, muss sie tragen
  (Art. 13 DSGVO, § 5 DDG) – `tests/e2e/rechtsverweise.spec.mjs` erzwingt das. Die
  Mindestalter-Meldungen liegen als `MINDESTALTER_HINWEIS(_GOOGLE)` in `lib/constants.js`
  (sechs Fundstellen, davon drei im Google-Weg).
- **Benachrichtigungen – alles Typ-Bezogene liegt in `lib/notifications.js`:** `notificationHref`
  (Ziel), **`NOTIF_ICON`** (Symbol, seit 14.08.2026 dort statt in der Glocke) und `GLOCKE_LEER`
  (**ein** Leerzustands-String). Typ-Enum in `models/Player.js`. **Ein neuer Typ muss an allen
  drei Stellen gepflegt werden**, sonst entsteht ein Eintrag ohne Symbol oder ohne Ziel –
  `tests/e2e/benachrichtigungs-typen.spec.mjs` erzwingt das jetzt, die Regel stand vorher nur hier.
  ⚠️ Es gibt **ZWEI** Glocken: `components/layout/NotificationBell.js` (Spieler-Leiste) und eine
  eigene Umsetzung in `components/layout/Navbar.js`. Letztere hatte bis zum 14.08. gar keine
  Symbol-Zuordnung und zeigte für jeden Typ einen Basketball; beide ziehen jetzt aus `NOTIF_ICON`.
  ⚠️ **Keine Ausnahmelisten in diesem Test.** Ein erster Versuch nahm sechs Typen als „sehen nur
  Admins" aus – falsch: `getnotifications` filtert nicht nach Typ, und `set-member-admin` schickt
  `team_admin_granted` an ein normales Kadermitglied.
  Versandlogik je Ereignis in eigener lib (z. B. `lib/statsNotify.js` für `own_stats`,
  `lib/notifyEngagement.js` für Feed-Interaktionen).
- Token-Keys in localStorage: `playerAuthToken`, `teamAuthToken` (legacy, kaum noch genutzt), `adminAuthToken`.

### Feature-Stand (Kurzüberblick – alles live auf hoopsgermany.de, Details in der Chronik)
- **Liga-System:** offizieller NRW-Katalog (57 official: 31 Herren + 16 Damen + 10 Jugend U18/U16 m/w;
  Produkt-Cutoff bei U16), Saison/Archiv/Playoffs/Meister, TeamSeason-Endstand-Snapshots, Audit-Log;
  Kreisliga-Framework mit Regierungsbezirk-Navigation (alle 22 Basketballkreise, WBV-verifiziert) +
  Demo-Kreisligen (`isDemo`, noindex); **Liga-Zuordnung nur per Freigabeprozess** (`LeagueChangeRequest`,
  Admin-Seite `/admin/league-requests`, Mails + Glocke an Super-Admins und Anfragende).
- **Teams (spieler-geführt):** Gründung mit Super-Admin-Freigabe, Kader-Slots + 3 Einladungswege
  (Claim-Link, Direkt-Einladung bestehender Accounts, allgemeiner Join-Link mit Wechsel-Warnung),
  Co-Admins mit Teilrechten (`lib/teamPermissions.js`), Rückennummern, `notifyAllAdmins`-Einstellung.
- **Newsfeed (Roadmap 10/10 komplett):** „Für dich"-Ranking, Auto-Posts (Ergebnis/Transfer/Tryout/
  Recruiting/Verfügbar), Team-Posts, Engagement-/Mention-Benachrichtigungen, Bild-Upload (inkl. HEIC),
  Hashtags + @Mentions mit Autocomplete (Composer, Kommentare, Antworten), YouTube-/Link-Embeds mit
  Klick-zum-Laden (Datenschutz) + Open-Graph-Vorschau, Folge-Vorschläge, Permalinks.
- **Scouting/Transfermarkt (Phasen A+B+C):** strukturierte Filter, „Vereine suchen Spieler",
  Direktanfrage, Matching, bevorzugte Spielklasse.
  ⭐ **Kernpositionierung (Patrick & Jonatan seit Projektstart, am 12.08.2026 bekräftigt):**
  Die Plattform ist als **Scouting-Plattform mit belegbaren Fakten** gedacht – „wie LinkedIn,
  nur nachweisbar". Der Unterschied ist nicht das Profil, sondern die **Belegbarkeit**: Die
  Zahlen stammen aus Spielen, die **beide Teams unabhängig gemeldet und bestätigt** haben
  (`resultStatus: confirmed` mit beidseitigem `submittedBy`). Ein Verein muss dem Spieler also
  nicht glauben. Bei Feature-, Text- und Gestaltungsentscheidungen mitdenken.
  ✅ **Korrektur 13.08.2026 (Befund Ronja, fünf belegte Fundstellen):** Der Beleg-Satz steht
  **sehr wohl** im nutzersichtbaren Text (Landing-Szenen 1+3, „So funktioniert's",
  Karrierepanel, `/topscorer`, `/ligen/[id]`, Abzeichen auf `/match/[id]`) – die frühere
  „Lücke"-Notiz war überholt. Seit `c4dd91d` ist die Belegbarkeit zusätzlich als **Ereignis**
  eingelöst (Benachrichtigung „Deine Zahlen stehen", s. Spielbetrieb). Vergleichende Aussagen
  („einzige Plattform, die…") weiterhin wegen §6 UWG an Nora, Formulierungen an Nele.
- **Spielbetrieb:** Ergebnis-Verifikation + Mismatch-Eskalation an beide Admins + Super-Admins,
  Box-Scores, Topscorer/Rangliste saison-fähig, Spielerhistorie mit Einzelspielen, Karriere-Timeline.
  **Benachrichtigung „Deine Zahlen stehen"** (13.08.2026, `lib/statsNotify.js`, Typ `own_stats`):
  Spieler mit erfassten Werten im Box-Score werden **genau einmal je Spiel** informiert
  (Merkfeld `Match.notifiedStatsPlayers`), Text trägt den Beleg-Status (bestätigt / noch
  vorläufig), bei `mismatch` gar nichts, Ziel `/match/[id]`. Nur In-App, **keine Mail**.
- **Onboarding & Wachstum:** Willkommens-Tour, Onboarding-Checklist (Feed + Startseite), PWA
  (`/installieren`), login-bewusste Landing, Testphase-Banner.
- **Admin & Analytics:** Analytics Phase 1–3 Teil 1 (Dashboard, Sponsor-Report, teilbarer
  Passwort-geschützter Report-Link), Feedback-Inbox, zentrales Mail-System (`lib/emailTemplates.js`,
  Empfänger-Matrix mit info@-Bündelung via `lib/adminRecipients.js`).
- **Seed-/Demo-Tooling** (alle additiv, getaggt, idempotent, `--purge`-fähig): `seed-demo` (Dev-Basis),
  `seed-nrw-leagues` (offizieller Katalog), `seed-nrw-demo`, `seed-kreisligen-demo` + `-niers`,
  `seed-showcase-posts`, `seed-world`, `rollover-season` (**Prod: noch nie ausgeführt**).
  ⚠️ **KORREKTUR 15.08.2026 (Befund Ronja, von mir auf `hoops_prod` nachgemessen):** Hier stand
  bei `seed-world` **„Prod: nicht ausgeführt"** – das ist **falsch**. Der Bestand liegt dort:
  `seedTag: "world"` bei **40 Teams, 345 Spielern, 288 Beiträgen**. Zum Vergleich der echte
  Bestand ohne Tag: **6 Teams, 31 Spieler, 15 Beiträge**. Also **85 % der Spieler auf der
  Live-Seite sind Seed-Daten.** Folge: Die Aufräumliste in Roadmap 2 war unvollständig.

### 🔜 Noch offen (Roadmap)
1. **`/admin`-Temp-Passwort** (`A1cGmhwN-1To`) auf ein eigenes ändern – oder den Legacy-`/admin`-Login ganz
   entfernen (Super-Admin-Spieler kommen ohnehin direkt rein).
2. **Demo-Daten nach der Testphase durch echte ersetzen** (auf dem VPS): `node scripts/seed-nrw-demo.mjs
   --purge`, `node scripts/seed-kreisligen-demo.mjs --purge`, `node scripts/seed-kreisligen-demo-niers.mjs
   --purge`, `node scripts/seed-showcase-posts.mjs --purge`, **`node scripts/seed-world.mjs --purge`**
   (am 15.08.2026 ergänzt – der Bestand liegt entgegen der bisherigen Notiz sehr wohl auf Prod);
   **danach beim Cutover die alte DB `test` löschen**.
   ⚠️ **Vor dem Purge entscheiden (Patrick), es ist keine reine Aufräumfrage:** Die Seed-Beiträge
   tragen **4.073 Likes** (höchster Einzelwert 40; **101 Beiträge mit 20+**). Der echte Bestand
   trägt **16 Likes** bei 15 Beiträgen, höchster Wert 6 – das ist die Größenordnung, die zu rund
   zehn externen Nutzern passt. Ein Leser liest „40" als **40 Personen**. Der Testphase-Banner
   sagt „einige Inhalte sind Beispieldaten" und federt damit die *Inhalte* ab, aber **nicht die
   Zustimmungszahlen**: Eine erfundene Reichweite ist etwas anderes als ein erfundener Verein.
   Besonders heikel gegenüber Zielgruppe 5 (lokale Sponsoren) – **das gehört vor Nora**
   (§ 5 UWG, irreführende Angabe), bevor jemand der Seite Zahlen glaubt. Siehe auch
   `docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md`.
3. **Monetarisierung – BLOCKIERT bis Gewerbeanmeldung** des Users (Amazon-Affiliate + Sponsorfläche;
   AdSense erst bei genug Traffic + Consent-Banner; bei Dritt-Diensten Datenschutz/Consent nachziehen).
4. **Analytics Phase 3 Teil 2** (Banner-Tracking je Werbefläche mit Impressionen/Klicks/CTR, Sponsor-Entität
   + per-Sponsor-Auswertung, Leads, automatischer PDF-Export) – an Monetarisierung (#3) gekoppelt,
   bis zur Gewerbeanmeldung zurückgestellt.
5. **Echte WBV-Kreisliga-Daten statt Demo** (niedrige Prio). Verbindlicher Auftrag VOR dem Seeden:
   ChatGPT-Kreisliga-PDF des Users einlesen, **Inhalt sorgfältig prüfen (nicht blind übernehmen!) +
   Umlaute korrigieren**, erst dann ins Seed-Muster analog `seed-nrw-leagues.mjs` (`official:true`,
   `level:"Kreisliga"`, `region`=Kreis, idempotenter Upsert, `--dry`) → Dev testen, dann Prod.
   Kreis-Ort-Aliase (`KREIS_ORT_ALIASE`) bisher nur für Kreis Niers – weitere Kreise bei Bedarf.
6. **Weibliche Jugend-Einteilung verifizieren:** U18w/U16w sind struktur-basiert gespiegelt (exakte
   WBV-Einteilung 2025/26 war nicht auffindbar; WBV-Artikelseiten blocken den automatischen Abruf) →
   **User besorgt den PDF-Link** von basketball.nrw, dann gegenprüfen und ggf. per `/admin/leagues` korrigieren.
7. **Season-Rollover (jährlich ≈ Juli):** `scripts/rollover-season.mjs` ist deployt, aber **noch NIE auf
   Prod ausgeführt**; beim ersten echten Lauf 10-Min-Sanity-Check (WBV-Gruppenzahl) + Teams ordnen sich der
   neuen Saison über Liga-Wechsel/Freigabeprozess neu zu.
8. **Vom User zu bestätigen:** Sind die 2 Test-Mails der Liga-Zuordnungsanfrage (02.07.) angekommen?
   (`p.schemura@gmail.com`, `jonatanbaenavides@gmail.com`, `info@hoopsgermany.de`.) Der Freigabeprozess ist
   einsatzbereit; ein echter Praxistest mit realer Anfrage steht noch aus.
9. **Rechtliches (Betreiber):** Datenschutz-Abschnitt 10 (Klick-zum-Laden/YouTube-no-cookie) final juristisch
   prüfen lassen – die Formulierung ist ein Vorschlag, keine Rechtsberatung.
10. **Design-Review-Restwellen:** `docs/DESIGN-REVIEW-2026-08-10.md` – **Welle 1, 2a und 2b sind
    erledigt** (Team-Admin-Panel + Hero-Animation, Commit `a0dbe20`). Offen: **Welle 3** (Mobile-Tabellen
    mit Sticky-Spalte auf Rangliste/Topscorer/Liga-Tabelle, einheitliche mobile Filterleisten,
    optional `CountUp`/`Reveal` auf den öffentlichen Seiten). **Welle 4 ist erledigt** (12.08.2026):
    LegalShell-Zeilenlänge (`max-w-xl`) und Sprungnavigation stehen, der oauth-landing-Fehlerzustand
    hat Logo und Ausweg, und der FeedbackButton war auf der Einstiegs-/Formularstrecke ausgeblendet –
    er lag auf 390×640 gemessen über den letzten 36 px von „Konto erstellen". **Überholt am
    13.08.2026:** Der schwebende Knopf ist insgesamt entfernt; der Feedback-Zugang sitzt im
    Sticky-Chrome (`components/layout/FeedbackLink.js`, Protokoll in der Chronik).
11. **Startseite als Scroll-Erlebnis – was noch offen ist.** ⚠️ **Der Hero ist am 19.08.2026
    neu gebaut worden** („Der Abschluss", `docs/HERO-DUNK-KONZEPT-2026-08-19.md`); das ältere
    `docs/HERO-KONZEPT-2026-08-11.md` beschreibt den abgelösten Stand und ist **Historie, keine
    Vorgabe mehr**. Für die Feature-Strecke gelten `docs/LANDING-KONZEPT-2026-08-11.md` und
    `docs/LANDING-COPY-2026-08-11.md` unverändert.
    **Offen:** Stufe 4 der Feature-Strecke (kurzer Pin nur für die Ergebnis-Szene) **nur**,
    falls Ronjas Nutzungsprüfung zeigt, dass die Doppel-Bestätigung nicht verstanden wird;
    Test auf echtem Low-End-Android (bisher nur 4×-CPU-Drosselung); Neles „nice to
    have"-Textvorschläge für die Karten 2/5/6.
    **Entfallen:** die Hero-Desktop-Ausbaustufe (gepinnte Bühne, 140vh, drei Szenen) – sie war
    eine Ausbaustufe des alten Ball-Heros. Der neue Hero hat zwei gleichwertige Fassungen
    (Hoch-/Querformat) und braucht kein Pinning.
12. **Entscheidungen zu „Deine Zahlen stehen" (`own_stats`, seit 13.08.2026 gebaut):**
    (a) Soll die spätere **Bestätigung** eines zunächst vorläufigen Ergebnisses eine **zweite**
    Nachricht auslösen? Heute bewusst nein (Rauschen-Abwägung) – wer beim Stand „vorläufig"
    informiert wurde, erfährt die Bestätigung nicht noch einmal. (b) Soll es dazu eine **Mail**
    geben? Heute bewusst nicht; falls ja, nach dem Muster `emailPendingResult` **mit eigenem
    Opt-out**. Beides gehört Patrick.
13. **Rest aus `docs/RETENTION-BEFUND-2026-08-13.md`** (Ronja) – von Lina am 14.08. am Live-Stand
    gegengeprüft: **R1–R5, R7, R8 und K1–K3/K5/K9 sind erledigt und verifiziert**. Offen bleiben
    die übrigen K-Verlinkungen. Der Sponsor-Report-Punkt (Abschnitt 3a) ist behoben.
14. **Aus `docs/ENTDECKBARKEIT-BEFUND-2026-08-14.md`** (Lina): **P2 ist erledigt** – „ab 16" wird
    seit `3fa822e` auf `/signup`, `/about` und beiden Einladungsseiten begründet (Nora → Nele).
    Offen bleibt Linas eigene Frage, ob ihre Rolle von Vivien/Nele/Ronja aufgesogen wird.
15. **Aus den Gates vom 14./15.08. — die Liste ist abgearbeitet.** Erledigt: der
    `recordTransfer`-Post, Fokusfalle und Fokus-Rückgabe, `TeamNav`-Klickfläche, Alt-Kürzel,
    Escape auf Menü/Suche/**beiden Glocken**, `GLOCKE_LEER` für alle Rollen, optimistisches
    Speichern mit Rücknahme, Tour-Schritt 3 ausgeloggt, doppelte Position auf der Kaderkarte,
    Leseposition + Scroll-Sperre, die Sackgasse auf `/team/create`, beide
    Admin-Benachrichtigungen, tote Wege (`teamSlug`/`matchId`) nach dem Löschen eines Teams.
    **Neu offen, klein:** (a) Ein Escape bedient mehrere Ebenen gleichzeitig – wer die Sperren
    stapelt, sollte auch die Escape-Ebenen stapeln (Kai). (b) ✅ **gegenstandslos** – die
    Profil-Oberfläche kann Positions-Kürzel nicht schreiben (Tobias' N4); auf Prod gibt es
    deshalb keine, s. (f).
    (c) Ein **offener** Kaderplatz ohne Position zeigt „—", wo die gesuchte Position die
    eigentliche Information wäre → Nele. (d) Auf `/team/create` steht erst „Team gründen", dann
    die Korrektur – trägt die Reihenfolge? → Vivien/Nele. (e) `PlayerNav` hat **keine Suche**:
    eingeloggt ist sie nur auf öffentlichen Seiten erreichbar → Lina/Ronja.
    (f) ✅ **erledigt/gegenstandslos:** `scripts/migrate-positions.mjs` wurde am 15.08.2026 auf Dev
    ausgeführt (19 Positionen, Idempotenz belegt). **Auf `hoops_prod` gibt es nichts zu
    migrieren** – gemessen: 392 kanonische Positionen, 0 Kürzel, und auch 0 Varianten in
    Groß-/Kleinschreibung oder mit Leerzeichen (also nichts, was das Skript übersehen hätte).
    Grund: Sie waren ein reines Seed-Artefakt der Dev-DB, das Profil-`select` bietet sie nicht an.
    ⚠️ **Korrektur (Kai, 15.08.2026):** Hier stand, ein Kürzel könne auf Prod „nur entstehen, wenn
    jemand direkt in die DB schreibt". Das war falsch und in der gefährlichen Richtung falsch –
    es klang nach einer Garantie. `update-profile` führte `position` nur in einer **Feld**-Weißliste,
    prüfte den **Wert** nie, und `models/Player.js` hat `position: String` ohne Enum: Jeder Aufruf
    mit gültigem Token schrieb jede Zeichenkette. Dass das Formular ein `select` benutzt, ist eine
    Aussage über den Browser, nicht über die API. Seit dem 15.08. prüft die Route gegen `ALL_ROLES`
    – **aber nur bei echter Änderung**, sonst wäre ein Konto mit Altwert unbedienbar (dasselbe
    Muster wie beim Geburtsdatum). **Lehre:** „kann nicht passieren" nur schreiben, wenn der Code
    es erzwingt, nicht wenn die Oberfläche es nicht anbietet.
    ⚠️ **(0) DIE REGEL AUS (1) WURDE AM 15.08. VIERMAL IN EINER RUNDE GEBROCHEN —
    von mir, und sie steht seit dem 14.08. hier.** Kai fand seinen Arbeitsbaum
    dreimal verändert vor, seine erste vollständige Mutationsmatrix lief dadurch
    gegen einen Stand von **zwei Commits vor der Prüfbasis** und meldete Befunde,
    die reine Artefakte waren. Er hat sie selbst als solche erkannt und alles in
    einem isolierten `git worktree` auf eigenem Port wiederholt — die Runde war
    nur deshalb verwertbar. **Die Konsequenz ist nicht „besser aufpassen":
    Wer ein Gate startet, arbeitet bis zu dessen Ende NICHT im selben Baum.**
    Entweder man wartet, oder man baut selbst in einem Worktree. Ein Prüfer, der
    sein eigenes Messwerkzeug gegen fremde Bewegung absichern muss, prüft nicht
    mehr das Produkt.
    ⚠️ **Methodik-Lehren aus den Gates vom 14.08.:** (1) Während ein Browser-Gate gegen `next dev`
    läuft, darf im selben Arbeitsbaum **nicht weitergebaut** werden – der Prüfer sieht sonst Code,
    der nicht im geprüften Commit ist. (2) **`preview_stop` beendet den Dev-Server nicht**, es löst
    ihn nur aus der Verwaltung; der Node-Prozess hält Port 3000 weiter (auf dem Mac sichtbar über
    `lsof -tiTCP:3000 -sTCP:LISTEN`; unter Windows hieß der Zustand `ABHÖREN`). Vor
    jedem Build `sh scripts/port-frei.sh` – sonst läuft der Build in ihn hinein. (3) Ein
    **sporadisch roter Test** ist selten ein Timing-Problem: Beim Avatar-Layout-Test halfen weder
    höhere Timeouts noch eine leichtere Seite noch eine Übergangs-Pause, weil die Ursache ein
    unbekannter Ausgangszustand war (Auto-Start der Tour bei `welcomeSeen: false` verdeckt den
    Footer-Knopf). Erst den Zustand deterministisch machen, dann an Wartezeiten denken.
    (4) **Der `security-review`-Skill wählt seine Basis selbst** und diffte gegen `main` – 4,3 MB,
    ~500 Dateien. Bei einem Langläufer-Branch wie `redesign` verdünnt das die Prüfung bis zur
    Wirkungslosigkeit. **Immer die Commit-Basis vorgeben** (`git diff <basis>..HEAD`).
    ⚠️ **Nachtrag 15.08.2026 (Kai, vierte Runde): Die Vorgabe im Auftrag WIRKT NICHT.**
    Der Skill-Rumpf übernimmt sie nicht und setzt sich in jeder Runde erneut auf `main`
    (zuletzt 4,7 MB inkl. `tmp/`-Screenshots und `.claude/`-Skills). Die Basis-Einschränkung
    muss **manuell durchgehalten** werden – also den Diff selbst erzeugen und die Analyse
    darauf ausführen, statt dem Skill zu vertrauen. Bei fünf Dateien ist das vertretbar,
    bei einem größeren Diff nicht.
    (5) ⚠️ **Feste Zeichenfenster in Quelltext-Tests sind eine Fehlerklasse für sich.** An einem Tag
    viermal aufgetreten: `slice(ab, ab + 400)`, `{0,200}` in einer Regex, `indexOf("]")`,
    `indexOf("};")`. Sie brechen in beide Richtungen – zu kurz gibt falsches Rot, und
    `indexOf`-Grenzen liefern bei Ausfall `-1`, wodurch `slice(ab, -1)` den ganzen Rest der Datei
    (6) ⚠️ **Ein Test, der seinen eigenen Ausgangszustand verändert, ist beim ZWEITEN Lauf rot.**
    Zweimal an einem Tag: Der Tour-Auto-Start (`welcomeSeen`) verdeckte den Footer-Knopf, und ein
    Layout-Test klickte fest auf „Point Guard" – beim nächsten Lauf war die Position gesetzt,
    derselbe Klick wählte ab. Beide Male sah es nach Flakiness aus und war Zustandsabhängigkeit.
    Entweder den Zustand vorher deterministisch setzen oder am Vorgefundenen entlang wählen
    (z. B. einen Chip ohne `aria-pressed="true"`).
    (7) ⚠️ **Eine Gegenprobe muss die richtige Reihenfolge treffen.** Der erste Test für die
    Scroll-Sperre war auch OHNE Fix grün: Er schloss die Overlays per Klick, und das geht
    zwangsläufig von oben nach unten – genau die Reihenfolge, in der das alte Muster zufällig
    funktionierte. Erst Escape (schließt beide auf einmal) legte den Fehler offen.
    (5-Fortsetzung) Immer Klammerzählung, und die Hilfsfunktion soll
    **werfen** statt still etwas Falsches zu liefern (Muster: `blockAb` in
    `tests/e2e/benachrichtigungs-typen.spec.mjs`).
    ⚠️ **Methodik-Lehre vom 15.08.2026 – ZWEI SESSIONS IM SELBEN ARBEITSBAUM.** An einem Tag
    dreimal aneinandergeraten; jedes Mal ging es gut aus, und jedes Mal nur, weil jemand
    hinterher gegenprüfte. Die drei Regeln daraus:
    (a) **Zuweisung je Datei, bevor gearbeitet wird.** Sonst committet die eine Session in ein
    bewegliches Ziel: Es wurde ein Entwurf aus dem Arbeitsbaum committet, während die andere
    Session noch daran schrieb. Und „fertig" heißt fertig – wer danach weiterschreibt, sagt
    vorher „ich arbeite weiter".
    (b) **Committen, pushen, deployen sind DREI Erlaubnisse; die untere trägt die obere nicht.**
    ⚠️ **Und der schärfere Teil: In einem gemeinsamen Arbeitsbaum gilt die GROSSZÜGIGSTE
    Freigabe für alles, was darunter liegt – dagegen verstoßen muss dabei niemand.** Git kennt
    keine Teil-Pushes: Wer die Spitze schiebt, schiebt alles darunter. Genau so kam ein Commit
    auf `origin`, der unter „Commit freigegeben, kein Push" entstanden war; die eine Session
    hatte Push-Freigabe, die andere nicht, und beide haben sich an ihre Vorgabe gehalten.
    **An Git sieht man diese Bindung nicht** – sie steht nur im Auftrag.
    Wer strenger gebunden ist, hat deshalb zwei Wege: **committen und warten**, oder in einem
    **eigenen Worktree** arbeiten (`git worktree add`). Und vor jedem Push nachsehen, was mitgeht:
    ```bash
    git log --oneline origin/redesign..HEAD
    ```
    (c) ⚠️ **Der eigene erste Blick auf den Baum kann veraltet sein.** Ein `git log` meldete
    `c96cb14` als HEAD, während der Reflog längst `1a00846` führte. **Maßgeblich ist der
    Reflog**, nicht der erste Blick – und für die Frage „wer hat wann gepusht" beantwortet
    `git reflog show origin/<branch> --date=iso` in EINEM Kommando, was `merge-base
    --is-ancestor` nur halb beantwortet: Dass ein Commit auf `origin` ist, sagt nichts darüber,
    **wodurch** er dorthin kam. Beide Sessions haben an diesem Punkt dieselbe Fehlerform
    produziert – **Ergebnis richtig gemessen, Mechanismus dazu erfunden.**
16. **Folgen des Sicherheits-Eingriffs vom 15.08.2026 – Entscheidungen, keine Aufräumarbeit.**
    (a) ⚠️ **48 der 66 Prod-Teams haben einen unerreichbaren Admin** (Befund Kai). Meine Meldung
    „Rollen unverändert" war technisch richtig und im Ergebnis das Gegenteil: Diese Vereine sind
    dauerhaft unverwaltbar, ohne Weg zurück außer einem Super-Admin-`setteamadmin`. Trifft ein
    echter Tester auf eines davon, hat es keinen ansprechbaren Verantwortlichen. Entscheiden,
    ob das bis zum Demo-Purge so bleibt.
    (b) ✅ **Erledigt:** `emailPendingResult: false` auf allen 393 `.invalid`-Konten – sonst
    hätte `notify-pending-results` beim nächsten Cron-Lauf bis zu 34 harte Bounces an eine
    reservierte TLD geschickt, abgesendet von demselben SMTP-Konto, über das Passwort-Resets
    echter Nutzer laufen. Gemessen: 0 Seed-Admins bekämen noch eine Mahnung, die 4 echten
    Team-Admins unberührt.
    (c) **`POST /api/team/teamlogin` entfernen** (Kai): ein zweiter, vollständiger Auth-Pfad, der
    `Team.email` + `Team.password` prüft und ein Token mit vollen Team-Admin-Rechten gibt – ohne
    die `players`-Sammlung zu berühren. Heute harmlos (gemessen: 66 Teams, **0** mit E-Mail,
    **0** mit Passwort), aber sein einziger Schutz ist, dass zufällig kein Datensatz ihn füllt.
    Die Seiten sind ohnehin nur Redirects.
    (d) **Google-Callback wertet `email_verified` nicht aus** (Kai, älter als dieser Vorfall):
    Er nimmt `email` aus dem ID-Token und adoptiert damit ein bestehendes Konto samt aller
    Rechte. Für die Seed-Konten jetzt gegenstandslos, für echte Nutzer der Mechanismus, der den
    Vorfall überhaupt möglich gemacht hat.
    (e) **`demo.coach`-Zugang wiederherstellen**, falls gewünscht – Passwort auf
    `demo.coach@nrw-demo.de.invalid` setzen (s. Abschnitt Test-Accounts).
17. **Den Team-Admin bei der Erfassung stützen – Live-Eingabe statt Nachbereitung**
    (Idee Patrick, 15.08.2026). Die Box-Scores kommen von **Ehrenamtlichen**, die sich
    freiwillig dazu bereit erklären; sie sind die Quelle, aus der die gesamte Belegbarkeit der
    Plattform stammt. Heute ist die Erfassung eine **Pflicht nach dem Spiel**: Der Admin führt
    während der Partie irgendeine eigene Notiz und überträgt sie später. Ziel: Er trägt
    Punkte/Assists/Rebounds **parallel zum Spiel** direkt hier ein und braucht **keine zweite
    Dokumentation** – im besten Fall benutzt er Hoops Germany *als* sein Werkzeug am Spielfeldrand.
    Dazu **rechtzeitig** eine Erinnerung per **Mail UND Glocke** (nicht erst danach – der
    bestehende `emailPendingResult`-Weg mahnt ein fehlendes Ergebnis *hinterher* an).
    ⚠️ **Abgrenzung, die vor der Umsetzung geklärt sein muss:** Mats' „wird NICHT
    gebraucht"-Liste enthält **Live-Ticker**. Das hier ist etwas anderes – ein
    **Erfassungswerkzeug für den Admin**, kein Zuschauer-Ticker. Ob und ab wann Zwischenstände
    für andere sichtbar werden, ist eine eigene Entscheidung und **nicht** Teil dieser Idee;
    sonst entsteht durch die Hintertür genau das Feature, das die Bedarfsanalyse ausschließt.
    ⚠️ Weitere offene Punkte vor dem Bau: Bedienung mit **einer Hand am Spielfeldrand**
    (Daumenreichweite, große Ziele, mobil zuerst) · Verhalten **ohne Netz** in der Halle
    (Zwischenspeicher lokal, später senden – sonst ist ein Funkloch gleich ein Datenverlust) ·
    wann ein live erfasster Stand als **eingereicht** gilt (die Doppel-Bestätigung darf nicht
    versehentlich schon durch das Mitschreiben ausgelöst werden) · Vorprüfung an Mats/Ronja,
    ob die Ehrenamtlichen das überhaupt wollen.
23. ✅ **ERLEDIGT (20.08.2026, `07150cf`).** Die Suite prüft jetzt die **ausgelieferte
    Fassung** (`npm run build` + `next start`) als Vorgabe; `reuseExistingServer` übernimmt
    keinen fremden Server mehr, sondern prüft die `BUILD_ID`. Stellschrauben `E2E_PORT`,
    `E2E_MODUS=dev`, `E2E_BUILD=auto|aus`, jede beim Start gedruckt (`tests/e2e/README.md`).
    Kosten ~3,8 min inkl. Build. **Der Gewinn war sofort eingelöst** – s. Roadmap 24.
    ⚠️ **Die Regel dahinter bleibt und gilt weiter:** Eine Suite, die den Entwicklungs-Server
    prüft, kann Fehler der ausgelieferten Fassung per Konstruktion nicht sehen. Wer die
    Konfiguration wieder auf `dev` stellt, nimmt genau das zurück.
    ⚠️ **`E2E_MODUS=dev` zerstört den Production-Build** (`next dev` überschreibt `.next`).

24. ✅ **ERLEDIGT (20.08.2026, `04ba621`, live nachgemessen: 360/390/768 je Seitenbreite =
    Fensterbreite).** Details oben im Deploy-Block. Kern in einem Satz: Das Gitter erklärte
    seine Spalten erst ab Tablet-Breite, mobil legte CSS eine **inhaltsgesteuerte** Spalte an,
    und ein 266-px-Quellenname aus dem Live-Feed blies alle sechs Karten auf 386 px auf.
    ⚠️ **Offen geblieben, bewusst:** Dieselbe fehlende Ansage steht in
    `app/player/newsfeed/page.js:136` und `components/team/tabs/KaderTab.js:497`. Vivien hat
    dort **keinen Defekt gemessen** – wer es prüfen will, braucht einen eigenen Auftrag.
    ⚠️ **Zwei kleine Punkte aus Tobias' Gate, beide vorbestehend, beide niedrig:** Der gekürzte
    Quellenname hat keinen Tooltip (→ Vivien) · fällt der Nachrichtenfeed aus, verschwindet der
    Abschnitt kommentarlos, ohne Leerzustand (→ Ronja) · dazu ein **toter Kompakt-Zweig** in
    `components/NewsWidget.js`, der nirgends mehr aufgerufen wird (→ Kai).

25. **Gate-Berichte gehören ins Repo** (Anlass Kai, 20.08.2026). Er konnte seine eigenen
    Befunde K5–K9 aus der Vorrunde **nicht bestätigen**, weil der Bericht nur in der Sitzung
    lag: *„Aus dem Gedächtnis eine Unbedenklichkeitsbescheinigung auszustellen wäre genau die
    Sorte Zusicherung, die ich in diesem Bericht zweimal als Befund melde."* Damit sind K5–K9
    (Rundungs-Wächter, Ring-Lesbarkeit im Ruhezustand, Ringblitz, Blitzdauer an zwei Stellen,
    **und ob der Ball überhaupt im Korb landet**) offen, nicht erledigt. Der letzte wiegt am
    schwersten: Die Pointe des ganzen Umbaus hat keinen Test, die Fortschritts-Leiste hat
    genau diesen – weil Tobias dort einmal fand, dass der Ball nicht ankommt, sondern
    verschwindet.
    Dazu offen: **M2** (Kais `sicherer-pfad.spec.mjs` vergleicht fest gegen Port 3000 und ist
    damit ausgerechnet im isolierten Arbeitsbaum blind), **N4** (die neue Endmarkengröße 28×20
    ist von keinem Test bewacht – wer sie vergrößert, bekommt Tobias' B2 zurück und eine grüne
    Suite) und **ein Signup-Fall durchs Formular** (beide Prüfer kamen nur über `/login`).

18. **Weitere UX-Feinschliffe nach Tester-Feedback** (laufend).
19. **Optional / bewusst offen:** Best-of-Serien + echte Playoff-Bracket-Grafik; Status-basierte
    Tabellen-Exklusion; Stat-Filter Hauptrunde/Playoffs/Gesamt; stabiler `leagueKey`; Benachrichtigung bei
    Team-Follow; sharp-Resize für gespeicherte Upload-JPEGs; Super-Admin-Tabellen auf `<Loading>`/`EmptyState`;
    Folge-Vorschläge nur für neue User; TransferEvents bleiben nach Team-Löschung als Historie (Design);
    `seed-world.mjs --prod` nur nach ausdrücklicher Freigabe des Users.
20. ✅ **GEGENSTANDSLOS (19.08.2026): Roadmap 20, 20b, 20c, 20d, 20e, 20f, 20g und 20h
    — die komplette Ball-Choreografie der Startseite.**
    Acht Punkte, jeder mindestens eine Gate-Runde, alle über denselben Gegenstand: einen
    **gerenderten Ball**, also eine deckende Scheibe, die keinen Buchstaben berühren durfte.
    Sie ist ersetzt durch eine **Linienzeichnung** („Der Abschluss", Konzept
    `docs/HERO-DUNK-KONZEPT-2026-08-19.md`, Auftrag Patrick). Eine Linie darf jeden Buchstaben
    kreuzen — damit stellt sich keine der acht Fragen mehr.
    **Erledigt heißt hier: der Gegenstand ist weg, nicht das Problem gelöst.** Konkret entfallen:
    Abdunkelung (`ballDeckkraftUeberKaesten`, `TEXT_DIM_FLOOR`, `TEXT_FADE_MARGIN`) ·
    Kastenbau (`TreeWalker`, `Range.getClientRects()`, „Fläche oder Tinte") · Lückensuche ·
    mobile Verankerung am Eyebrow · Konturkanal · `MutationObserver` auf den Anmelde-Wechsel ·
    mobiler Einflug samt Schiedsrichter · Übergabe an die Fortschritts-Leiste. Aus rund
    1.350 Zeilen in `HeroScrollStage.js` wurden **235**.
    ⚠️ **WER WIEDER EINE GEFÜLLTE, DECKENDE FORM IN DIESE BÜHNE SETZT, BRAUCHT DEN GANZEN
    APPARAT ZURÜCK** — und zwar vollständig, nicht in Teilen. Er war für seinen Gegenstand
    richtig; er ist weg, weil der Gegenstand weg ist. Der Verlauf hält ihn vor.
    ⚠️ **Was dabei WIRKLICH verloren geht, und es ist nicht nichts:** echte Kugelrotation.
    Nähte, die über eine Kugel wandern statt sich in der Fläche zu drehen, sind mit Vektoren
    nicht erreichbar — das war der ganze Grund, warum die 32-Bild-Sequenz gebaut wurde. Sie
    passt nur nicht in eine Strichzeichnung: Ein fotografisch modellierter Körper in einem
    Diagramm ist ein Genrebruch.
    ⚠️ **Und drei Sätze aus diesen acht Punkten gelten unverändert weiter** — sie beschreiben
    Fehlerformen, nicht den Ball:
    > „Frei" ist eine Aussage über die **Bühne**, „sichtbar" eine über das **Sichtfeld**. Wer in
    > Bühnenkoordinaten spezifiziert, was ein Mensch sehen soll, bekommt grüne Kennzahlen über
    > einen Gegenstand außerhalb des Bildschirms.

    > Vier Runden lang haben wir **Breiten** geprüft. Der Ausfall hing an der **Fensterhöhe**.
    > Eine Prüfmatrix mit nur einer Achse lässt beide Seiten korrekt messen und trotzdem zu
    > gegensätzlichen Ergebnissen kommen.

    > Eine Messung darf ihre eigene Stellgröße nicht verändern.

    Die Höhenachse ist deshalb in `tests/e2e/hero-dunk.spec.mjs` von Anfang an drin, und der
    Umschalter zwischen den beiden Fassungen ist das **Seitenverhältnis**, nicht die Breite —
    ein Breakpoint bei 768 px schnitte dem iPad hochkant **46 %** der Zeichnung weg
    (Gegenprobe gelaufen: genau dieser Fall wird rot).
    ⚠️ **Sieben Testdateien sind mit dem Ball gelöscht worden.** Warum jede einzelne
    gegenstandslos ist, steht in `tests/e2e/README.md`, Abschnitt „Entfallene Tests" —
    **kein Wächter wurde stumm entfernt.**
20a. ⚠️ **DREI STILLE BEFUNDE AUS DIESEM UMBAU — jeder sieht fast richtig aus.**
    Sie stehen vollständig in `docs/HERO-DUNK-KONZEPT-2026-08-19.md` (Nachtrag 2);
    hier die Kurzfassungen, weil alle drei über diesen Hero hinaus gelten.
    **(a) Der Befund, den man sich merken muss:**
    **`pathLength="1"` wirkt nicht, wenn am selben Pfad `vector-effect: non-scaling-stroke`
    steht.** Der Browser rechnet das Strichmuster dann im Gerätemaß; aus `stroke-dasharray: 1`
    wird 1 px an, 1 px aus. Folge: **Jede noch nicht gezeichnete Linie steht dauerhaft als feine
    Punktlinie im Bild**, unabhängig vom Versatz. Kein Konsolenfehler, kein kaputtes Layout —
    es sieht fast richtig aus.
    Gefunden nur, weil im ersten Bild zwei Diagonalen standen, wo per Konstruktion nichts stehen
    durfte. **Der Fehler war vermutlich schon in `PlayDiagram.js` und ist nie aufgefallen**,
    weil die Taktiktafel bei Deckkraft 0,171 lief — ein Geist bei 17 % ist unsichtbar. Erst die
    Anhebung von `ARC_MAX` auf 0,62 hat ihn ans Licht geholt.
    Abhilfe: Der Controller misst jede Pfadlänge **einmal** beim Aufsetzen (`getTotalLength()`,
    funktioniert auch an einer per `display:none` ausgeblendeten Fassung) und fährt das
    Strichmuster in absoluten Einheiten. Bewacht durch `hero-dunk.spec.mjs`; Gegenprobe mit
    zurückgedrehter Abhilfe: rot.
    ⚠️ **UND DERSELBE FEHLER KAM IN ZWEITEM KOSTÜM ZURÜCK, weil meine erste
    Abhilfe halb war:** `non-scaling-stroke` blieb stehen. Damit gilt das
    Strichmuster im **Gerätemaß** — bei Maßstab 1,231 (1280×800) ist der Pfad
    867 Geräteeinheiten lang, das Muster nur 704,6, also **fehlten 19 % jeder
    Linie**. Sichtbar als offener Ball und als Zug, der kurz vor dem Korb
    aufhört. **Auf 360 px unsichtbar** (Maßstab 0,92: ein zu langes Muster
    deckt vollständig), **und mein Test war grün** — er verglich Muster und
    Pfadlänge beide in Benutzereinheiten.
    > **Richtig gemessen, in der falschen Einheit.** Dieselbe Fehlerform wie
    > „Bühne statt Sichtfeld" aus Roadmap 20b, eine Ebene tiefer.
    Endgültige Abhilfe: `vector-effect` fällt aus der ganzen Zeichnung; der
    Strich skaliert jetzt mit (gemessen 1,9–4,9 px).

    **(b) Ein Streupunkt aus zwei Nachkommastellen.** Im ersten Bild stand ein
    orangefarbener Punkt über der Taste, wo noch nichts gezeichnet sein durfte.
    `toFixed(2)` machte aus dem Versatz 188,522 den Wert 188,52 — die
    verbleibenden **0,002 px Strich** zeichnete `stroke-linecap: round` als
    **vollen Punkt in Strichbreite**. Abhilfe: nicht runden UND die Lücke im
    Strichmuster 2 px länger machen als den Pfad, damit die Rechnung gegen
    Rundungsstaub immun ist statt auf exakte Gleitkommazahlen zu bauen.

    **(c) Das Kontrast-Prüfmaß war zweimal falsch, in BEIDE Richtungen.**
    Zu wenig: Es prüfte nur `paper-50` (so hatte das Konzept gerechnet), während
    die Kleinzeile unter der Taste (`text-mist-400`) über der stärksten Linie
    bei **2,79 : 1** lag — unter AA, Test grün. Sie steht jetzt in `paper-100`
    (mindestens 4,84 : 1 über jeder Ebene, also lageunabhängig).
    Zu viel: Die zweite Fassung prüfte jede Textfarbe gegen jede Ebene und
    meldete „Community" (`brand-400`) mit 3,63 : 1 — ein Fehlalarm auf fünf von
    sechs geprüften Viewports. Eine exakte Berührungsmessung
    (`isPointInStroke()`) zeigt: **auf 1024×768 kreuzt der Zug das Wort
    tatsächlich, mit 2,77 : 1.**
    ⚠️ **Geometrie löst das nicht** – der Ball muss über dem Ring stehen, der
    Ring steht auf halber Bühnenhöhe, dort steht der mittig gesetzte Inhalt.
    Aufhellen auch nicht (`brand-100` hält 4,74 : 1, ist am gebauten Stück aber
    ein blasses Creme neben einer weißen Zeile).
    **Entscheidung: Die Hero-Überschrift verliert ihren Farbakzent.** Ursache
    ist, dass das Designsystem genau EIN Orange erlaubt und es nach der
    Reduktion drei Dinge beanspruchten – Taste, Überschriftswort, Zeichnung.
    Das schwächste ist das Wort.
    ⚠️ **Abweichung von `docs/VISUELLE-RICHTUNG-2026-08-12.md` („Schlüsselwort
    in brand-500"), ausdrücklich nur für diesen Hero. Patrick kann sie
    überstimmen** – dann muss der Befund auf 1024×768 anders gelöst werden.
21. ✅ **ERLEDIGT (17.08.2026): Cache-Vorgabe für `/images/` und `/fonts/`.** Gesetzt in
    `next.config.mjs` über `headers()` – **nicht** in Nginx, damit die Vorgabe versioniert ist und
    mit jedem Deploy mitgeht statt am Server zu leben. Wert:
    `public, max-age=2592000, stale-while-revalidate=86400` (30 Tage, wie die Konvention für die
    Upload-Verzeichnisse). Auf der Production-Runtime nachgemessen, dann live.
    ⚠️ **Bewusst KEIN `immutable` und kein Jahr:** Die Dateinamen sind **nicht inhaltsadressiert**.
    `ball-basketball-32x200.webp` nennt Bildzahl und Kantenlänge, aber nichts über den Inhalt – wird
    die Sequenz mit denselben Parametern neu erzeugt (etwa mit anderem Nahtmuster), heißt die Datei
    gleich. Ein Jahr mit `immutable` hielte Wiederkehrer dauerhaft auf dem alten Ball, **und niemand
    könnte es sehen**, weil die Seite bei Erstbesuchern korrekt aussieht.
    ⚠️ **Regel daraus: Wer den Inhalt einer Datei unter gleichem Namen ändert, muss den Namen
    ändern.** Für die Ball-Sequenz ist das über drei Stellen gekoppelt und durch
    `tests/e2e/ball-sequenz.spec.mjs` abgesichert; für `logo.svg` und die Auth-Motive gibt es diese
    Absicherung **nicht**.

22. ✅ **ERLEDIGT (19.08.2026, `062989e`, live nachgemessen).** `/signup` lieferte 0
    Eingabefelder, 0 `<main>` und 0 Verweise auf Datenschutz und Impressum aus. Ursache:
    `useSearchParams()` ließ beim statischen Vorrendern die umschließende `<Suspense>`-Grenze
    auf ihren **leeren** Ersatzinhalt fallen. Behoben – der Haken wurde an zwei Stellen benutzt,
    beide laufen ohnehin erst im Browser und lesen die Adresszeile jetzt direkt (so, wie es der
    Google-Effekt in derselben Datei immer tat); die leere Grenze entfällt ersatzlos.
    **Live: 6 Eingabefelder, 1 `<main>`, je 3 Rechtsverweise.**
    Bewacht durch `tests/e2e/signup-ohne-js.spec.mjs` – **es liest das rohe Server-Blatt, nicht
    die Seite im Browser.** Das ist der ganze Punkt: Im Browser sah `/signup` immer richtig aus,
    ein Browser-Test wäre per Konstruktion immer grün geblieben, und genau deshalb ist es
    monatelang niemandem aufgefallen. Gegenprobe mit wieder eingebautem Haken: 0 Eingabefelder,
    Test rot.
    ⚠️ **Noras Punkt ist erledigt, aber er war real:** Die Rechtsverweise, die sie am 13.08.
    für genau diese Seite verlangt hat (Art. 13 DSGVO, § 5 DDG), waren eingebaut – und
    erreichten das ausgelieferte Blatt nie.
    ⚠️ **Dringlich wurde es durch eine Entscheidung, nicht durch den Fehler:** Neles Hero-Umbau
    macht `/signup` zum **einzigen** Ausgang der Startseite. Vorher war es ein Schönheitsfehler.
    Ursprünglicher Befund zur Nachlese: `docs/SIGNUP-OHNE-JS-2026-08-17.md`.

23. ⚠️ **Die Testsuite läuft gegen den falschen Server** (Befund Kai, 20.08.2026, hoch).
    `tests/e2e/playwright.config.mjs` startet fest `npm run dev`. Fehler, die **nur in der
    ausgelieferten Fassung** auftreten, kann die Suite per Konstruktion nicht sehen. Belegt am
    selben Commit in derselben Minute: **Entwicklung 231 grün · Produktion 225 grün, 6 rot.**
    Die Projektregel „vor Deploy immer die Production-Runtime testen" und das Werkzeug
    widersprechen sich – **alle früher protokollierten „grün"-Zahlen sind Dev-Zahlen.**
    ⚠️ Der Beleg dafür, dass das nicht theoretisch ist, ist Roadmap 24: Gefunden hat es nicht
    die Suite, sondern der Blick auf die ausgelieferte Fassung.
    Umstellung ist keine Nebenarbeit (Build vor jedem Lauf, längere Laufzeit) → Aufwand an Ole.

24. ⚠️ **Nachrichten-Karten ragen auf schmalen Handys über den Bildschirm** (Befund Kai,
    20.08.2026, mittel, **vorbestehend und live**). Auf **360 und 390 px** ist die Startseite
    **426 px breit statt 360** – der Leser verliert rechts ein Stück jeder Nachricht.
    Äußerster Verursacher: der Einblend-Rahmen um die Karte in `components/NewsWidget.js`
    (Karte bei x=40, 386 px breit), 12 Elemente betroffen, 45 px Überstand.
    ⚠️ **Nur in der Produktionsfassung sichtbar** – deshalb hat es nie ein Test gefunden.
    Kai hat `bd99263` eigens gebaut und gegengemessen: dort identisch, also kein Rückfall aus
    dem Hero-Umbau. 360 px ist die verbreitetste Android-Breite Deutschlands.

25. **Gate-Berichte gehören ins Repo** (Anlass Kai, 20.08.2026). Er konnte seine eigenen
    Befunde K5–K9 aus der Vorrunde **nicht bestätigen**, weil der Bericht nur in der Sitzung
    lag: *„Aus dem Gedächtnis eine Unbedenklichkeitsbescheinigung auszustellen wäre genau die
    Sorte Zusicherung, die ich in diesem Bericht zweimal als Befund melde."* Damit sind K5–K9
    (Rundungs-Wächter, Ring-Lesbarkeit im Ruhezustand, Ringblitz, Blitzdauer an zwei Stellen,
    **und ob der Ball überhaupt im Korb landet**) offen, nicht erledigt. Der letzte wiegt am
    schwersten: Die Pointe des ganzen Umbaus hat keinen Test, die Fortschritts-Leiste hat
    genau diesen – weil Tobias dort einmal fand, dass der Ball nicht ankommt, sondern
    verschwindet.
    Dazu offen: **M2** (Kais `sicherer-pfad.spec.mjs` vergleicht fest gegen Port 3000 und ist
    damit ausgerechnet im isolierten Arbeitsbaum blind), **N4** (die neue Endmarkengröße 28×20
    ist von keinem Test bewacht – wer sie vergrößert, bekommt Tobias' B2 zurück und eine grüne
    Suite) und **ein Signup-Fall durchs Formular** (beide Prüfer kamen nur über `/login`).

18. **Weitere UX-Feinschliffe nach Tester-Feedback** (laufend).
19. **Optional / bewusst offen:** Best-of-Serien + echte Playoff-Bracket-Grafik; Status-basierte
    Tabellen-Exklusion; Stat-Filter Hauptrunde/Playoffs/Gesamt; stabiler `leagueKey`; Benachrichtigung bei
    Team-Follow; sharp-Resize für gespeicherte Upload-JPEGs; Super-Admin-Tabellen auf `<Loading>`/`EmptyState`;
    Folge-Vorschläge nur für neue User; TransferEvents bleiben nach Team-Löschung als Historie (Design);
    `seed-world.mjs --prod` nur nach ausdrücklicher Freigabe des Users.
20. ✅ **GEGENSTANDSLOS (19.08.2026): Roadmap 20, 20b, 20c, 20d, 20e, 20f, 20g und 20h
    — die komplette Ball-Choreografie der Startseite.**
    Acht Punkte, jeder mindestens eine Gate-Runde, alle über denselben Gegenstand: einen
    **gerenderten Ball**, also eine deckende Scheibe, die keinen Buchstaben berühren durfte.
    Sie ist ersetzt durch eine **Linienzeichnung** („Der Abschluss", Konzept
    `docs/HERO-DUNK-KONZEPT-2026-08-19.md`, Auftrag Patrick). Eine Linie darf jeden Buchstaben
    kreuzen — damit stellt sich keine der acht Fragen mehr.
    **Erledigt heißt hier: der Gegenstand ist weg, nicht das Problem gelöst.** Konkret entfallen:
    Abdunkelung (`ballDeckkraftUeberKaesten`, `TEXT_DIM_FLOOR`, `TEXT_FADE_MARGIN`) ·
    Kastenbau (`TreeWalker`, `Range.getClientRects()`, „Fläche oder Tinte") · Lückensuche ·
    mobile Verankerung am Eyebrow · Konturkanal · `MutationObserver` auf den Anmelde-Wechsel ·
    mobiler Einflug samt Schiedsrichter · Übergabe an die Fortschritts-Leiste. Aus rund
    1.350 Zeilen in `HeroScrollStage.js` wurden **235**.
    ⚠️ **WER WIEDER EINE GEFÜLLTE, DECKENDE FORM IN DIESE BÜHNE SETZT, BRAUCHT DEN GANZEN
    APPARAT ZURÜCK** — und zwar vollständig, nicht in Teilen. Er war für seinen Gegenstand
    richtig; er ist weg, weil der Gegenstand weg ist. Der Verlauf hält ihn vor.
    ⚠️ **Was dabei WIRKLICH verloren geht, und es ist nicht nichts:** echte Kugelrotation.
    Nähte, die über eine Kugel wandern statt sich in der Fläche zu drehen, sind mit Vektoren
    nicht erreichbar — das war der ganze Grund, warum die 32-Bild-Sequenz gebaut wurde. Sie
    passt nur nicht in eine Strichzeichnung: Ein fotografisch modellierter Körper in einem
    Diagramm ist ein Genrebruch.
    ⚠️ **Und drei Sätze aus diesen acht Punkten gelten unverändert weiter** — sie beschreiben
    Fehlerformen, nicht den Ball:
    > „Frei" ist eine Aussage über die **Bühne**, „sichtbar" eine über das **Sichtfeld**. Wer in
    > Bühnenkoordinaten spezifiziert, was ein Mensch sehen soll, bekommt grüne Kennzahlen über
    > einen Gegenstand außerhalb des Bildschirms.

    > Vier Runden lang haben wir **Breiten** geprüft. Der Ausfall hing an der **Fensterhöhe**.
    > Eine Prüfmatrix mit nur einer Achse lässt beide Seiten korrekt messen und trotzdem zu
    > gegensätzlichen Ergebnissen kommen.

    > Eine Messung darf ihre eigene Stellgröße nicht verändern.

    Die Höhenachse ist deshalb in `tests/e2e/hero-dunk.spec.mjs` von Anfang an drin, und der
    Umschalter zwischen den beiden Fassungen ist das **Seitenverhältnis**, nicht die Breite —
    ein Breakpoint bei 768 px schnitte dem iPad hochkant **46 %** der Zeichnung weg
    (Gegenprobe gelaufen: genau dieser Fall wird rot).
    ⚠️ **Sieben Testdateien sind mit dem Ball gelöscht worden.** Warum jede einzelne
    gegenstandslos ist, steht in `tests/e2e/README.md`, Abschnitt „Entfallene Tests" —
    **kein Wächter wurde stumm entfernt.**
20a. ⚠️ **DREI STILLE BEFUNDE AUS DIESEM UMBAU — jeder sieht fast richtig aus.**
    Sie stehen vollständig in `docs/HERO-DUNK-KONZEPT-2026-08-19.md` (Nachtrag 2);
    hier die Kurzfassungen, weil alle drei über diesen Hero hinaus gelten.
    **(a) Der Befund, den man sich merken muss:**
    **`pathLength="1"` wirkt nicht, wenn am selben Pfad `vector-effect: non-scaling-stroke`
    steht.** Der Browser rechnet das Strichmuster dann im Gerätemaß; aus `stroke-dasharray: 1`
    wird 1 px an, 1 px aus. Folge: **Jede noch nicht gezeichnete Linie steht dauerhaft als feine
    Punktlinie im Bild**, unabhängig vom Versatz. Kein Konsolenfehler, kein kaputtes Layout —
    es sieht fast richtig aus.
    Gefunden nur, weil im ersten Bild zwei Diagonalen standen, wo per Konstruktion nichts stehen
    durfte. **Der Fehler war vermutlich schon in `PlayDiagram.js` und ist nie aufgefallen**,
    weil die Taktiktafel bei Deckkraft 0,171 lief — ein Geist bei 17 % ist unsichtbar. Erst die
    Anhebung von `ARC_MAX` auf 0,62 hat ihn ans Licht geholt.
    Abhilfe: Der Controller misst jede Pfadlänge **einmal** beim Aufsetzen (`getTotalLength()`,
    funktioniert auch an einer per `display:none` ausgeblendeten Fassung) und fährt das
    Strichmuster in absoluten Einheiten. Bewacht durch `hero-dunk.spec.mjs`; Gegenprobe mit
    zurückgedrehter Abhilfe: rot.
    ⚠️ **UND DERSELBE FEHLER KAM IN ZWEITEM KOSTÜM ZURÜCK, weil meine erste
    Abhilfe halb war:** `non-scaling-stroke` blieb stehen. Damit gilt das
    Strichmuster im **Gerätemaß** — bei Maßstab 1,231 (1280×800) ist der Pfad
    867 Geräteeinheiten lang, das Muster nur 704,6, also **fehlten 19 % jeder
    Linie**. Sichtbar als offener Ball und als Zug, der kurz vor dem Korb
    aufhört. **Auf 360 px unsichtbar** (Maßstab 0,92: ein zu langes Muster
    deckt vollständig), **und mein Test war grün** — er verglich Muster und
    Pfadlänge beide in Benutzereinheiten.
    > **Richtig gemessen, in der falschen Einheit.** Dieselbe Fehlerform wie
    > „Bühne statt Sichtfeld" aus Roadmap 20b, eine Ebene tiefer.
    Endgültige Abhilfe: `vector-effect` fällt aus der ganzen Zeichnung; der
    Strich skaliert jetzt mit (gemessen 1,9–4,9 px).

    **(b) Ein Streupunkt aus zwei Nachkommastellen.** Im ersten Bild stand ein
    orangefarbener Punkt über der Taste, wo noch nichts gezeichnet sein durfte.
    `toFixed(2)` machte aus dem Versatz 188,522 den Wert 188,52 — die
    verbleibenden **0,002 px Strich** zeichnete `stroke-linecap: round` als
    **vollen Punkt in Strichbreite**. Abhilfe: nicht runden UND die Lücke im
    Strichmuster 2 px länger machen als den Pfad, damit die Rechnung gegen
    Rundungsstaub immun ist statt auf exakte Gleitkommazahlen zu bauen.

    **(c) Das Kontrast-Prüfmaß war zweimal falsch, in BEIDE Richtungen.**
    Zu wenig: Es prüfte nur `paper-50` (so hatte das Konzept gerechnet), während
    die Kleinzeile unter der Taste (`text-mist-400`) über der stärksten Linie
    bei **2,79 : 1** lag — unter AA, Test grün. Sie steht jetzt in `paper-100`
    (mindestens 4,84 : 1 über jeder Ebene, also lageunabhängig).
    Zu viel: Die zweite Fassung prüfte jede Textfarbe gegen jede Ebene und
    meldete „Community" (`brand-400`) mit 3,63 : 1 — ein Fehlalarm auf fünf von
    sechs geprüften Viewports. Eine exakte Berührungsmessung
    (`isPointInStroke()`) zeigt: **auf 1024×768 kreuzt der Zug das Wort
    tatsächlich, mit 2,77 : 1.**
    ⚠️ **Geometrie löst das nicht** – der Ball muss über dem Ring stehen, der
    Ring steht auf halber Bühnenhöhe, dort steht der mittig gesetzte Inhalt.
    Aufhellen auch nicht (`brand-100` hält 4,74 : 1, ist am gebauten Stück aber
    ein blasses Creme neben einer weißen Zeile).
    **Entscheidung: Die Hero-Überschrift verliert ihren Farbakzent.** Ursache
    ist, dass das Designsystem genau EIN Orange erlaubt und es nach der
    Reduktion drei Dinge beanspruchten – Taste, Überschriftswort, Zeichnung.
    Das schwächste ist das Wort.
    ⚠️ **Abweichung von `docs/VISUELLE-RICHTUNG-2026-08-12.md` („Schlüsselwort
    in brand-500"), ausdrücklich nur für diesen Hero. Patrick kann sie
    überstimmen** – dann muss der Befund auf 1024×768 anders gelöst werden.
21. ✅ **ERLEDIGT (17.08.2026): Cache-Vorgabe für `/images/` und `/fonts/`.** Gesetzt in
    `next.config.mjs` über `headers()` – **nicht** in Nginx, damit die Vorgabe versioniert ist und
    mit jedem Deploy mitgeht statt am Server zu leben. Wert:
    `public, max-age=2592000, stale-while-revalidate=86400` (30 Tage, wie die Konvention für die
    Upload-Verzeichnisse). Auf der Production-Runtime nachgemessen, dann live.
    ⚠️ **Bewusst KEIN `immutable` und kein Jahr:** Die Dateinamen sind **nicht inhaltsadressiert**.
    `ball-basketball-32x200.webp` nennt Bildzahl und Kantenlänge, aber nichts über den Inhalt – wird
    die Sequenz mit denselben Parametern neu erzeugt (etwa mit anderem Nahtmuster), heißt die Datei
    gleich. Ein Jahr mit `immutable` hielte Wiederkehrer dauerhaft auf dem alten Ball, **und niemand
    könnte es sehen**, weil die Seite bei Erstbesuchern korrekt aussieht.
    ⚠️ **Regel daraus: Wer den Inhalt einer Datei unter gleichem Namen ändert, muss den Namen
    ändern.** Für die Ball-Sequenz ist das über drei Stellen gekoppelt und durch
    `tests/e2e/ball-sequenz.spec.mjs` abgesichert; für `logo.svg` und die Auth-Motive gibt es diese
    Absicherung **nicht**.

22. ⚠️ **`/signup` liefert ohne JavaScript eine leere Seite — SEIT DEM 19.08.2026 DRINGLICHER,
    liegt bei Vivien UND Nora.** Neuer Grund: Der Hero hat nach der Reduktion (Nele,
    `docs/HERO-AKTION-ENTSCHEIDUNG-2026-08-19.md`) **genau einen Ausgang**, und der ist
    `/signup`. Bisher war der Befund „kein Blocker", weil daneben zwei andere Tasten standen.
    Ab jetzt ist es die einzige Tür der reichweitenstärksten Seite.
    Befund 17.08.2026, Nebenbefund der Sprungmarken-Arbeit, **vorbestehend**, kein Blocker:
    `docs/SIGNUP-OHNE-JS-2026-08-17.md`. Im rohen Server-HTML von `/signup` stehen **0**
    Formularfelder, **0** `<main>`, **0** Verweise auf Datenschutz und Impressum — ausgeliefert
    werden nur Banner und Sprungmarke. Ursache: `useSearchParams()` (Z. 32) auf einer statisch
    vorgerenderten Seite lässt Next die nächste `<Suspense>`-Grenze auf ihren Fallback
    zurückfallen, und der ist **leer** (Z. 291 ff.). `/login` hat dieselbe fallback-lose Grenze,
    nutzt aber kein `useSearchParams()` → rendert vollständig. Im Browser ist nach der Hydration
    alles korrekt.
    ⚠️ **Der Punkt für Nora ist der unangenehmere:** Der Datenschutzverweis, den sie am 13.08.
    für `/signup` gefordert hat (`docs/RECHT-LEISTUNGSKARTE-2026-08-13.md`), wurde in
    `AuthShell.js` eingebaut — und erreicht auf **genau dieser Seite** das Server-HTML nicht.
    Die damalige Abhilfe greift dort nur mit JavaScript. Entschärfen könnte es, dass ohne
    JavaScript auch kein Formular existiert, also nichts erhoben wird — das zu beurteilen ist
    ihre Sache, nicht meine.
    Für Vivien: `<Suspense>` ohne `fallback` heißt **kein gestalteter Ladezustand** auf dem
    QR-Landepunkt. Nicht gemessen und offen: **wie lang** die Lücke auf echten Geräten ist.

### Bekannte Einschränkungen (lokale Dev-Umgebung)
- SMTP-/Google-Keys fehlen in der lokalen `.env` → Mails/Google-Login nur auf dem VPS (hoops_prod) live
  testbar; lokal über In-App-Notifs + Trigger-Logs verifizieren.
- Schema-Änderungen erfordern Dev-Neustart (mongoose-Model-Cache). Nach Dev-Server-Lock ggf. `.next` löschen
  vor `npm run build`. Vor Deploy immer Production-Runtime testen (`npm start`), nicht nur `next dev`.

---

## 1. Projekt-Überblick

**Hoops Germany** ist eine Community-Plattform für Amateur-Basketball in Deutschland.  
Live unter: `hoopsgermany.de`  
VPS: Hostinger Ubuntu, `/root/sports/`, PM2 → `npm start`  
Repo: `https://github.com/Schemura98/sports-website.git`

**Tech-Stack (beibehalten):**
- Next.js 14 (App Router, `"use client"` wo nötig)
- MongoDB + Mongoose
- Tailwind CSS (Design: Orange `#f97316` / `orange-500` als Primärfarbe, weiß/grau-Töne)
- JWT-Auth (jsonwebtoken)
- Nodemailer (SMTP: info@hoopsgermany.de)
- react-icons/fa
- axios (Frontend HTTP)
- Inter (Google Font)

---

## 2. Umgebungsvariablen (.env – NUR auf VPS, NIE in git)

```
MONGODB_URI=...
SECRET_KEY=...
SMTP_USER=info@hoopsgermany.de
SMTP_PASS=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CRON_SECRET=...
NEXTAUTH_URL=https://hoopsgermany.de
```

---

## 3. Datenbank-Modelle (MongoDB / Mongoose)

### Player
```js
{
  firstName, lastName,
  email (unique), password (nullable), googleId (nullable),
  status: "pending" | "active",
  teamId: ObjectId → teams,
  profileImage: String,
  followers: [ObjectId → players],
  following: [ObjectId → players],
  notifications: [{
    type: "follow"|"join_request"|"join_approved"|"pending_result"|"match_result",
    fromPlayerId, teamId, teamName, teamSlug, matchId, message, read, createdAt
  }],
  height, age, weight, birthdate, country, hometown,
  fibaLink, position, nationality, aboutPlayer,
  resetPasswordToken, resetPasswordExpiry,
  transferStatus: "verfuegbar"|"nicht_verfuegbar",
  preferredLeague, transferNote,
  isTeamAdmin: Boolean,
  teamAdminOf: ObjectId → teams,
  isSuperAdmin: Boolean,
  teamJoinRequest: ObjectId → teams,
  followingTeams: [ObjectId → teams],
  instagram: String
}
```

### Team
```js
{
  teamName (unique), email (unique), password,
  about, region, logo, banner,
  slug (unique),
  followers: [ObjectId → players],
  adminPlayerId: ObjectId → players,  // Spieler-geführtes Team
  inviteToken: String,
  rosterSlots: [{
    name, position, number,
    claimedBy: ObjectId → players,
    claimToken: String,
    status: "empty"|"pending"|"confirmed"
  }]
}
```

### Match
```js
{
  teamA, teamB: ObjectId → teams,
  date, location,
  leagueId: ObjectId → leagues,
  status: "scheduled"|"completed"|"cancelled",
  winningTeam: ObjectId,
  playerStats: [{
    player: ObjectId → players,  // null wenn kein Account
    playerName, rosterSlotId,   // für Slot-Spieler ohne Account
    team: ObjectId,
    points, assists, rebounds, didNotPlay
  }],
  winningTeamPoints, losingTeamPoints,
  notifiedPendingResult: Boolean,
  teamAResult: { ownPoints, opponentPoints, submittedBy, submittedAt },
  teamBResult: { ownPoints, opponentPoints, submittedBy, submittedAt },
  resultStatus: "pending"|"confirmed"|"mismatch"
}
```

### League
```js
{ name, season, teams: [ObjectId], matches: [ObjectId], active: Boolean }
```

### Post
```js
{ player: ObjectId, content, image, likes: [ObjectId], comments: [{player, text, createdAt}], createdAt }
```

### Tryout
```js
{
  teamId: ObjectId, date, location,
  positions: [String],  // kanonische Namen aus POSITIONS, keine Kürzel
  description,
  status: "active"|"closed",
  applicants: [{ playerId, appliedAt }]
}
```

### Admin
```js
{ username, password, email }
```

### Feedback
```js
{ message, type, createdAt, status: "new"|"read" }
```

### AnalyticsEvent
```js
{ eventType, path, sessionId, createdAt }
```

---

## 4. Seiten & Routing

### Öffentliche Seiten
| Route | Beschreibung |
|-------|-------------|
| `/` | Landing Page (Hero + Features + How it works) |
| `/login` | Spieler-Login (Email/PW + Google OAuth) |
| `/signup` | Spieler-Registrierung |
| `/reset-password` | Passwort zurücksetzen (Token-Flow) |
| `/home` | Newsfeed (eingeloggte Spieler) |
| `/spieler` | Alle Spieler (public) |
| `/teams` | Alle Teams (public) |
| `/spiele` | Spielplan/Ergebnisse (public) |
| `/ligen` | Liga-Übersicht |
| `/ligen/[id]` | Liga-Detail + Tabelle |
| `/match/[id]` | Spiel-Detail + Stats |
| `/tryouts` | Alle offenen Tryouts |
| `/tryouts/[id]` | Tryout-Detail + Bewerbung |
| `/topscorer` | Topscorer-Tabelle |
| `/about` | Über uns |
| `/impressum` | Impressum |
| `/datenschutz` | Datenschutzerklärung |
| `/kontakt` | Kontakt |
| `/feedback` | Feedback-Formular |
| `/oauth-landing` | Google OAuth Callback-Landing |

### Spieler-Seiten (Auth required)
| Route | Beschreibung |
|-------|-------------|
| `/player/newsfeed` | Spieler-Newsfeed (Posts, Following-Feed) |
| `/player/edit-profile` | Profil bearbeiten |
| `/player/update-password` | Passwort ändern |
| `/player/player-detail` | Eigene Profilansicht |
| `/player/view-player/[slug]` | Fremdes Spielerprofil |

### Team-Seiten
| Route | Beschreibung |
|-------|-------------|
| `/team/login` | Team-Login |
| `/team/register` | Team-Registrierung |
| `/team/dashboard` | Team-Dashboard (public: Kader, Spiele, Posts) |
| `/team/edit-team` | Team-Profil bearbeiten |
| `/team/admin` | **Team-Admin Panel** (Hauptfeature, s. Abschnitt 5) |
| `/team/join/[token]` | Einladungs-Link (Transfer-Beitritt) |
| `/team/claim/[token]` | Roster-Slot beanspruchen |
| `/team/team-detail/[slug]` | Öffentliche Team-Profilseite |

### Admin-Seiten (Super-Admin)
| Route | Beschreibung |
|-------|-------------|
| `/admin/login` | Admin-Login |
| `/admin/dashboard` | Übersicht + Charts |
| `/admin/players` | Alle Spieler verwalten |
| `/admin/teams` | Alle Teams verwalten |
| `/admin/matches` | Spiele verwalten |
| `/admin/update-match/[match-id]` | Spiel bearbeiten |
| `/admin/leagues` | Ligen verwalten |
| `/admin/analytics` | Seitenaufrufe etc. |
| `/admin/feedback` | Feedback-Nachrichten |
| `/admin/moderation` | Moderation |

---

## 5. Team-Admin Panel (Kernfeature)

**Route:** `/team/admin`  
**Auth:** `teamAuthToken` (localStorage) ODER `playerAuthToken` wenn `isTeamAdmin=true`

### Tabs:
1. **Kader** – Roster-Slots anzeigen, Slot teilen (Invite-Link), Slot-Status (empty/pending/confirmed)
2. **Anfragen** – Spieler-Beitrittsanfragen genehmigen/ablehnen
3. **Spielplan** – Spiele eintragen (Gegner, Datum, Ort)
4. **Ergebnisse** – Ergebnis einreichen (eigene + Gegner-Punkte + Spieler-Stats)
5. **Tryouts** – Tryouts ausschreiben, Status togglen (active/closed)
6. **Einstellungen** – Team-Name bearbeiten, Logo hochladen, Banner hochladen, Einladungslink

### Einladungssystem:
- Admin erstellt Roster-Slot (Name + Position)
- Slot hat einen eindeutigen `claimToken`
- Einladungs-E-Mail an den Spieler mit Link `/team/claim/[token]`
- Spieler registriert sich und Slot wird auf "pending" gesetzt
- Admin genehmigt → "confirmed"

### Ergebnis-Verifikation:
- Beide Teams reichen Ergebnis separat ein
- System vergleicht: übereinstimmend → "confirmed", widersprüchlich → "mismatch"
- Admin kann Mismatches auflösen

---

## 6. API-Endpunkte (vollständig)

### Auth
- `POST /api/player/playerlogin` – Login (email, password) → JWT
- `POST /api/player/playerregister` – Registrierung
- `GET /api/auth/google` – Google OAuth initiieren
- `GET /api/auth/google/callback` – Google OAuth Callback
- `POST /api/player/forgotpassword` – Passwort-Reset E-Mail
- `POST /api/player/resetpassword` – Neues Passwort setzen (token)

### Spieler
- `POST /api/player/getmyinfo` – Eigenes Profil (token)
- `POST /api/player/fetchinfo` – Spielerinfos
- `POST /api/player/fetchsingleplayerinfo` – Ein Spieler by slug
- `POST /api/player/fetchall` – Alle Spieler
- `POST /api/player/update-profile` – Profil updaten
- `POST /api/player/update-password` – Passwort ändern
- `POST /api/player/followplayer` – Spieler folgen/entfolgen
- `POST /api/player/checkfollowing` – Folge-Status prüfen
- `POST /api/player/getfollowlist` – Follower/Following-Liste
- `POST /api/player/fetchposts` – Posts eines Spielers
- `POST /api/player/fetchsingleplayerposts` – Posts by Slug
- `POST /api/player/getfollowingposts` – Feed (Following)
- `POST /api/player/careerstats` – Karriere-Stats
- `POST /api/player/calculateplayerstats` – Stats berechnen
- `POST /api/player/topscorer` – Topscorer-Tabelle
- `POST /api/player/transfer` – Transfer-Status lesen
- `POST /api/player/update-transfer` – Transfer-Status setzen
- `POST /api/player/team-feed` – Team-Feed
- `POST /api/player/getnotifications` – Benachrichtigungen
- `POST /api/player/marknotificationsread` – Als gelesen markieren

### Team
- `POST /api/team/teamlogin` – Login (email, password) → JWT
- `POST /api/team/teamregister` – Team registrieren
- `POST /api/team/fetchteams` – Alle Teams
- `POST /api/team/fetchinfo` – Team-Info (by token)
- `POST /api/team/fetchsingleteaminfo` – Team by Slug
- `POST /api/team/fetchsingleteamplayers` – Team-Spieler by Slug
- `POST /api/team/fetchsingleteamposts` – Team-Posts by Slug
- `POST /api/team/fetchtopteams` – Top-Teams
- `POST /api/team/addplayer` – Spieler hinzufügen
- `POST /api/team/removeplayer` – Spieler entfernen
- `POST /api/team/requestjoin` – Beitrittsanfrage stellen
- `POST /api/team/fetchjoinrequests` – Anfragen abrufen
- `POST /api/team/handlejoinrequest` – Anfrage genehmigen/ablehnen
- `POST /api/team/followteam` – Team folgen/entfolgen
- `POST /api/team/update-team` – Team-Daten updaten (Name, Logo) – dual auth
- `POST /api/team/updatebanner` – Banner hochladen
- `POST /api/team/generate-invite` – Einladungs-Token generieren
- `POST /api/team/invite-email` – Einladungs-E-Mail senden
- `POST /api/team/join-team` – Team via Token beitreten
- `POST /api/team/submit-match-result` – Ergebnis einreichen
- `POST /api/team/matchesupdate` – Spiele-Update

### Roster-Slots
- `POST /api/team/roster/add-slot` – Slot hinzufügen
- `POST /api/team/roster/remove-slot` – Slot entfernen
- `POST /api/team/roster/slot-info` – Slot-Info
- `POST /api/team/roster/claim-slot` – Slot beanspruchen
- `POST /api/team/roster/request-claim` – Anspruch anfragen
- `POST /api/team/roster/approve-claim` – Anspruch genehmigen
- `POST /api/team/roster/admin-join` – Admin trägt sich selbst ein
- `POST /api/team/roster/send-invite-email` – Einladungs-Mail für Slot
- `POST /api/team/report-roster-slot` – Slot melden

### Spiele
- `POST /api/admin/createandfetchmatches` – Spiel erstellen oder alle holen
- `GET /api/matches/public` – Öffentliche Spiele
- `GET /api/match/[id]` – Spiel-Detail

### Ligen
- `GET /api/leagues` – Alle Ligen
- `GET/PATCH/DELETE /api/leagues/[id]` – Liga CRUD
- `POST /api/admin/createleague` – Liga erstellen
- `POST /api/admin/updateleague` – Liga updaten
- `POST /api/admin/deleteleague` – Liga löschen

### Admin
- `POST /api/admin/adminlogin` – Admin-Login
- `POST /api/admin/adminregister` – Admin anlegen
- `POST /api/admin/fetchallplayers` – Alle Spieler (Admin)
- `POST /api/admin/fetchallteams` – Alle Teams (Admin)
- `POST /api/admin/deleteplayer` – Spieler löschen
- `POST /api/admin/deleteteam` – Team löschen
- `POST /api/admin/deletepost` – Post löschen
- `POST /api/admin/setteamadmin` – Spieler als Team-Admin setzen
- `POST /api/admin/updatematch` – Spiel-Ergebnis als Admin setzen
- `POST /api/admin/notify-pending-results` – Pending-Results-E-Mails (Cron)

### Tryouts
- `POST /api/tryouts/create` – Tryout erstellen
- `GET /api/tryouts` – Alle aktiven Tryouts
- `GET /api/tryouts/[id]` – Tryout-Detail
- `POST /api/tryouts/[id]/apply` – Bewerben
- `POST /api/tryouts/my-tryouts` – Meine Tryouts (Team-Admin)
- `PATCH /api/tryouts/my-tryouts` – Status ändern

### Sonstiges
- `POST /api/posts/uploadpost` – Post erstellen
- `POST /api/posts/likepost` – Like togglen
- `POST /api/posts/addcomment` – Kommentar
- `POST /api/feedback` – Feedback senden (→ E-Mail an Admin)
- `GET /api/news/rss` – Basketball-News RSS
- `POST /api/analytics/track` – Seitenaufruf tracken
- `GET /api/analytics/summary` – Analytics-Zusammenfassung

---

## 7. Auth-System

**Zwei Auth-Token-Typen (beide in localStorage):**
1. `teamAuthToken` – für Team-Accounts (JWT enthält `teamId`)
2. `playerAuthToken` – für Spieler-Accounts (JWT enthält `playerId`/`id`)

**Team-Admin-Flow:**
- Spieler kann Admin eines Teams sein: `isTeamAdmin=true`, `teamAdminOf=ObjectId`
- Alle Team-Admin-Endpoints akzeptieren BEIDE Token-Typen
- Wenn `teamAuthToken` fehlt → prüfe `playerAuthToken` → hole `teamAdminOf` aus DB

**Google OAuth:**
- Route: `/api/auth/google` → redirect zu Google
- Callback: `/api/auth/google/callback` → erstellt/findet Player → JWT → redirect zu `/oauth-landing`
- `/oauth-landing` schreibt Token in localStorage und redirectet zu `/player/newsfeed`

---

## 8. E-Mail-System

- SMTP: `info@hoopsgermany.de` über Hostinger Webmail
- Nodemailer (lib/mailer.js)
- E-Mails für: Passwort-Reset, Team-Einladung, Feedback-Benachrichtigung, Pending-Results-Erinnerung

---

## 9. Design-System

**Primärfarbe:** Orange (`orange-500` = `#f97316`, `orange-600` für Hover)  
**Hintergrund:** `gray-50` (Seiten), `white` (Cards)  
**Text:** `gray-900` (Überschriften), `gray-600`/`gray-500` (Fließtext)  
**Font:** Inter (Google Fonts)  
**Icons:** react-icons/fa  
**Rounded:** xl, 2xl für Cards  
**Shadow:** sm, md für Cards  
**Navbar:** weiß mit orange Akzenten, mobil responsive  
**Buttons:** `bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-2`

---

## 10. Was NICHT neu gebaut werden muss

- Admin-Panel (nur für internen Gebrauch, kann am Ende ergänzt werden)
- Analytics-System
- Die alten "Pakistaner"-Komponenten-Struktur (alles in `components/player/newsfeed/...` war chaotisch)

## 11. Prioritäten für den Neustart

**Phase 1 – Core:**
1. Auth (Spieler Login/Register + Google OAuth)
2. Spielerprofil (Edit, Anzeige)
3. Team (Login, Register, Profil)
4. Team-Admin Panel (alle 6 Tabs)

**Phase 2 – Features:**
5. Spielplan & Ergebnisse
6. Ligen & Tabellen
7. Tryouts
8. Transfermarkt
9. Roster-Slot-System

**Phase 3 – Community:**
10. Newsfeed / Posts
11. Follower-System
12. Benachrichtigungen
13. Topscorer

---

## 12. VPS-Deployment

```bash
# SSH: ssh root@[VPS-IP]
# Projekt: /root/sports/
# Start: pm2 start "npm start" --name sports --cwd /root/sports
# Build: cd /root/sports && npm run build
# Logs: pm2 logs sports
```

**.gitignore muss enthalten:**
```
.env
.next/
node_modules/
public/team/
public/players/
```

---

## 13. Bekannte Probleme im alten Code (vermeiden!)

- Doppelte Mongoose-Model-Definitionen (z.B. PlayerModel zweimal importiert)
- Keine einheitliche Fehlerbehandlung in API-Routes
- Chaotische Komponenten-Verschachtelung (6 Ebenen tief)
- `"use client"` fehlte an kritischen Stellen
- Kein einheitliches Loading/Error-State-Pattern
- Kein TypeScript (optional für Neustart zu überlegen)
- Direkte `localStorage`-Zugriffe ohne Null-Checks
- Template-Literals mit Backticks in base64-Strings (Escape-Probleme)
