# Gate-Bericht Kai — Team-Admin-Tour + Signup-Feldmotiv (Stand `1110fdf`, 23.08.2026)

**Urteil: freigabefähig, ohne Auflagen.** Zwei Hinweise unten, keiner blockiert.

Geprüft im eigenen Worktree (losgelöst auf `1110fdf`, eigener Port 3211, Hauptbaum und
Port 3000 nie berührt). Diff selbst erzeugt: `git diff f8c67b4..HEAD -- . ':(exclude)docs'`
— 11 Dateien, +1.170 Zeilen. Der Stapel: `89f0de8` (Signup-Feldmotiv) + `1110fdf`
(Team-Admin-Tour).

## A) Security- und Code-Review

**Die neue Speicher-Route ist sauber.** `/api/player/mark-admin-tour-seen` verlangt einen
gültigen Anmelde-Ausweis, wirkt ausschließlich auf das **eigene** Konto und setzt genau
**ein** Ja/Nein-Feld. Es gibt kein Feld im Aufruf, mit dem man ein fremdes Ziel benennen
könnte — die Wirkungsausweitung, die beim Löschweg vom 22.08. das Problem war, ist hier
baulich unmöglich.

**Rechte-Filterung hält.** Ein Co-Admin ohne Spielrecht kann über die Tour nichts
erreichen, was sein Panel nicht hat: Der „Zeig mir das"-Knopf erscheint nur für erlaubte
Reiter; selbst ein erzwungener Tab-Wechsel würde vom Korrektur-Effekt der Seite auf den
ersten erlaubten Reiter zurückgestellt, und jede Server-API prüft die Rechte ohnehin
selbst. Die Filterung der Folien, die Tryouts-Fußzeile und die Ergebnis-freie
Schlussfolie sind am laufenden Produkt belegt (s. Wächter).

**Portal und Fokusfalle korrekt.** Die Rückwand liegt außerhalb des Fokus-Rahmens, Escape
schließt, die Scroll-Sperre läuft über die zählerbasierte `lib/scrollSperre.js`. Der
Doppel-Schließ-Riegel (`schliessendRef`) wird beim Wiederaufruf sauber zurückgesetzt.

**Analytics:** `admin_tour_*` läuft über den öffentlichen Zähl-Endpunkt **ohne**
Typen-Weißliste — dieselbe Lage wie bei den Spieler-Tour-Ereignissen seit dem 18.08.
Bewertung: **hier kein Problem, aber eine bekannte Flanke.** Die Zahlen erscheinen
ausschließlich hinter dem Admin-Login (Summary-Route weist ohne Admin mit 401 ab), und
die Positivliste des Sponsor-Reports enthält `adminTour` **nicht** (nachgesehen). Wer per
curl flutet, verwässert also nur die interne Diagnose-Kurve — genau wie bei `tour_*`
heute schon. *Empfehlung ohne Dringlichkeit:* bei Gelegenheit eine Weißliste bekannter
Ereignistypen an der track-Route.

**Nebenprüfungen:** Der nachgetragene „feed"-Schritt im Spieler-Trichter existiert
wirklich (`WelcomeTour.js:85` sendet ihn) — der Nachtrag ist korrekt. Die Trichter-Karte
sagt „gezählt werden Sitzungen", und die Aggregation zählt tatsächlich Sitzungen
(`$addToSet: sessionId`). `AuthCourt.js` ist ein statisches, `aria-hidden` Inline-SVG
ohne Eingaben und ohne Netzwerkanfragen — kein Angriffsprofil; der Foto-Weg in
`AuthShell.js` ist wörtlich unverändert, /login rendert weiter über denselben Zweig
(Suite inkl. `signup-ohne-js` 2/2 grün).

## B) Neuer Wächter: `tests/e2e/admin-tour.spec.mjs` (7 Fälle)

