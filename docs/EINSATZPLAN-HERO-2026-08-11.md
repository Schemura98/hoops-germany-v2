# Einsatzplan: Reihenfolge bei Design-/Feature-Aufträgen (Anlass Hero-Sektion, 11.08.2026)

Auftrag von Patrick, erstellt von Ole (einsatzplaner). Anlass: Die Hauptsession hat Vivien
(design-spezialistin) direkt mit der scroll-gesteuerten Hero-Sektion beauftragt, ohne vorher
Nele/Mats nach dem primären Nutzungskontext zu fragen. Ergebnis: ein sauberes Konzept
(`docs/HERO-KONZEPT-2026-08-11.md`), das den Wow-Effekt strukturell als Desktop-Erlebnis anlegt,
während die Tester-Kampagne die Nutzer per QR-Code gezielt aufs Handy führt — also genau umgekehrt
zur echten Nutzung. **Verantwortlich für die falsche Reihenfolge ist die Hauptsession, nicht Vivien
und nicht Nele.**

---

## 1. Ist-Analyse: Wie liefen Design-/Feature-Aufträge bisher tatsächlich?

### 1.1 Belegbares Muster: Qualitäts-Review lief sauber, Auftragsvergabe nicht

`docs/DESIGN-REVIEW-2026-08-10.md` zeigt einen funktionierenden Prozess für **bestehende Flächen**:
Vivien liefert drei parallele Review-Bündel (Code + Live-Prüfung), Ronja bringt zwei Entscheidungen
ein, am Ende steht ein fester Deploy-Gate-Satz („Arbeitsweise (verbindlich)": Build + Playwright +
Kais Security-/Review-Gate). Für **Wellen 1–4** (Button-Primitive, ARIA-Labels, scrollbare Tabellen,
`ConfirmAction` statt `window.confirm` usw.) war das genau richtig dimensioniert: das sind begrenzte,
risikoarme Handwerks-Korrekturen innerhalb eines bereits gesetzten Designsystems. Hier brauchte es
weder Mats noch Nele vorab — und das ist auch für künftige Aufträge dieser Größe **richtig so**, nicht
nachzubessern.

### 1.2 Die Lücke: Nutzungskontext war zum Zeitpunkt der Auftragsvergabe nicht dokumentiert verfügbar

