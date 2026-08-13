# Entdeckbarkeits-Befund — Hoops Germany

**Lina Vogt (onboarding-referentin) · 14.08.2026 · Branch `redesign`, lokaler Dev-Server, Dev-DB `hoopsgermany`**

Die eine Frage dieses Befunds: **Findet ein Mensch, der die Seite heute zum ERSTEN Mal
öffnet, diese Funktion — ohne dass ihm jemand sagt, dass es sie gibt?**

Abgrenzung zu Ronja (`docs/RETENTION-BEFUND-2026-08-13.md`): Sie fragt, warum jemand
**wiederkommt**. Ich frage, ob jemand es beim **ersten** Mal überhaupt findet. Wo sie
etwas schon gefunden hat, bestätige ich es kurz und gehe weiter.

**Nichts gebaut, nichts committet.** Das ist ein Befund. Entscheidung: Patrick.

---

## 0. Wie ich geprüft habe

**Kennzeichnung:** **[GESEHEN]** = im laufenden Produkt nachvollzogen (DOM-Text,
Link-Listen, gemessene Rechtecke). **[QUELLTEXT]** = nur im Code nachvollzogen.

**Tatsächlich gegangene Wege**, lokaler Dev-Server auf Port 3000, Chromium über
Playwright, 390×844 (mobil, laut Nele der maßgebliche Fall) und 1280×900 (Desktop):

- `/` ausgeloggt · `/signup` · `/login` · `/about` · `/datenschutz`
- Wegwerf-Konto angelegt (Muster `tmp/tour-shots.mjs`) → Auto-Start der Tour →
  alle fünf Schritte → `/player/newsfeed` als Neuling **ohne Team**
- Mobil-Menü der PlayerNav · waagerechte PlayerNav auf 1280
- `/tryouts` (Leerzustand) · `/spiele` → `/match/[id]` → `/ligen/[id]` → `/topscorer`
- Plattform-Tour **ausgeloggt** über den Footer-Link, Schritt für Schritt
- Skripte: `tmp/lina-entdeckbarkeit.mjs`, `tmp/lina-desktop.mjs`

