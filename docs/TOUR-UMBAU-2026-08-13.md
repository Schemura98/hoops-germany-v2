# Plattform-Tour: vom Diavortrag zum Aufwärmprogramm

> **Vivien (design-spezialistin) · 13.08.2026 · Auftrag Patrick**
> („Die Plattform-Tour lässt sich doch bestimmt auch interaktiver und moderner
> oder auch sogar spaßiger gestalten oder?" — mit dem übergeordneten Ziel
> „so viele Kontaktpunkte und Wiederaufrufgründe wie möglich".)
>
> **Stand: gebaut, lokal geprüft, NICHT committet, NICHT deployt.**
> Textabnahme durch Nele steht aus (siehe §7).

---

## 1. Was der Befund war

Die Vorgängerfassung waren fünf gleich gebaute Lesefolien: Icon, Überschrift,
Absatz, Weiter. Drei Dinge daran waren das eigentliche Problem — nicht die
Optik:

1. **Sie endete im Nichts.** `close(true)` schloss das Fenster und ließ den
   Nutzer stehen, wo er war. Der Moment mit der höchsten Aufmerksamkeit, den
   die Seite je bekommt, endete ohne Anschlusshandlung.
2. **Tour und Onboarding-Checkliste wussten nichts voneinander.** Die Tour
   versprach, die Checkliste lieferte — verbunden waren sie nicht.
3. **Gemessen wurde nur `tour_completed` / `tour_skipped`.** Damit weiß man,
   DASS jemand aussteigt, nie WO. Und selbst diese zwei Ereignisse wurden
   nirgends ausgewertet: Sie lagen seit jeher in der Datenbank und tauchten
   weder im Admin-Analytics noch sonstwo auf (nachgemessen 13.08.2026).

Dazu inhaltlich: Folie 5 nannte in einem Satz Transfermarkt, Tryouts,
Newsfeed, Folgen, Fotos, @Erwähnungen, #Hashtags und YouTube.

## 2. Die Leitentscheidung

**„Spaßig" heißt hier: jeder Schritt tut etwas Echtes, statt etwas zu
beschreiben.** Nicht: Abzeichen, Punktestände, Serien, Konfetti.

Das ist keine Geschmacksfrage, sondern folgt aus der Positionierung. Das
einzige Argument, das diese Plattform wirklich hat, ist die **Belegbarkeit**
der Zahlen. Eine Oberfläche, die mit Spiel-Mechanik um Aufmerksamkeit buhlt,
sägt genau daran. Und Patricks Vorgabe „keine Dark Patterns" schließt
Streak-Druck ohnehin aus.

Vier Schritte tun jetzt etwas, einer zeigt etwas:

| # | Schritt | Was passiert |
|---|---|---|
| 1 | **Beweis** | Anzeigetafel führt vor, dass **beide Teams unabhängig melden**. Zahlen zählen hoch, die zwei Meldungen laufen ein, „Bestätigt" fällt. Als **BEISPIEL** ausgezeichnet. |
| 2 | **Die Frage** | Eine Frage nach der Situation → der Rest wird kürzer und passender |
| 3 | **Position** | Ein Tipp — wird **wirklich** gespeichert (`update-profile`) |
| 4 | **Stadt** | Typeahead setzt Ort **und Bundesland** in einem Zug — wirklich gespeichert |
| 5 | **Übergabe** | Zeigt den echten Checklisten-Stand, mit dem eben erledigten Punkt bereits abgehakt, und führt weiter |

### Warum der Beweis vorne steht und nicht hinten

Erst zeigen, warum es sich lohnt — dann um etwas bitten. Die Recherche zu
Onboarding-Handwerk (siehe §6) nennt genau das umgekehrte Muster als
verlässlichen Verlust-Treiber: „mandatory profile completion" und „feature
tours before value delivery". Wer die Tour nach Schritt 1 abbricht, hat
trotzdem das Argument gesehen.

**Damit steht die Kernpositionierung erstmals in nutzersichtbarem Text.**
CLAUDE.md führt das seit dem 12.08.2026 als offene Lücke: Landing und „So
funktioniert's" sagen nur „sichtbar für Vereine und Scouts" — was jede
Plattform sagt. Die Tour ist der natürliche Ort dafür. Der Wortlaut ist ein
Entwurf und gehört Nele (§7).

### Die Verzweigung

Drei Wege, abgeleitet aus `docs/ZIELGRUPPEN.md`:
„Ich spiele in einem Verein" (Z1) · „Ich suche ein Team" (Z3) ·
„Ich organisiere ein Team" (Z2). Sie ändern Titel und Rollenauswahl in
Schritt 3 (wer ein Team organisiert, bekommt zusätzlich Coach/Manager — sonst
stünde eine Position im Profil, die nicht stimmt) und den Abschluss in
Schritt 5.

**Z4 und Z5 tauchen bewusst nicht auf.** Das Zielgruppen-Papier stellt Z4
ausdrücklich auf „nicht bewerben", und Z5 ist ein Gespräch, kein Produktweg.

Niemand wird zu einer Angabe gezwungen: „Ohne Angabe weiter" bleibt stehen,
und ein Speicherfehler bricht die Tour nie ab — der Punkt bleibt dann einfach
in der Checkliste offen.

## 3. Gestaltung

Alles innerhalb der Richtung „Anzeigetafel"
(`docs/VISUELLE-RICHTUNG-2026-08-12.md`) — keine Verläufe, keine Schatten,
kein Glow.

- **Mobil eine Fläche von unten** (Bottom Sheet) statt einer zentrierten
  Karte: volle Breite, Bedienung in Daumenreichweite, Griff als stumme
  Ansage. Ab `sm` ein zentriertes Panel. Die Bewegung unterscheidet sich
  entsprechend (hereinfahren vs. aufziehen).
- **Konturziffer als Kapitelmarke** — dieselbe Sprache wie die Kapitelmarken
  der Startseite (`A5`/`A4` aus dem Mechanik-Katalog), hier als Schrittzähler.
  Sie klappt bei jedem Wechsel um (`SplitFlap`): Eine Anzeigetafel wechselt
  ihre Ziffern nicht sanft. Dekorativ und `aria-hidden` — die Zählung steht
  als „Schritt 3 von 5" daneben.
- **Segmentleiste statt Punktreihe.** Zeigt zusätzlich, wie viel noch kommt.
  Rückwärts anklickbar, vorwärts nicht: Vorspringen würde die Schritte
  überspringen, die etwas speichern.
- **2px-Markenleiste an der Oberkante** — die Signaturgeste der Richtung.
- **Bewegung:** Schrittwechsel 260 ms, richtungsabhängig (vorwärts von
  rechts, zurück von links), nur `opacity`/`transform`. Auftritt 300 ms,
  Abgang 200 ms — wo der Nutzer entscheidet, darf es ruhig sein; wo das
  System antwortet, muss es zügig sein.

### Was zusätzlich repariert wurde

Der Vorgänger war **kein Dialog im technischen Sinn**: kein `role="dialog"`,
kein `aria-modal`, kein Escape, kein Fokus-Fang, kein Scroll-Sperre. Wer mit
der Tastatur ankam, konnte hinter das Fenster tabben und dort unsichtbar
navigieren. Alles fünf ist jetzt da.

## 4. Die Naht zur Checkliste

Beide Komponenten teilen sich jetzt **eine** Definition der Startschritte:
`computeSteps` wird aus `OnboardingChecklist.js` exportiert und von der Tour
importiert. Zwei Kopien wären sofort auseinandergelaufen — die Tour hätte
„erledigt" gemeldet, was die Checkliste noch offen führt.

Dazu ein Signal: `useCurrentPlayer` hört auf `hg:player-updated` und lädt
still nach; die Tour feuert es beim Schließen. **Ohne das stand die
Checkliste im Feed danach auf „0 von 4", während die Tour im selben Moment
„1 von 4" meldete** — zwei Wahrheiten nebeneinander, und der Nutzer hält die
Speicherung für kaputt. Gemessen und nach dem Fix gegengeprüft (§5).

Nebeneffekt: Jede Seite mit diesem Hook zieht jetzt nach, wenn sich das
Profil ändert.

## 5. Messung — und was daran neu ist

| Ereignis | `meta` | Antwortet auf |
|---|---|---|
| `tour_step` | Schritt-Key | Wie weit kommen Leute? |
| `tour_branch` | Weg-Key | Wer kommt eigentlich? |
| `tour_action` | `position` / `stadt` / `verfuegbar` | Was wird wirklich gespeichert? |
| `tour_completed` | gewählter Weg | Abschlussquote je Situation |
| `tour_skipped` | **Schritt des Abbruchs** | **Wo steigen sie aus?** |

Die letzte Zeile ist der Punkt. Vorher war sie nicht beantwortbar.

Ausgewertet wird das in `lib/analyticsSummary.js` (`onboarding`) und
dargestellt als Karte **„Einstieg: Plattform-Tour"** unter
`/admin/analytics` → *Plattform (intern)*. Gezählt werden **Sitzungen, nicht
Ereignisse**: Wer über „Zurück" zweimal auf denselben Schritt kommt, ist
trotzdem eine Person — sonst läge die Kurve genau dort am höchsten, wo jemand
unsicher war, also am Schritt, der das Problem IST.

Die Abschlussquote wird **nicht** ausgegeben, solange niemand gestartet ist.
„0 %" bei 0 Startern wäre eine erfundene Aussage.

⚠️ **Der Trichter wird aus dem öffentlichen Sponsor-Report entfernt**
(`app/api/analytics/public-report/route.js`) — interne Diagnose, und zwar
serverseitig, nicht erst in der Anzeige. Siehe dazu den Befund in §8.

**Feedback-Formular:** Der Chip „Onboarding / Einstieg" existiert bereits, es
war nichts nachzuziehen (geprüft).

## 6. Trend-Sweep

**Stufe M** nach der Skill `design-trend-recherche`: nutzersichtbare Fläche
**innerhalb** einer bereits entschiedenen Marke — die Farb-, Typo- und
Formfragen sind am 12.08.2026 entschieden und stehen nicht zur Disposition.
Ein L-Sweep hätte hier die falsche Frage beantwortet.

*Suchschnitt:* Produkt-Onboarding, mobil zuerst, Erstnutzer ohne Vorwissen,
Sport-Community.

*Register zuerst gelesen* (Regel 2): Der Sport-Community-Sweep vom 12.08.2026
und der `mechanik-katalog.md` decken die Formensprache bereits ab — daraus
kommen A4 (Konturschrift) und A5 (Kapitelziffer), beide hier eingesetzt. Neu
gesucht wurde nur das Delta „Onboarding-Handwerk".

*Was der Sweep beigetragen hat* (Sorte B, Redaktion/Beschreibung — Suche zu
Onboarding-Mustern 2026):

- **„One JTBD question at sign-up beats a five-question wizard."** → genau
  **eine** Frage nach der Situation, nicht drei.
- **TTV-Killer: „mandatory profile completion", „feature tours before value
  delivery", „complex setup wizards".** → Beweis nach vorn, jede Angabe
  überspringbar.
- **„Everboarding"** — Onboarding als fortlaufendes System statt als
  einmaliger Assistent. → Die Tour endet nicht, sie übergibt an die
  Checkliste.
- Muster-Kombination Welcome + Wizard + Checklist + Tour statt eines davon.

*Bewusst NICHT übernommen:* Fortschritts-Gamification (Punkte, Abzeichen,
Serien) — in den Quellen prominent, hier aber gegen Positionierung und
Patricks Dark-Pattern-Grenze. Ebenso kein Produkt-Rundgang mit Overlay-Pfeilen
auf echte Seitenelemente: bricht bei jeder Layoutänderung und ist auf 390 px
kaum lesbar.

*Nicht geprüft:* keine visuelle Referenz — die Galerien (Awwwards,
siteinspire) prämieren Websites, keine In-Produkt-Einstiege; `land-book` und
`godly` sind seit dem 12.08. nicht abrufbar (403). Die Aussagen oben sind
**beschriebene** Praxis, keine gesehene.

## 7. Wer beteiligt war — und wer noch fehlt

- **Nele (marketing-manager): geprüft, Korrekturen eingebaut.** Der Text war
  **von mir als Entwurf** geschrieben, weil zu diesem Auftrag kein
  Nele-Entwurf vorlag; die Substanz stammt aus `ZIELGRUPPEN.md` und der
  Kernpositionierung, die Formulierung gehört ihr. Ihr Befund hat **zwei echte
  Fehler** gefunden — beide übernommen:

  1. **„Zahlen, die niemand bestreitet" war schlicht falsch.** Die Plattform
     kennt einen `resultStatus: "mismatch"`; Widerspruch passiert, wird
     eskaliert und von einem Admin aufgelöst. Eine Behauptung, die das eigene
     Produkt widerlegt, ist ausgerechnet dort tödlich, wo Belegbarkeit das
     ganze Argument ist. Jetzt: **„Zahlen, die beide Seiten bestätigen"** —
     trifft die Positionierung genauer und leugnet keinen Zustand.
     (Kein §6-UWG-Fall: kein Mitbewerber genannt, kein „die einzige
     Plattform, die…". **Nora wird nicht gebraucht.**)
  2. **Schritt 5, Weg „sucht ein Team", versprach eine Nachfrage-Seite, die es
     nicht gibt.** „…dann sehen dich Vereine im Transfermarkt" ist bei 3
     bespielten Ligen eine Bestandsbehauptung und widerspricht der eigenen
     Z3-Regel („solange das Inventar klein ist, ehrlich als im Aufbau rahmen
     statt als Marktplatz"). Jetzt im Pionier-Framing: „…du bist damit
     sichtbar, sobald ein Verein im Transfermarkt sucht. Der ist noch im
     Aufbau, du gehörst zu den Ersten."

  Dazu drei Ton-Hinweise („spricht aus Produkt- statt Hallen-Perspektive").
  **Einen übernommen:** In Schritt 4 stand der Funktionsname „Umkreissuche" —
  jetzt steht dort der Nutzen. **Zwei bewusst nicht:** „Eine Frage – danach
  wird der Rest kürzer" (Schritt 2) und „kein Formular" (Schritt 3)
  kommentieren zwar den Ablauf, benennen aber den **Aufwand ehrlich vorab** —
  und genau das verlangt `ZIELGRUPPEN.md` für Z2 („Aufwand zuerst und ehrlich
  benennen"). Sie bleiben.

  Verbotsliste `MARKE.md` §5: kein Verstoß. Die drei Wege bilden Z1/Z2/Z3
  erkennbar ab, keine Situation fehlt.

  ⚠️ **Offene Empfehlung von Nele an Patrick:** Sie schlägt vor, dass **Lina
  Vogt** (Onboarding) gegenliest, ob Ton und Versprechen zu dem passen, was
  Neulinge danach im Feed tatsächlich erleben — besonders die
  „verfügbar"-Zusage, die in echte Transferstatus-Daten schreibt. Diese Rolle
  stand mir hier nicht zur Verfügung; **Entscheidung liegt bei Patrick.**
- **Ronja (retention-analystin):** prüft parallel Kontaktpunkte am Produkt.
  Überschneidung war eingeplant. Ihre Befunde sind kein Gate für diesen Umbau.
- **Milo (medien-produzent):** nicht einbezogen — es wird kein produziertes
  Bild- oder Videomaterial gebraucht, die Anzeigetafel ist reines Markup.
- **Kai / Tobias:** noch nicht gelaufen. Beide sind Deploy-Gates
  (CLAUDE.md Abschnitt 0) und wären VOR einem Deploy fällig, nicht jetzt —
  es ist nichts committet.

## 8. Ehrliche Restliste

**Nicht geprüft:**

- **Kein `npm run build`, keine Playwright-Suite, kein `npm start`.** Auftrag
  war ausdrücklich, nicht gegen den laufenden Dev-Server zu bauen. Die
  Production-Runtime ist damit ungetestet — das ist ein Deploy-Gate, kein
  Freigabekriterium für heute.
- **Kein echtes Gerät.** Gemessen wurde in Chromium bei 390 px und 1280 px,
  nicht auf einem Low-End-Android. Ruckelfreiheit unter Last ist damit nicht
  belegt; die Bewegung ist allerdings auf `opacity`/`transform` beschränkt
  und läuft ohne JavaScript-Schleife.
- **Kein Screenreader-Durchlauf.** `role="dialog"`, `aria-modal`,
  `aria-labelledby`, `aria-pressed`, `aria-live` und der Fokus-Fang sind
  gesetzt und im DOM verifiziert, aber nicht mit NVDA/VoiceOver gehört.
- **Google-Login-Weg nicht durchgespielt** (lokal keine Keys).

**Geprüft und belegt** (Skripte in `tmp/`, Bilder in `tmp/tour-shots/`):

| Was | Ergebnis |
|---|---|
| Alle 5 Schritte, 390 px und 1280 px | Bilder vorhanden, kein Querlauf, keine Konsolenfehler |
| Speichert die Tour wirklich? | `position`, `hometown`, `bundesland`, `transferStatus` gegen `getmyinfo` nachgeprüft — alle gesetzt |
| Reduzierte Bewegung | kein Textelement bleibt auf `opacity: 0` hängen |
| Kontrast im Dialog, alle 5 Schritte, beide Breiten | **0 Verstöße** gegen WCAG AA (mit Fehlalarm-Schutz aus `tmp/kontrast-check.mjs`) |
| Escape + Abbruch-Messung | schließt; meldet `tour_skipped:position` — der Abbruchpunkt |
| Naht zur Checkliste | Tour „1 von 4", Feed nach dem Schließen „1 von 4" (vorher „0 von 4") |
| Admin-Trichter | rendert mit echten Zahlen aus den Testläufen |

**Zwei Fehler, die erst beim Hinsehen auffielen** (beide behoben) — beide
hätten eine reine Code-Prüfung überstanden:

1. Die zwei Meldezeilen der Anzeigetafel zeigten `78:71` und `71:78` (jeweils
   aus Sicht des Teams). Datenmodell-treu, aber am Bildschirm liest sich das
   wie ein **Widerspruch** — und stellt damit genau die Aussage auf den Kopf,
   die der Schritt macht. Jetzt zeigen beide dieselbe Zahlenfolge.
2. Die Vorschlagsliste der Stadt-Eingabe wurde am Panelrand **abgeschnitten**,
   auf beiden Breiten: Das Panel schrumpfte auf die Höhe des Eingabefelds. Der
   Schritt war damit praktisch unbenutzbar.

Dazu die **zwei inhaltlichen Fehler aus Neles Prüfung** (§7) — eine
Behauptung, die das eigene Produkt widerlegt, und ein Versprechen über
Inventar, das es nicht gibt. Beide standen nach meiner eigenen Prüfung noch
drin. Merkposten: Ein Design-Gate prüft Lesbarkeit und Verhalten, nicht
Wahrheitsgehalt. Dafür braucht es die zweite Perspektive.

**Ein Befund außerhalb dieses Auftrags** (nicht behoben, nur eingedämmt):
`/api/analytics/public-report` gibt das **komplette** Summary-Objekt an jeden
aus, der Link und Passwort hat; die Trennung intern/Sponsor passiert erst im
Browser. Ein Sponsor kann in der Netzwerkantwort alles mitlesen, was das
interne Dashboard zeigt. Ich habe nur meinen eigenen Block dort entfernt,
statt das Muster fortzusetzen. Die saubere Lösung wäre eine serverseitige
Positivliste — eigener Auftrag.

## 9. Betroffene Dateien

```
components/onboarding/WelcomeTour.js      neu geschrieben (Auto-Start-Wächter wörtlich erhalten)
components/onboarding/TourSteps.js        neu — die vier handelnden Schritte
components/onboarding/TourProofBoard.js   neu — die Beweis-Anzeigetafel
components/onboarding/OnboardingChecklist.js   computeSteps exportiert
lib/useCurrentPlayer.js                   Nachladen auf hg:player-updated
lib/analyticsSummary.js                   Onboarding-Trichter
app/admin/analytics/page.js               Karte „Einstieg: Plattform-Tour"
app/api/analytics/public-report/route.js  Trichter aus dem Sponsor-Report entfernt
app/globals.css                           Schrittwechsel-Animation
```

Der **Auto-Start-Wächter** (token-gebunden, läuft bei Routenwechsel) ist
unverändert übernommen, samt seinem Kommentar — er löst ein reales Problem
und war nicht Gegenstand des Umbaus.

Nicht angefasst: `app/versuch-fotos/`, `public/images/platzhalter/`,
`LandingHero.js`, `HeroScrollStage.js`, das neue Signup-Motiv.

⚠️ **Im Arbeitsverzeichnis liegt ein zweiter, fremder Änderungsstand.**
Während dieses Umbaus hat parallel jemand an Ronjas R1-Befund gearbeitet
(Benachrichtigung „Deine Zahlen stehen": `lib/statsNotify.js`,
`lib/notifications.js`, `models/Match.js`, `models/Player.js`,
`components/layout/NotificationBell.js`, `app/api/team/match-stats/save/`,
`tmp/r1-*.mjs`). **Zwei Dateien teilen wir uns:**
`app/admin/analytics/page.js` (dort steht jetzt `OwnStatsCard` neben meiner
`OnboardingCard`) und `lib/analyticsSummary.js` (`ownStats` neben
`onboarding`). Beide Stände koexistieren, die Seite rendert und beide Karten
sind da — geprüft. Wer als Nächstes committet, sollte die Änderungssätze
trotzdem **getrennt** einbuchen.
