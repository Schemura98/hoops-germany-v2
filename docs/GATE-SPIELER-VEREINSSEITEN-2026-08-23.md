# Gate-Berichte: Spieler-/Vereinsseiten-Runde (Pakete A–D), 23.08.2026

Geprüfter Stand: uncommittete Umsetzung der vier von Patrick freigegebenen Pakete aus
`docs/TEAM-ANALYSE-SPIELER-VEREINSSEITEN-2026-08-23.md` (18 Dateien, +394/−144 über
`78781f3`). Beide Gates liefen parallel gegen denselben Production-Build (Port 3000,
Dev-DB); Kais Gegenproben in einem eigenen Worktree auf dem Vor-Fix-Stand (Port 3101).
Suite vor den Gates: 359 grün / 0 rot / 1 übersprungen.

---

## Gate Kai (test-automatisierung): **freigabefähig mit einer Auflage** — Auflage umgesetzt

**Alle vier Pakete gemessen bestätigt**, u. a.:
- **A1 Punktedreher:** Alle drei verlorenen Juli-Spiele auf allen drei Flächen
  (Admin-Spielplan, Admin-Ergebnisse, öffentliche Teamseite) in der Leserichtung
  „dein Team : Gegner" (N 78:82 / N 75:78 / N 60:67), Siege mit S. Gegenprobe am
  Vor-Fix-Build: „82:78" ohne Kürzel — der Defekt exakt wie beschrieben.
  Die Zuordnung über `match.winningTeam` ist robust (Route liefert unpopulierte Kennung,
  der Ausdruck deckt beide Formen).
- **A2 Beleg-Zeile in vier Richtungen:** eigenes Profil „deine Werte" (zwei Wege),
  fremdes Profil „Werte von {Vorname}", ausgeloggt korrekt. Gegenprobe am alten Stand:
  „deine Werte" über fremden Zahlen. Benannte, harmlose Degradation: Fehlt
  `localStorage["player"]` bei vorhandenem Token, zeigt das eigene Profil die
  Fremd-Fassung — die gefährliche Richtung ist konstruktiv unmöglich.
- **A3 Querlauf:** 320 px: vorher 380-px-Seite (+60), nachher fensterbreit; „News"-Reiter
  per Leisten-Scroll erreichbar.
- **P6:** Dev-DB nachgezählt: 2 Spiele beidseitig belegt → „Bestätigt"; 4 confirmed ohne
  beidseitige Meldung → „Ergebnis steht". Vor dem Fix: 6× „Bestätigt", viermal zu Unrecht.
- **C2 beidseitig:** Spiel mit 8 offenen Empfängern → Meldung nennt exakt 8
  (aus der DB vorhergesagt); Spiel mit 0 neuen → schlichte Meldung ohne Zahl.
  `benachrichtigt`-Rückgabe leckt nichts (nur an autorisierten Team-Admin, reine Anzahl).
- Kein neuer Endpunkt, keine Auth-Änderung, design-audit ohne Abweichung.

**⚠️ Auflage (UMGESETZT nach dem Gate):** Der erste Fix am `FollowButton` wartete im
Lade-Effekt auf ein 401, das `checkfollowing` nie sendet (der Endpunkt antwortet 200 mit
`authenticated:false`) — eine Zusicherung ohne Wirkung, dieselbe Fehlerform wie die nie
stattfindende Hero-Ladeanimation vom 20.08. Jetzt wird `authenticated:false` ausgewertet:
Bei ungültiger Sitzung wird der Knopf sofort wieder zum Login-Link.

**Empfehlungen (alle UMGESETZT):**
1. S/N-Kürzel im SpielplanTab nur bei gesetztem `winningTeam` — `updatematch` kennt ein
   Unentschieden (Punkte gesetzt, Sieger leer), dort hätte „N" für beide Teams gelogen.
2. Änderungs-Vergleich am „Statistiken speichern"-Knopf typnormalisieren — getippte "27"
   gegen gespeicherte 27 ließ den Knopf nach Zurücktippen fälschlich primär
   (unabhängig auch Tobias B1).
3. Login-Weiterleitung des FollowButton mit `?next=`-Rücksprungziel (Absicherung
   serverseitig über `lib/sichererPfad.js`).

**Neuer Wächter (übernommen als `tests/e2e/spieler-vereinsseiten.spec.mjs`, 6 Fälle):**
A1 über drei Flächen (Sollwerte aus der API; misst NUR an verlorenen Spielen und erklärt
sich für wertlos statt bestanden, wenn keins da ist) · A2 gefährliche Richtung zuerst,
drei Betrachter · A3 auf vier Breiten (fensterbreit UND letzter Reiter erreichbar — ein
`overflow-hidden` würde sonst als halber Fix durchgehen). **Beidseitig validiert:** am
Vor-Fix-Stand 6/6 rot, jeder aus dem richtigen Grund; nach dem Fix 6/6 grün.