**Aufgeräumt:** Die drei Wegwerf-Konten sind aus der Dev-DB gelöscht
(`tmp/lina-cleanup.mjs`, „geloescht: 3"). Der Dev-Server ist beendet, Port 3000 ist frei.
**Kein `npm run build` gelaufen.** Produktivdatenbank nicht angefasst.

**Screenshots gibt es keine.** Die Browser-Vorschaufläche kompositiert keine Frames
(„Screenshot timed out … the Browser pane is not displayed"). Beweismittel sind deshalb
DOM-Text, Link-Listen und gemessene Rechtecke — für die Frage „wohin kann man von hier
klicken und wie groß ist das Ziel?" ohnehin das präzisere Mittel.

---

## 1. Je Funktion: findet ein Neuling sie?

| # | Funktion | Findet ein Erstbesucher sie? |
|---|---|---|
| 1 | Altersnachweis / ab 16 | **Er stößt darauf, versteht aber nicht warum** → P2-3 |
| 2 | Benachrichtigung „Deine Zahlen stehen" | **Nein — sie wird nirgends angekündigt** → P1-1 |
| 3 | Liga-Achse Spiel → Liga → Spielplan → Topscorer | **Ja, verifiziert. Kein Befund.** |
| 4 | `/tryouts` + Einladungswege | **Ja, verifiziert.** Mit einer Korrektur an der Fragestellung |
| 5 | Feedback-Zugang im Sticky-Chrome | **Ja, auf vier Wegen. Gemessen.** |
| 6 | Newsfeed / Spieltag-Leiste | **Nein — sie erscheint für einen Neuling gar nicht** → P2-4 |
| 7 | „Mein Profil" nur noch am Avatar | **Nur über Umweg, und im Onboarding gar nicht** → P2-2 |

### Was funktioniert — kurz, damit dort niemand aufräumt

**Liga-Achse [GESEHEN, 1280 und 390].** Der Weg trägt vollständig:
`/spiele` → `/match/[id]`, dort steht als einziger Inhalts-Link im `<main>`
„**Wo stehen wir jetzt · Tabelle · Regionalliga Süd**" → `/ligen/6a7d…b91c`. Dort
„**Alle 8 Spiele**" → `/spiele?league=…&tab=all` und „**Ganze Bestenliste**" →
`/topscorer?league=…`. Auf `/topscorer` stehen ein Liga-Auswahlfeld („Alle Ligen /
Regionalliga Süd · 2025/26 / …") und der Kasten „**DEINE PLATZIERUNG**".
Ronjas K1, K2, K3, R4 und R5 sind aus Erstbesucher-Sicht geschlossen. Die Beschriftung
„Wo stehen wir jetzt" ist die beste Verbindungs-Beschriftung im Produkt — sie benennt die
Frage des Nutzers, nicht den Namen der Zielseite.

**`/tryouts`-Leerzustand [GESEHEN].** Sieben Links im `<main>`, drei nummerierte Wege:
„01 Vereine in deiner Nähe" (vier anklickbare Vereine + „Alle Vereine ansehen"),
„02 Transfermarkt" mit ehrlicher Einordnung („aktuell kein Verein öffentlich"),
„03 Von Vereinen gefunden werden" mit Knopf „Als verfügbar eintragen".
Ronjas R2/K5/K9 sind geschlossen.

**Feedback-Zugang [GEMESSEN].** Das Symbol steht ausgeloggt wie eingeloggt in der
Sticky-Leiste, auf 390 px bei `y=59`, **Klickfläche 36×36 px** (das SVG ist 20×20).
Dazu trägt das **Wort** „Feedback geben" die erste Zeile jeder Seite (Testphase-Banner),
das Mobil-Menü unter der Gruppe „TESTPHASE" und den Footer. Vier Wege — das reicht.
*Nebenbefund:* `docs/UEBERGABE-2026-08-13.md` Abschnitt 3 führt als offene Kleinigkeit
„Klickfläche des Feedback-Symbols 20×20 px (unter dem 24er-Minimum)". Gemessen habe ich
in Navbar und PlayerNav **36×36**; 20×20 ist das Icon im Inneren. Der Punkt kann
geschlossen werden — mit dem Vorbehalt, dass ich die **TeamNav** nicht gemessen habe.

**Einladungswege [QUELLTEXT] — mit einer Korrektur.** Die „acht Kaderplatz-Wege" sind
**keine acht nutzersichtbaren Wege**. `lib/rosterSlots.js:29-36` listet acht
**Code-Aufrufer**, die `Player.teamId` ändern und deshalb `slotsFreigeben` rufen müssen —
das ist Datenkonsistenz, nichts, was ein Neuling findet oder finden soll.
Nutzersichtbar sind **drei** Einladungswege, und die stehen im Kader-Tab nummeriert und
benannt: `components/team/tabs/KaderTab.js:364` („Bestehenden Spieler einladen", als
häufigster Fall zuerst), `:460` („Neuen Spieler anlegen" mit persönlichem Link), `:514`
(„Team-Einladungslink für alle"). Für einen Team-Admin beim ersten Mal ist das gut
aufgeräumt. **Live geprüft habe ich das nicht** (setzt einen freigegebenen Verein voraus).

---

## 2. Die Lücken, priorisiert

### P1-1 · „Deine Zahlen stehen" wird einem Neuling nirgends angekündigt

**Was ein Erstbesucher sieht:** Nichts. Er registriert sich, geht durch die Tour, liest
die Startseite — und erfährt an **keiner** Stelle, dass ihm die Plattform Bescheid gibt,
wenn seine Zahlen aus einem Spiel eingetragen sind.

**Fundstellen [GESEHEN + QUELLTEXT]:**

- Die Ankündigung existiert nur **in der Nachricht selbst**: `lib/statsNotify.js:115`
  („Deine Zahlen aus dem Spiel gegen …"). Eine Suche über `app/` und `components/` nach
  „Zahlen stehen" / „Deine Zahlen" findet **keine einzige** Erklär- oder Onboarding-Fläche.
- Tour, Schritt 1 `components/onboarding/WelcomeTour.js:52-53` erklärt die **Regel**
  („Beide Teams melden das Ergebnis unabhängig voneinander"), nicht das **Ereignis**.
- Startseite, Karte 1 `components/landing/LandingFeatures.js:42` genauso:
  „bestätigt vom Gegner, nicht nur von dir eingetragen" — eine Zusage, kein Versprechen
  einer Nachricht.
- Karte 6 `LandingFeatures.js:81` sagt „bleib per Benachrichtigung am Ball" — das meint
  Community und Follower, nicht die eigenen Zahlen.
- **Der Glocken-Leerzustand sagt nichts:** `components/layout/NotificationBell.js:145-147`
  → „Keine Benachrichtigungen." (identisch `components/layout/Navbar.js:385`).
- **Der Topscorer-Leerzustand sagt nur das Fehlen:** `app/topscorer/page.js:65-68` →
  „Für diese Auswahl ist noch kein gewertetes Spiel mit deinen Zahlen erfasst."

**Warum das P1 ist:** Ronja nannte R1 den größten Hebel, und die Kernpositionierung
(„belegbare Zahlen") wird laut `CLAUDE.md` Abschnitt 0 seit `c4dd91d` ausdrücklich **als
Ereignis** eingelöst. Ein Ereignis, das niemand erwartet, ist ein halbes Ereignis: Wer
nicht weiß, dass die Glocke etwas zu sagen hat, schaut nicht hin — und der Ertrag der
Doppelerfassung durch den Team-Admin bleibt unsichtbar.

**Gewünschter Zustand — zwei Leerzustände schärfen, nichts hinzufügen:**

1. `components/layout/NotificationBell.js:145-147` und `components/layout/Navbar.js:385`:
   Der Leerzustand nennt, was hier ankommen wird. **Wortlaut-Richtung (Vorschlag, Hoheit
   Nele):** „Noch nichts. Sobald ein Ergebnis eingetragen ist, steht hier, dass deine
   Zahlen aus dem Spiel da sind."
2. `app/topscorer/page.js:65-68`: ein Halbsatz an den vorhandenen Satz.
   **Richtung:** „… erfasst. Sobald dein Team ein Ergebnis einträgt, sagen wir dir Bescheid."

Optional, wenn Nele es für tragfähig hält: **ein** Nebensatz in Tour-Schritt 1
(`WelcomeTour.js:53`). Mehr nicht — siehe Abschnitt 3.

**Gehört:** Wortlaut **Nele** · Einbau **Claude** (zwei bis drei Strings) · Gestaltung nicht nötig.

---

### P2-1 · Die Plattform-Tour ist ausgeloggt erreichbar und endet in einer Fehlermeldung

**Was ein Erstbesucher sieht [GESEHEN, 390×844, ausgeloggt, Startseite]:** Im Footer steht
„Plattform-Tour". Er klickt. Die Tour öffnet — mit dem stärksten Argument der Seite
(Schritt 1, die Beweis-Tafel: „Rheinbach Ravens meldet 78:71 / Köln Comets meldet 78:71 /
BESTÄTIGT"). Dann:

- **Schritt 3**, „Point Guard" angetippt → rote Meldung
  **„Konnte gerade nicht gespeichert werden. Du kannst das später im Profil nachholen."**
  (`components/onboarding/TourSteps.js:173-175`) — ein Profil, das es nicht gibt.
- **Schritt 5**, Überschrift **„DU HAST SCHON ANGEFANGEN"** über
  **„0 von 4 Startschritten erledigt · 0 %"**.
- Ausgänge: „Zum Feed" (`/player/newsfeed`, führt zum Login) und das Weg-Ziel.
  **Ein „Konto erstellen" gibt es nicht.**

**Fundstellen:** `components/layout/Footer.js:31` rendert `TourLink` unbedingt ·
`components/onboarding/TourLink.js:9` feuert `hg:open-tour` ·
`components/onboarding/WelcomeTour.js:147-161` öffnet ohne Token-Prüfung ·
`TourSteps.js:59-68` (`speichern` gibt ohne Token `false` zurück).

**Warum das wehtut:** Das ist die **einzige** Fläche der Seite, die einem Erstbesucher das
Produkt erklärt, **bevor** er ein Konto hat. Und ausgerechnet dort bekommt er eine
Fehlermeldung und einen Ausgang, der ihn auf eine Anmeldemaske schickt.

**Gewünschter Zustand:** Ausgeloggt versucht die Tour gar nicht erst zu speichern (keine
Fehlermeldung), und der letzte Schritt trägt „Konto erstellen" → `/signup` als
Hauptausgang statt „Zum Feed". Die Auswahl selbst darf bleiben — sie kostet nichts und
macht den Einstieg danach kürzer.
**Meine Empfehlung ist ausdrücklich behalten, nicht abschalten:** Schritt 1 ist das beste
Verkaufsargument, das die Seite hat, und ausgeloggt ist genau der Moment, in dem es zählt.

**Gehört:** Verhalten **Claude** · Wortlaut des Ausgangs **Nele** · ob die Tour ausgeloggt
überhaupt laufen soll: **Patrick**.

---

### P2-2 · „Mein Profil" wird im Onboarding an keiner Stelle gezeigt (Patricks Punkt)

**Was ein Erstbesucher sieht [GEMESSEN, 1280×900]:** Die waagerechte PlayerNav führt
Newsfeed · Ligen · Spiele · Bestenlisten · Teams · Spieler · Transfermarkt, dann
Feedback-Symbol, Glocke, **den Avatar „LDLina" (75×32 px) → `/player/player-detail`**,
Abmelden. Das Wort „Profil" steht dort **nur im `title`-Attribut**
(`components/layout/PlayerNav.js:165`) — also im Tooltip, nicht als Text, und auf dem
Handy überhaupt nicht. Mobil führt der Weg über den Hamburger, Gruppe „MEIN BEREICH →
Mein Profil" (`PlayerNav.js:241-251`) [GESEHEN].

**Der eigentliche Befund ist aber nicht die Leiste, sondern das Onboarding:**
`/player/player-detail` kommt in **keiner** Onboarding-Fläche vor. Eine Suche über
`components/onboarding/`, `components/landing/` und `app/page.js` hat genau **einen**
Treffer: `components/landing/LandingHero.js:164` — der eingeloggte Hero der Startseite,
also eine Seite, auf die ein frisch registrierter Nutzer nicht zurückgeht.
Tour und Checkliste verlinken ausschließlich die **Bearbeiten**-Seite
(`components/onboarding/OnboardingChecklist.js:30` und `:36` → `/player/edit-profile`).
**Ein Neuling sieht sein eigenes Profil im Onboarding also nie so, wie ein Verein es sieht.**

**Gewünschter Zustand — genau eine Stelle, und zwar eine bestehende:**

Die Tour hat bereits zwei Schritte, die ins Profil **schreiben** und das quittieren:

- `components/onboarding/TourSteps.js:171` → „Steht in deinem Profil."
- `components/onboarding/TourSteps.js:209` → „{stadt} · {land} – gespeichert."

Zeile 171 ist der einzige Moment im gesamten Onboarding, in dem das Wort „Profil" fällt,
**während** der Nutzer gerade etwas hineingeschrieben hat. Dort gehört der Zeiger hin —
nicht in einen neuen Tour-Schritt.

Und zwar als **Demonstration, nicht als Satz**: Die Quittung in `StepPosition` bekommt
neben dem Häkchen das Avatar-Element in genau der Form, die eine Sekunde später oben
rechts in der Leiste steht (Initialen im `brand-500/20`-Kreis, Vorbild
`components/layout/PlayerNav.js:174-178`), plus einen Halbsatz. Der Nutzer **erkennt die
Form danach wieder** — das ist der Unterschied zwischen „gelesen" und „demonstriert",
und es ist genau das, worum Patrick gebeten hat.

**Wortlaut-Richtung (Vorschlag, Hoheit Nele):**
> „Steht in deinem Profil — das öffnest du jederzeit über dein Bild oben rechts."

**Rückfallposition, falls das Avatar-Zitat zu viel wird:** derselbe Halbsatz im letzten
Tour-Schritt unter der Fortschrittsleiste (`TourSteps.js:244-257`). Vorteil: Er erscheint
auch dann, wenn jemand die Schritte 3 und 4 überspringt. Nachteil: nur gelesen, nicht gezeigt.

**Zweiter, unabhängiger Vorschlag (kleiner, gehört Patrick):** Der Checklisten-Schritt
„Profil vervollständigen" (`OnboardingChecklist.js:36`) könnte, sobald er erledigt ist,
auf `/player/player-detail` statt `/player/edit-profile` zeigen. Dann ist der letzte Klick
der Checkliste der Blick auf das fertige Profil, nicht wieder das Formular.

**Gehört:** Gestaltung des Avatar-Zitats **Vivien** · Wortlaut **Nele** · Einbau danach
**Claude** · die Verhaltensänderung an der Checkliste **Patrick**.

---

### P2-3 · Das Mindestalter wird abgefragt, aber nie begründet — und nie vorher angekündigt

**Was ein Erstbesucher sieht [GESEHEN, 390×844]:** Auf `/signup` steht zwischen
„Passwort bestätigen" und „Konto erstellen" eine einzige nackte Zeile:

> **Ich bin mindestens 16 Jahre alt.**

Kein Warum, kein Verweis, keine Verknüpfung zum Datenschutz.
`app/signup/page.js:222-224`. Wortgleich auf `app/team/claim/[token]/page.js:277` und
`app/team/join/[token]/page.js:296` [QUELLTEXT] — die Einheitlichkeit ist gut, die
fehlende Begründung ist überall dieselbe.

**Und: Die Regel wird vorher nirgends erwähnt.** [GEMESSEN]
`/about` enthält die Ziffernfolge „16" **nicht**. `/datenschutz` enthält „16 Jahre"
**nicht**. Die Startseite spricht durchgehend von „Deine Basketball-Community in NRW",
ohne Altersgrenze. Folge: Ein 14-Jähriger füllt Vorname, Nachname, E-Mail und zweimal
Passwort aus und erfährt erst am letzten Feld, dass er hier nicht mitmachen darf.

**Der Google-Weg trägt** [QUELLTEXT, **lokal nicht testbar**, keine OAuth-Keys]:
`app/login/page.js:120` schickt kein `minAge` mit; ein **neues** Konto über Google wird
deshalb in `app/api/auth/google/callback/route.js:95-100` abgewiesen und auf
`/signup?error=min_age_required` umgeleitet, wo `app/signup/page.js:67-70` erklärt:
„Bitte bestätige zuerst, dass du mindestens 16 Jahre alt bist – dann klappt auch die
Anmeldung mit Google." Das ist eine saubere Rückführung. **Bestätigt habe ich nur den Code,
nicht den echten Ablauf** — dieser Punkt steht in der Übergabe zu Recht als „einmal auf
Prod durchspielen".

**Gewünschter Zustand:** Ein Satz, der sagt **warum** — an derselben Stelle, mobil, ohne
neue Fläche. Und, deutlich billiger als jede Textarbeit: die Grenze **vor** dem Formular
nennen, etwa in der Unterzeile von `/signup` („Erstelle dein kostenloses Spielerprofil.").

**Ich formuliere hier ausdrücklich nichts.** Warum die Plattform ab 16 ist, ist eine
rechtliche Aussage, keine UX-Zeile — und `CLAUDE.md` Abschnitt 0 hält fest, dass der
Wortlaut einer Einwilligungserklärung offen bei Patrick und Nora liegt.

**Gehört:** **Nora** (braucht die Abfrage eine Begründung, und muss sie mit dem
Datenschutz verknüpft sein?) → danach **Nele** (Wortlaut) → **Claude** (Einbau).

---

### P2-4 · Die Spieltag-Leiste sieht genau die Person nie, die eine Erklärung braucht

**Was ein Erstbesucher sieht [GESEHEN]:** Frisches Konto, `/player/newsfeed`, 390×844 —
**keine Spieltag-Leiste.** Der Kopf des Feeds ist „HALLO LINA / NEWSFEED / Fr., 14.08.",
darunter sofort die Willkommens-Checkliste. Die Prüfung auf „Nächstes Spiel" im Body-Text
war negativ.

**Fundstelle:** `components/feed/SpieltagStrip.js:76` → `if (!player?.teamId) return null;`

**Das ist als Entscheidung richtig** und ausdrücklich so begründet
(`SpieltagStrip.js:30-31`: „Kein Team / keine Spiele → die Leiste erscheint gar nicht,
statt mit leeren Kästen Präsenz zu behaupten"). Ich schlage **keinen Platzhalter** vor.

**Der Befund ist ein anderer:** Das Element, das den Feed erklärt und ihm seinen Wert
gibt, ist für jeden Neuling unsichtbar — und **nichts sagt ihm, wodurch es erscheint.**
Die Checkliste steht unmittelbar darunter und enthält den passenden Schritt
(„Team beitreten oder gründen", `components/onboarding/OnboardingChecklist.js:41-44`),
stellt die Verbindung aber nicht her: Ihr Untertitel lautet
„Finde dein Team – oder gründe ein neues." (`:48`) und nennt keinen Ertrag.

**Gewünschter Zustand:** Ein Halbsatz in genau dieser Zeile, der den Ertrag benennt.
**Richtung (Vorschlag, Hoheit Nele):** „Finde dein Team – danach steht dein nächstes Spiel
oben in deinem Feed."

**Gehört:** Wortlaut **Nele** · Einbau **Claude** (ein String) · keine Gestaltung nötig.

**Rückmeldung an Mats und Ronja:** Der Wert des Newsfeeds hängt vollständig am
Team-Beitritt. Das ist eine Bedarfs-Aussage, keine Textfrage — sie gehört in die
Priorisierung des Beitrittswegs.

---

### P3-1 · „Du hast schon angefangen" über „0 von 4 · 0 %"

[GESEHEN, frisches Konto] Wer in der Tour die Schritte 3 und 4 überspringt, liest auf der
Schlussfolie die Überschrift **„DU HAST SCHON ANGEFANGEN"** (`WelcomeTour.js:80`) direkt
über **„0 von 4 Startschritten erledigt · 0 %"** (`TourSteps.js:245-249`). Die Überschrift
widerspricht der Zahl darunter — genau das Muster aus
`docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md`: im Sinne des Codes stimmt beides, im Sinne
des Lesers ist die Überschrift falsch.

**Gewünschter Zustand:** Die Überschrift hängt am tatsächlichen Stand — bei 0 erledigten
Schritten eine andere Zeile als bei 1 oder 2. Kein neues Element, eine Bedingung.
**Gehört:** Wortlaut **Nele** · Einbau **Claude**. Klein, aber es ist die letzte Zeile,
die ein Neuling von der Tour mitnimmt.

### P3-2 · Das Wort „Rangliste" steht in keiner Navigation — zur Kenntnis, kein Handlungsbedarf

[GESEHEN] Navbar und PlayerNav führen „**Bestenlisten**" → `/topscorer`; dort schaltet ein
Umschalter „Spieler | Teams" auf die Rangliste. Ronjas R7 ist damit geschlossen — die Seite
ist erreichbar. Wer allerdings gezielt nach „Rangliste" sucht, sucht ein Wort, das in
keiner Leiste steht. **Ich schlage trotzdem keinen achten Navigationspunkt vor:** Die
Bündelung unter einem Begriff ist die bessere Lösung, und ein Punkt mehr kostet auf 390 px
mehr, als die Wortgleichheit einbringt.

---

## 3. Was ich bewusst NICHT ergänzt habe

Dieser Abschnitt ist so wichtig wie die Lücken — er schützt die Flächen davor, zuzuwachsen.

1. **Keine siebte Feature-Karte** auf der Startseite für „Deine Zahlen stehen".
   Sechs Karten wirken kuratiert, sieben beliebig — und die Benachrichtigung ist die
   *Einlösung* von Karte 1 („bestätigt vom Gegner"), kein siebtes Thema. Sie gehört als
   Halbsatz dorthin oder gar nicht.
2. **Keinen sechsten Tour-Schritt.** Die Tour wurde am 13.08. gerade erst von fünf
   Lesefolien auf vier echte Handlungen umgebaut (`docs/TOUR-UMBAU-2026-08-13.md`).
   Ein Schritt „Das ist deine Glocke" wäre der Rückfall in die Bedienungsanleitung —
   und Bedienungsanleitungen werden abgebrochen.
3. **Keinen Coach-Mark / Spotlight auf den Avatar.** Das wäre eine neue Mechanik
   (Overlay, Positionsmessung zur Laufzeit, `prefers-reduced-motion`, Fokusfalle) für einen
   einzigen Satz. Das Avatar-Zitat in der bestehenden Tour-Quittung leistet dasselbe ohne
   neue Ebene — und die Plattform hat am 13.08. gerade eine schwebende Ebene abgeschafft,
   weil sie Inhalt verdeckte (`components/layout/FeedbackLink.js:9-19`).
4. **Keine Platzhalter-Spieltag-Leiste** für Nutzer ohne Team. `SpieltagStrip.js:30-31`
   entscheidet richtig: leere Kästen behaupten Betrieb, den es nicht gibt.
5. **Keinen fünften Kern-Schritt in der Checkliste** („Benachrichtigungen ansehen").
   Vier Schritte plus ein sichtbar getrennter Bonus sind eine austarierte Fläche — ein
   fünfter Schritt verschiebt den Nenner und macht aus einem Einstieg eine Aufgabenliste.
   (Der Nenner-Fehler „3 von 4 bei 5 Zeilen", den Ronja als H1-Nebenbefund notierte, ist
   im Übrigen **behoben**: `OnboardingChecklist.js:190-215` trennt Bonus und Fortschritt
   sichtbar. [GESEHEN])
6. **Keinen Navigationspunkt „Rangliste"** — siehe P3-2.
7. **Keine Formulierung zum Mindestalter.** Nicht meine Fläche und nicht meine Kompetenz.
8. **Keine Änderung an der Liga-Achse, an `/tryouts` oder am Feedback-Zugang.** Alle drei
   bestehen die Erstbesucher-Prüfung. Sie stehen hier nur, damit niemand sie „auch noch"
   anfasst.

---

## 4. Übergaben

| An wen | Was |
|---|---|
| **Vivien** (Gestaltung) | Das Avatar-Zitat in der Tour-Quittung (`TourSteps.js:171`): Form, Größe, Platzierung neben dem Häkchen — Vorbild `PlayerNav.js:174-178`. Dazu: ob der letzte Tour-Schritt ausgeloggt einen anderen Fuß bekommt (P2-1). |
| **Nele** (Text) | Fünf Stellen: Glocken-Leerzustand (P1-1) · Topscorer-Leerzustand (P1-1) · Checklisten-Zeile „Team beitreten" (P2-4) · Halbsatz „Profil oben rechts" (P2-2) · Schlussfolien-Überschrift (P3-1). Alle meine Formulierungen sind **Richtungen, keine Texte**. Dazu die Begründungszeile zum Mindestalter, **sobald Nora den Rahmen gesetzt hat**. |
| **Nora** (Recht) | Braucht die Mindestalter-Abfrage eine Begründung am Formular, und muss sie mit dem Datenschutz verknüpft sein? Heute steht die Tatsachenangabe nackt (`app/signup/page.js:222-224`), und weder `/about` noch `/datenschutz` erwähnen 16 — **gemessen**. |
| **Claude** (Bau) | Vier bis fünf Strings, eine Bedingung an der Schlussfolien-Überschrift, plus das Verhalten der ausgeloggten Tour (P2-1). Erst nach Neles Wortlaut. |
| **Ronja / Mats** (Rückkanal) | R2, R4, R5, R7, K1–K5, K9 sind aus Erstbesucher-Sicht **verifiziert geschlossen**. Neu und für die Bedarfsseite relevant: Der Wert des Newsfeeds hängt vollständig am Team-Beitritt (P2-4); solange ein Nutzer kein Team hat, ist sein Feed ein Fremd-Ereignisstrom. |
| **Patrick** (Entscheidung) | Ob die Tour ausgeloggt laufen soll · ob die Checkliste nach „erledigt" auf die Profil-**Ansicht** statt auf das Formular zeigt · die Reihenfolge. |

---

## 5. Was ich NICHT geprüft habe — ehrlich

- **Google-OAuth im echten Ablauf.** Keine lokalen Keys. Nur Quelltext gelesen. Der Punkt
  „einmal auf Prod durchspielen" aus `docs/UEBERGABE-2026-08-13.md` bleibt offen.
- **Die Live-Seite `hoopsgermany.de`.** Alles lokal auf `redesign`, Dev-DB `hoopsgermany`.
  Produktivdatenbank nicht angefasst, kein Login auf Prod.
- **`/team/join/[token]` und `/team/claim/[token]` im Browser.** Nur Quelltext — beide
  brauchen gültige Token.
- **Das Team-Admin-Panel live**, insbesondere den Kader-Tab mit den drei Einladungswegen.
  Nur Quelltext; ein freigegebener Verein war nicht eingerichtet.
- **Die TeamNav** (dritte Sticky-Leiste). Feedback-Klickfläche dort nicht gemessen.
- **Screenshots.** Die Vorschaufläche kompositiert keine Frames (Fehlermeldung wörtlich:
  „the Browser pane is not displayed, so the page is not compositing frames"). Alle Belege
  sind DOM-Text, Link-Listen und gemessene Rechtecke.
- **Barrierefreiheit, Screenreader, `prefers-reduced-motion`** — nicht Gegenstand dieses
  Auftrags.
- **Die Desktop-Ausbaustufe des Hero** (Roadmap 11) — noch nicht gebaut, also nichts zu prüfen.

---

## 6. Zur Rolle selbst — die Frage aus der Übergabe

`docs/UEBERGABE-2026-08-13.md` Abschnitt 3 verlangt, dass ich sage, ob meine Rolle von
Vivien, Nele oder Ronja aufgesogen wurde. Meine ehrliche Antwort:

**Die Linse rechtfertigt sich, das Arbeitsergebnis nicht.** Drei der sieben Befunde
(P1-1, P2-1, P2-4) sind ausschließlich im Durchgang **ohne Vorwissen** entstanden — die
ausgeloggte Tour klickt niemand, der die Seite kennt, und dass die Spieltag-Leiste für
Neulinge unsichtbar ist, fällt nur auf, wenn man ohne Team ankommt. Ronjas Brille sieht
das nicht: Sie prüft den, der wiederkommt, und der hat ein Team.

Aber: **Jede einzelne Abhilfe gehört jemand anderem.** Von fünf Vorschlägen sind vier
Textzeilen (Nele) und einer eine Gestaltungsfrage (Vivien). Ich produziere kein eigenes
Artefakt. Meine Empfehlung an Patrick ist deshalb: **behalten, aber sparsam einsetzen** —
nach nutzersichtbaren Funktionen, nicht nach jedem Commit. Und mit der Erwartung, dass
der Bericht dünn wird, wenn die Flächen gut gepflegt sind. Genau das ist heute an drei von
sieben Punkten der Fall.

---

*Lina Vogt · 14.08.2026 · Nichts gebaut, nichts committet, nichts nach außen. Wegwerf-Konten
gelöscht, Dev-Server beendet. Priorisierung: Patrick.*