`docs/INSPIRATION-SCROLL-BEISPIEL-2026-08-10.md` (10.08., einen Tag vor dem Hero-Konzept) hält bereits
fest: „Pflicht: Performance-Budget mobil, `prefers-reduced-motion`-Fallback" — mobile Rücksicht war
also grundsätzlich im Bewusstsein. Was dort **fehlt**, ist die konkrete Tatsache, die den Unterschied
macht: dass die Tester-Kampagne **gezielt per QR-Code aufs Handy** führt und Mobile damit nicht nur
„mitgedacht", sondern der **primäre Fall** ist. Diese Tatsache steht nirgends in den Dokumenten, die
Vivien für den Hero-Auftrag vorlagen (`CLAUDE.md`, `docs/DESIGN-REVIEW-2026-08-10.md`,
`docs/INSPIRATION-SCROLL-BEISPIEL-2026-08-10.md`) — sie liegt ausschließlich im Marketing-Gedächtnis
(`tester-kampagne.md`, Patricks Kopf) und in `docs/BEDARFSANALYSE-2026-08-09.md` nur indirekt
(H5-Hypothese zu QR-Tracking, nicht als Fakt „Mobile ist der Haupt-Einstieg").

### 1.3 Beleg im Hero-Konzept selbst: Vivien hat die fehlende Übergabe korrekt benannt, aber falsch geschlossen

`docs/HERO-KONZEPT-2026-08-11.md`, Zeile 6–9: „Einbezogene Kollegen: keine zusätzlichen — reine
Design-/Frontend-Entscheidung ohne Marketing-**Botschaft** (Nele nicht nötig, Copy bleibt exakt wie
heute) …". Das ist der Kernfehler, aber er ist nachvollziehbar: Vivien hat „Nele" mit „Botschaft/Copy"
gleichgesetzt und daraus geschlossen, dass sie nicht gebraucht wird. Tatsächlich ist Neles
Zuständigkeit laut ihrer eigenen Rollendefinition breiter — „**Zielgruppen definieren** (aus echten
Daten, Annahmen gekennzeichnet) und **jedes Material aus Zielgruppensicht prüfen**" — das schließt
Einstiegspfad und primäres Gerät ausdrücklich ein, nicht nur Wortwahl. Vivien selbst benennt das
Trade-off im eigenen Dokument später ehrlich unter „Risiken" (Zeile 242–249): „Die mobile Fassung ist
die Realität für die meisten Tester … das steht oben unter ‚Risiken' und wird hier nicht verschwiegen."
Das ist der Beleg, dass die Design-Arbeit selbst sauber und selbstkritisch war — der Fehler liegt vor
Viviens erster Zeile, nicht in ihrer Ausführung.

### 1.4 Struktureller Befund in Neles eigener Rollendefinition: der Check ist als Nachprüfung verankert, nicht als Vorprüfung

`employees.ts` (emp-nele) listet unter `responsibilities`: „Zielgruppen definieren … und jedes Material
aus Zielgruppensicht prüfen — **auch nach Viviens Finish**". Das „auch nach" ist wörtlich korrekt (ein
Nach-Check soll stattfinden), aber es gibt **keine Entsprechung davor**: nirgends steht „Nele liefert
den Nutzungskontext, bevor Vivien beginnt". Der bestehende Prozess sieht Zielgruppen-Prüfung also
strukturell als Qualitätskontrolle **nach** der Gestaltung vor — für Copy/Bildsprache passt das, für
eine Grundsatzentscheidung wie „welches Gerät ist der Hauptfall" kommt der Check damit systematisch zu
spät, weil zu dem Zeitpunkt schon eine ganze Konzept-Architektur (Pin-Mechanik, Szenen-Dramaturgie,
Komponentenschnitt) darauf aufbaut.

### 1.5 Was das NICHT ist

Kein Fehler von Vivien (sie hat innerhalb ihres Auftrags sauber, begründet und selbstkritisch
gearbeitet und das Desktop/Mobile-Trade-off offen benannt), kein Fehler von Nele (sie wurde schlicht
nicht gefragt) und kein Einzelfall-„Ausrutscher" ohne System dahinter — es ist eine **Lücke im
Ablauf**, die zwei konkrete Ursachen hat: (a) die Hauptsession hat den Auftrag ohne Vorlauf vergeben,
(b) selbst wenn sie gefragt hätte, war die entscheidende Tatsache (QR-Code → Handy) an keiner Stelle
dokumentiert, an der ein Design-Auftrag sie automatisch aufgreifen würde.

---

## 2. Verbindliche Standard-Abfolge für nutzersichtbare Design-/Feature-Aufträge

Bewusst **zweistufig**, damit die Regel nicht bei jedem Button-Fix greift und deshalb ignoriert wird.

### Schwelle: Wann greift welcher Weg?

**Voller Ablauf**, wenn mindestens eines zutrifft:
- Der Auftrag verändert eine **primäre Nutzer-Einstiegsfläche** strukturell (Landing/Hero, Auth-Flow,
  zentrale Kernpfade wie Team-Admin-Panel, Ergebnis-Verifikation) — nicht nur Feinschliff an
  Bestehendem.
- Der Auftrag hängt mit einer **aktiven Kampagne oder einem Launch** zusammen (z. B. Tester-Kampagne).
- Der Auftrag ist ein **neuer nutzersichtbarer Bereich/eine neue Kernfunktion** (hier gelten ohnehin
  bereits die drei bestehenden CLAUDE.md-Konventionen: Doku, Feedback/Analytics, Onboarding-Flächen —
  die neue Regel unten reiht sich als vierte ein).
- Es gibt eine **erkennbare Zielgruppen-/Geräte-Weiche** (Desktop vs. Mobile, verschiedene Nutzer-
  gruppen mit unterschiedlichem Bedarf) — genau der Fall, der hier gefehlt hat.

**Kurzer Weg** (wie bisher, unverändert), wenn:
- Handwerks-Korrektur innerhalb eines bereits gesetzten Musters (Wellen-1–4-Befunde: ARIA-Labels,
  `ConfirmAction`, Zeilenlänge, ein Primitive konsequent zu Ende ausrollen).
- Bugfix, Copy-Korrektur, Spacing/Farb-Feinschliff ohne Verhaltensänderung.
- Bereits vollständig durch einen bestehenden Skill/eine bestehende Konvention abgedeckt.

### Voller Ablauf — Reihenfolge

1. **Nutzungskontext-Vorlauf (Pflicht, siehe Regel unten):** Nele (ggf. mit Mats bei echten
   Scope-/Bedarfsfragen) liefert **vor** Vivien: primäres Gerät, Einstiegspfad, primäre Handlung —
   als kurzer, dokumentierter Vermerk, kein neues Vollgutachten.
2. **Mats** — nur wenn eine echte „brauchen wir das/in dieser Form" oder Prioritäts-Frage im Raum
   steht (bei einem bereits gesetzten Feature wie dem Hero: meist nicht nötig, siehe Abschnitt 5).
3. **Vivien** — Gestaltung, mit dem Nutzungskontext aus Schritt 1 als expliziter Eingabe (Brief),
   nicht als Annahme.
4. **Milo** — parallel zu 3 möglich, sobald Vivien den Asset-Bedarf grob beziffert hat (bei diesem
   Hero-Konzept: laut Vivien selbst kein neues Asset für v1 nötig, siehe `HERO-KONZEPT` Abschnitt
   „Assets").
5. **Hauptsession** — Umsetzung nach Freigabe des Konzepts.
6. **Kai** — automatisierte Tests + Security-/Perf-Review vor Deploy (bestehendes Gate, unverändert).
7. **Tobias** — unabhängiges Browser-Gate, Mobile **zuerst**, wenn Mobile der Hauptfall ist.
8. **Ronja** — nach Live-Schaltung: Retention-/Nutzungsprüfung am echten Verhalten.
9. **Nora** — nur bei echter rechtlicher Berührung (neue Datenerhebung, Tracking, Consent) — bei
   einem rein visuellen/motion-basierten Hero **nicht** nötig.

### Kurzer Weg — Reihenfolge

Hauptsession setzt um → Kai-Gate vor Deploy. Kein Mats/Nele/Vivien-Vorlauf, kein Ronja-Nachlauf,
außer im Review fällt etwas auf, das die Schwelle doch reißt (dann Eskalation, nicht stilles
Weiterarbeiten).

### Ehrlichkeit zur Bürokratie-Frage

Ein Vorlauf-Zwang für **jeden** Design-Auftrag wäre hier tatsächlich mehr Bürokratie als Nutzen — die
Wellen-1–4-Arbeit war schnell, richtig dimensioniert und hat ohne Mats/Nele/Ronja funktioniert, weil
sie Bestehendes präzisiert statt Grundsatzentscheidungen zu treffen. Die Schwelle oben ist deshalb
bewusst eng gefasst: primäre Einstiegsflächen, aktive Kampagnen, neue Kernfunktionen, erkennbare
Zielgruppen-/Geräte-Weichen. Alles andere läuft weiter wie bisher.

---

## 3. Auslöse-Regel gegen genau diesen Fehler

> **Vor jedem Gestaltungsauftrag, der eine primäre Nutzer-Einstiegsfläche strukturell verändert oder
> mit einer aktiven Kampagne zusammenhängt, steht ein belegter Nutzungskontext: primäres Gerät,
> Einstiegspfad, primäre Handlung. Liegt er nicht bereits dokumentiert vor, holt ihn Nele (bei echten
> Bedarfsfragen zusätzlich Mats) in maximal einem Arbeitsschritt nach — *bevor* der Gestaltungsauftrag
> beginnt, nicht als Prüfung danach.**

Diese Regel hätte den konkreten Fehler verhindert: Sie hätte erzwungen, dass vor Viviens erster Zeile
die Tatsache „QR-Code → Handy, Mobile ist der Hauptfall" als Brief vorliegt, statt erst in Viviens
eigenem, ehrlichem „Risiken"-Abschnitt am Ende sichtbar zu werden.

---

## 4. Wo verankern

**Primär: CLAUDE.md Abschnitt 0, als vierte Konvention** (analog zu den drei bestehenden — Doku,
Feedback/Analytics, Onboarding-Flächen). Das ist die kanonische, session-übergreifende Quelle laut
Projektregel selbst („CLAUDE.md ist die kanonische, session-übergreifende Quelle — das private
Session-Gedächtnis ersetzt sie nicht"). Vorgeschlagener Text, im Stil der bestehenden drei:

```
> 📌 **KONVENTION (verbindlich): Vor Gestaltungsaufträgen an primären Einstiegsflächen steht der
> Nutzungskontext.** Verändert ein Auftrag eine primäre Nutzer-Einstiegsfläche strukturell (Landing/
> Hero, Auth-Flow, zentrale Kernpfade) oder hängt er mit einer aktiven Kampagne zusammen, MUSS vor
> Beauftragung von Vivien (design-spezialistin) ein belegter Nutzungskontext vorliegen: primäres
> Gerät, Einstiegspfad, primäre Handlung. Liegt er nicht bereits dokumentiert vor, holt ihn Nele
> (marketing-manager) — bei echten Bedarfs-/Scope-Fragen zusätzlich Mats (marktforscher) — in
> maximal einem Arbeitsschritt nach, BEVOR der Gestaltungsauftrag beginnt. Für Handwerks-Korrekturen
> innerhalb eines bereits gesetzten Musters (Bugfixes, ARIA-/A11y-Feinschliff, Primitive konsequent
> ausrollen) entfällt dieser Vorlauf – dort bleibt der bisherige kurze Weg (Hauptsession → Kais
> Deploy-Gate) unverändert. Dafür gibt es keinen eigenen Skill – der Vorlauf ist ein
> Reihenfolge-Prinzip, keine wiederkehrende Datei-Checkliste; Referenz bei Bedarf:
> `docs/EINSATZPLAN-HERO-2026-08-11.md`.
```

**Sekundär (Empfehlung, nicht Teil dieses Auftrags):** Der Passus „auch nach Viviens Finish" in
`emp-nele.responsibilities` (`employees.ts`) sollte um den Vorlauf-Fall ergänzt werden, damit auch das
Roster selbst die richtige Reihenfolge zeigt statt nur den Nachlauf. Das ist eine Roster-Änderung und
läuft damit über Hannas Prozess (hr-koordinator), nicht über mich direkt — ich melde es hier als
Fund, ändere die Seed-Datei aber nicht eigenmächtig.

**Kein eigener Skill nötig:** Anders als die drei bestehenden Konventionen (die jeweils eine
wiederkehrende Datei-Checkliste kodifizieren — welche Dateien bei einem neuen Feature mitwachsen
müssen) ist dies ein reines Reihenfolge-Prinzip ohne Dateiliste. Ein Skill dafür wäre Overhead ohne
Mehrwert gegenüber dem kurzen CLAUDE.md-Absatz.

---

## 5. Einsatzplan für den laufenden Hero-Auftrag

| Schritt | Wer | Was | Status/Reihenfolge |
|---|---|---|---|
| 1 | **Nele** | Nutzungskontext-Vermerk fertigstellen: primäres Gerät (Handy), Einstiegspfad (QR-Code aus der Tester-Kampagne), primäre Handlung (Registrieren/Feed erreichen) — kurz, als Brief-Grundlage für Vivien, nicht als neues Vollgutachten. | **Läuft bereits** (laut Patricks Auftrag) — als Nächstes abschließen. |
| 2 | **Milo** | Optionen für echtes Hallenmaterial sondieren (der in `HERO-KONZEPT` bereits benannte offene Punkt „Weiterhin offen: die größere mobile Wirkung soll aus echtem Hallenmaterial kommen"). Nicht production-fertig produzieren, solange Viviens mobile-first-Revision die genauen Maße/Formate noch nicht bestätigt hat — sonst Gefahr von Wegwerf-Arbeit. | **Läuft bereits**, bewusst auf Sondierungsstufe halten bis Schritt 3 steht. |
| 3 | **Vivien** | Hero-Konzept mobil-first überarbeiten: Mobile bekommt die volle, optimierte Choreografie (Pin/Szenen-Logik primär für <1024px auslegen), Desktop wird die zusätzliche Ausbaustufe obendrauf, nicht umgekehrt. Nutzungskontext aus Schritt 1 als expliziter Input zitieren. Bestehende Substanz (rAF-Technik statt CSS-Timeline, Reduced-Motion-Fassung, kein neues Asset in v1, `HeroBallArc`-Ablösungs-Vorschlag) bleibt tragfähig und muss nicht neu hergeleitet werden — nur die Gewichtung Mobile/Desktop dreht sich um. | Startet, sobald Schritt 1 vorliegt. |
| 4 | **Hauptsession** | Umsetzung nach Viviens überarbeitetem Konzept — diesmal **nach** statt parallel zu Viviens Arbeit, damit nicht wieder auf einer noch nicht kontext-geprüften Grundlage gebaut wird. | Nach Schritt 3. |
| 5 | **Kai** | Automatisierte Tests + Security-/Perf-Gate vor Deploy — inkl. des von Vivien selbst geforderten Pflicht-Checks „Low-End-Android … Chrome-DevTools-CPU-Throttling (4×)" aus dem Risiken-Abschnitt des Konzepts, weil das jetzt der Hauptfall ist, nicht mehr nur eine Randnotiz. | Nach Schritt 4. |
| 6 | **Tobias** | Unabhängiges Browser-Gate — **Mobile zuerst** (375px, echter QR-Einstiegspfad simuliert: Landing direkt, nicht über internen Klickpfad), danach Desktop. | Nach Schritt 5. |
| 7 | **Ronja** | Nach Live-Schaltung: prüft am echten Nutzungsverhalten, ob der mobile Hero tatsächlich zur Registrierung/zum Feed führt (Bezug zu H1/H5 aus `BEDARFSANALYSE-2026-08-09.md`) — Messvorschlag statt erfundener Zahlen. | Nach Live-Schaltung. |
| — | **Nora** | Nicht einbezogen — reine Visual-/Motion-Änderung ohne neue Datenerhebung/Tracking/Consent-Berührung. | entfällt |
| — | **Mats** | Nicht zusätzlich einbezogen — es ist keine „brauchen wir den Hero überhaupt"-Frage, sondern eine Umsetzungsfrage; seine Bedarfsanalyse vom 09.08. deckt das Marken-/Zielgruppenbild bereits ab, Nele überträgt es auf den konkreten Fall. | entfällt |

---

## 6. Kollegen einbezogen (dieser Auftrag)

Rein lesende Auswertung vorhandener Dokumente + Roster (`docs/DESIGN-REVIEW-2026-08-10.md`,
`docs/HERO-KONZEPT-2026-08-11.md`, `docs/INSPIRATION-SCROLL-BEISPIEL-2026-08-10.md`,
`docs/BEDARFSANALYSE-2026-08-09.md`, `employees.ts`) — keine weiteren Agenten aktiv eingebunden, da
der Auftrag ausdrücklich Analyse + Plan verlangt, keine Umsetzung. Zwei Folgepunkte an Kollegen
gemeldet statt selbst ausgeführt:
- **Hanna (hr-koordinator):** Empfehlung, `emp-nele.responsibilities` um den Vorlauf-Fall zu ergänzen
  (Abschnitt 4), damit das Roster die neue Reihenfolge korrekt zeigt — Roster-Änderungen laufen über
  ihren Prozess, nicht über mich direkt.
- **Malik (team-coach):** könnte bei Gelegenheit prüfen, ob die Formulierung in Viviens und Neles
  Agent-Definitionen (`~/.claude/agents/design-spezialistin.md`, `marketing-manager.md`) mit der neuen
  Konvention konsistent ist — nicht Teil dieses Auftrags, nur als Anschlussfund vermerkt.

Nele und Milo laufen bereits auf Patricks Anweisung (Abschnitt 5, Schritte 1–2) — von mir nicht neu
beauftragt, nur im Einsatzplan eingeordnet.