**Offenlegung:** Für die C2-Messung wurden auf der Dev-DB die 8 Benachrichtigungen des
19.07.-Spiels ausgelöst (`notifiedStatsPlayers` gesetzt, 2 Audit-Einträge, 8
Analytics-Events; Spielwerte unverändert nachgezählt). Unbenachrichtigt bleiben:
25.07., 05.08., 17.08., 20.08. — nach Tobias' Gate zusätzlich auch das 13.07.-Spiel belegt
(s. u.). `hoops_prod` unberührt, auch nicht lesend.

**Vom Gate benannt, offen:** A8-Zweig („X im Kader, davon Y noch nicht bestätigt") ist
mit der Dev-DB nicht auslösbar (kein Team hat offene `rosterSlots`) — Code konsistent,
aber am Server ungesehen. Die design-audit-Blindstelle (gleichnamige lokale Variablen
zählen als Token-Nutzung) besteht am Zähler weiter, die konkrete Instanz ist durch die
Umbenennung in `feldKlasse` weg.

---

## Gate Tobias (qa-reviewer): **freigabefähig**

**Alle acht Vormittagsbefunde am laufenden Produkt nachweislich behoben**, nichts
Vorhandenes kaputt. Auszug:
- **A1:** drei Flächen deckungsgleich, mobil und 1280 (3× N, 3× S).
- **A2:** „Werte von Leon" auf fremdem Profil (eingeloggt UND ausgeloggt), „deine Werte" +
  Topscorer-Verweis nur auf dem eigenen; Verweis geklickt, landet auf /topscorer.
- **A3:** 320/360 fensterbreit, Leiste scrollt in sich, „News" erreichbar und lädt;
  Spielerprofil (gleiche Komponente) ebenfalls sauber.
- **A4:** alle drei Stadt-Felder auf navy-700, kein rgb(59,59,59) mehr.
- **A5/A6/H2:** Beitritts-Knopf sichtbar (Button secondary, 43 px); „Folgen" ausgeloggt →
  /login; mit absichtlich ungültigem Token → Weiterleitung statt stummem Nichtstun.
- **A7:** Leerzustand ehrlich, Zurücksetzen funktioniert (20 Karten zurück).
- **C1:** alle 6 Spielzeilen sind Links, Spielseite lädt korrekt.
- **C2:** Ruhezustand secondary, nach Änderung orange — nur der geänderte Knopf. Das eine
  erlaubte Speichern (13.07.-Spiel): Meldung „…8 Spieler wurden benachrichtigt", und die 8
  war ECHT (Merkfeld vorher leer, DB-belegt; max hat eine echte ungelesene Nachricht).
- **P6:** Abzeichen sagt an allen 6 Spielen die Wahrheit (2× „Bestätigt", 4× „Ergebnis
  steht", gegen die DB gegengelesen).
- **Design:** Admin-Tab-Leiste Unterstreichungs-Stil, Tipphöhe 42 px ≥ 40, mobil
  scrollend; Liga-Karte mit 2px-Brand-Oberkante und großer Platzierung; Kacheln ohne
  Verlauf; Chips neutral; Staffelung nachgewiesen, bei reduzierter Bewegung ohne Versatz
  (nur Fade). Konsole/Netzwerk: 0 unerklärte Fehler; kein Querlauf auf 320/360/390/1280.

**Befunde (beide niedrig, beide UMGESETZT):** B1 = Kais Empfehlung 2 (Typ-Vergleich).
B2: Nach „Filter zurücksetzen" blieb der Stadtname im Feld stehen, während der Filter
nicht mehr wirkte → `CityRadiusFilter` leert den Text jetzt beim externen Reset.

**Beobachtung ohne Wertung (→ Vivien/Nele, offen):** Spielerprofil-Historie kürzt mit
W/L, das Admin-Panel mit S/N — zwei Kürzelsysteme für Sieg/Niederlage.

**Ehrliche Grenzen beider Gates:** Browser-Vorschaufläche war ausgeblendet — Klickpfade
liefen über ausgelöste Ereignisse bzw. Playwright gegen echtes Chromium; echte
Maus-/Touch-Klicks und reine Sichtprüfung stehen aus. A8-Zweig und die n=0-Meldung von C2
nur im Code gelesen. Tobias' Spuren auf der Dev-DB: 13.07.-Spiel jetzt ebenfalls
benachrichtigt (8 Einträge), nicht zurückgenommen (DB-Schreibaktion war nicht gedeckt).

---

## Nacharbeiten nach den Gates (vor dem Commit umgesetzt)

1. FollowButton wertet `authenticated:false` aus (Auflage Kai).
2. S/N nur bei gesetztem Sieger (Kai E2).
3. `statsKanon()`-Typnormalisierung am Speichern-Knopf (Kai E3 / Tobias B1).
4. `?next=`-Rücksprungziel an der 401-Weiterleitung (Kai E4 / Tobias-Hinweis).
5. `CityRadiusFilter` leert den Stadttext beim externen Reset (Tobias B2).
6. Kais Wächter als `tests/e2e/spieler-vereinsseiten.spec.mjs` übernommen (Suite: 366
   Fälle in 38 Dateien).

Die Nacharbeiten 1–5 sind kleine, lokal begrenzte Änderungen an bereits gateten Stellen;
die volle Suite lief danach erneut (Ergebnis im Abschnitt-0-Eintrag von CLAUDE.md).