1. **Auto-Start** (welcomeSeen=true + adminTourSeen=false → offen, „Schritt 1 von 6")
2. **Kein Auto-Start** bei adminTourSeen=true — mit Gegenkontrolle im selben Lauf: der
   Panel-Link öffnet sie doch (beweist, dass das „Nein" vom Flag kam, nicht von einer
   toten Tour)
3. **Vorrang-Regel:** welcomeSeen=false → Admin-Tour startet nicht
4./5. **Erreichbarkeit auf 360×800 und 1280×800:** Weiter-Knopf vollständig im Fenster
   UND `elementFromPoint` in seiner Mitte trifft genau ihn UND das Overlay ist am
   Fenster verankert (viewport-groß bei 0/0)
6. **Rechte-Filterung am Produkt:** Co-Admin nur mit Kader-Recht (per Antwort-Umschrift,
   kein Seed) → 3 statt 6 Schritte, keine Tryouts-Zeile, Schluss ohne „Ergebnis melden"
7. **Persistenz-Rundlauf:** Überspringen → echte Route antwortet 200 → Feld steht in der
   DB → Neuladen startet nicht mehr

**Ein Messbefund, ehrlich benannt:** Der erste Erreichbarkeits-Fall war für die
Portal-Mutation **auf mobil blind** — ohne Portal landet der Knopf auf 360×800 im
vermessenen Zustand *zufällig* im Fenster (784,5 px, in beiden Scroll-Lagen
nachgemessen); nur Desktop kippte sichtbar (931 px). Die im Code genannte
227-px-Verschiebung reproduziert sich am Endstand mobil nicht. Deshalb misst der Fall
zusätzlich die **Verankerung** des Overlays — die unterscheidet die beiden Bauarten auf
jeder Fenstergröße. Steht als Kommentar im Test.

**Mutationsmatrix 5/5, jede einzeln gefahren:**

| Mutation | Ergebnis |
|---|---|
| M1 Portal entfernt | rot auf **beiden** Fenstern (nach der Nachschärfung; vorher nur Desktop) |
| M2 Vorrang-Regel entfernt | rot (Vorrang-Fall) |
| M3 adminTourSeen-Riegel entfernt | rot (Kein-Auto-Start-Fall) |
| M4 Rechte-Filterung abgeschaltet | rot (Rechte-Fall) |
| M5 Speicher-Aufruf entfernt | rot (Persistenz-Fall) |

**Suite-Hygiene:** `spieler-vereinsseiten.spec.mjs` schaltet die Tour jetzt per
getmyinfo-Antwort-Umschrift deterministisch stumm (kein DB-Schreibzugriff). **Ehrlich
benannt:** Die Gegenprobe zeigte, dass A1 heute auch OHNE die Stummschaltung grün ist
(der Fall liest nur Text, klickt nichts) — der Patch ist **Vorsorge** für den ersten
Klick, den jemand dort hinzufügt, kein Fix eines Rots.

**Zustands-Disziplin:** Der Wächter stellt die Flags von max@test.de je Fall selbst her
und stellt in `afterAll` den vorgefundenen Stand wieder her (Restore isoliert
verifiziert).

## C) Zahlen (gezählt, nicht geschätzt)

- **Volle Suite im Worktree gegen die Production-Runtime: 376 grün / 0 rot / 1
  übersprungen** — `--list` zählt unabhängig **377 Fälle in 40 Dateien** (370 alt + 7
  neue), Laufzeit 6,4 min
- `npm run design-audit -- --check`: **keine Abweichung** zur nachgezogenen Baseline
  (Button 29, SplitFlap 3, Panels 143/182)
- AdminTour.js im Worktree nach der Matrix bitgleich zum Commit

Einbezogen: Tobias (paralleles Browser-Gate — deshalb Worktree-Isolation und der Verzicht
auf den letzten Flag-Reset), Nele/Lina nur lesend über das Konzeptdokument (Wortlaute
unangetastet).
