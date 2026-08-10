# Design-Review aller Unterseiten (10.08.2026) – offene Befunde & Arbeitsauftrag

> Quelle: Drei parallele Review-Bündel von Vivien (design-spezialistin) am 10.08.2026, jeweils
> Code + Live-Prüfung auf hoopsgermany.de; dazu zwei Entscheidungen von Ronja (retention-analystin,
> live am Dev-Server verifiziert). Dieses Dokument hält fest, was **noch offen** ist – erledigte
> Punkte stehen in `docs/CHRONIK.md`. Marken-Leitplanken gelten überall: Inter, helle Seiten +
> Navy-Flächen (slate-950→slate-800), Orange `brand-500`, `font-black`-Headlines, Primitive aus
> `components/ui/`, Tokens aus `lib/ui.js`. Kein Rebrand.

## Bereits erledigt (Kontext)
- **Welle 1** (`fe6ca42` + `0ce7846`, live): eigene deutsche 404-Seite, `components/ui/FormAlert.js`
  (role=alert/aria-live) in login/signup/reset-password/kontakt, Skeletons statt Spinner auf
  rangliste/tryouts, zwei handgerollte Spinner ohne motion-reduce entfernt, `tryouts/[id]` mit
  PageHeader + Button-Primitiven, Button-Primitive in kontakt/feedback/player-detail, Select-Tokens
  auf `inputClassSm`, Karten-Hover auf das `Card.js`-Muster, Emoji→Icons, `AuthShell` mobil gestrafft,
  `Skeleton.js` mit `motion-reduce`.
- **Welle 2a** (läuft/gelaufen): Einladungslink entdoppelt + Bestätigung vor Neu-Erzeugen,
  `components/ui/ConfirmAction.js` statt `window.confirm` an 3 Stellen, Speicher-Rückmeldung am
  Benachrichtigungs-Schalter, Sprungmarken im Einstellungen-Tab.
- **Welle 2b + Hero-Animation** (11.08.2026, erledigt – Punkte 1–8 und der Hero-Auftrag; Details
  im Chronik-Protokoll): Feld-Tokens zentral (`lib/ui.js` um `inputClassNum`/`inputClassStat`
  erweitert), `components/team/tabs/TabAlert.js` (FormAlert-Wrapper mit `role=alert`/`aria-live`),
  `Loading`/`EmptyState`/`Button`-Primitive in allen 6 Tabs, `aria-label` an allen Icon-Buttons,
  DNP-Touchziel 44×44, `*`-Pflichtfeldkennzeichnung (EinstellungenTab, `team/create`,
  `player/edit-profile`), Kader-Tab mit geführtem Standardweg + „Weitere Optionen"-Akkordeon,
  letzte zwei `window.confirm` (Slot entfernen, Adminrechte) auf `ConfirmAction`,
  neue Korb-/Ball-Vektoren + „Swish"-Abschluss in `components/landing/HeroBallArc.js`.

---

## Welle 3 – Öffentliche Seiten, höchste Nutzerwirkung

9. **Mobile-Tabellen unlesbar (wichtigster offener Befund):** Rangliste, Topscorer und Liga-Tabelle
   (`app/ligen/[id]`) haben `overflow-x-auto`, aber keine Scroll-Affordance. Live auf 375px: man
   sieht Teamname **oder** Korbdifferenz, nie beides, und nichts deutet an, dass man wischen kann.
   → Erste Spalte `sticky left-0 bg-white` + dezenter Rand-Fade als Hinweis; eine Lösung bauen,
   dreimal einsetzen.
10. **Mobile-Filterleisten widersprüchlich:** `app/spiele` nutzt `grid-cols-2 sm:grid-cols-3`
    (kompakt), `app/spieler`/`app/teams`/`app/transfermarkt` stapeln jeden Filter volle Breite →
    auf `/spieler` fünf volle Zeilen, bevor die erste Karte sichtbar wird. → auf das 2-spaltige
    Muster vereinheitlichen (CityRadiusFilter darf eigene Zeile behalten).
11. **Motion-System wird auf keiner der 11 öffentlichen Seiten genutzt** (grep-verifiziert):
    `components/ui/CountUp.js` für Zahlenspalten (Topscorer PKT/Ø, Rangliste S/N/Diff),
    `components/ui/Reveal.js` mit kleinem Stagger für die Karten-Grids. Optional, kein Blocker.

## Welle 4 – Info-/Rechts-/Auth-Seiten (klein)

12. **`components/layout/LegalShell.js`:** Zeilenlänge live 75–80 Zeichen (Ziel 45–75) →
    `max-w-2xl` auf `max-w-xl`.
13. **Datenschutz ohne Sprungnavigation** (10 Abschnitte): `id`-Attribute an `LegalHeading` +
    kompaktes Sprungmenü, das `LegalShell` ab >5 Abschnitten rendert. ⚠️ Nur Gestaltung –
    **Inhalt/Formulierungen der Rechtstexte nicht ändern** (gehört Nora, recht-vorpruefung).
14. **`app/oauth-landing/page.js`:** Fehlerzustand ohne Logo/AuthShell-Rahmen → einbetten.
15. **FeedbackButton-Position (C1):** FAB überlappt live gemessen auf `/signup` den
    Google-Registrieren-Button und auf `/installieren` Akkordeon-Text – **bei Scroll-Position 0**,
    also nicht durch die Scroll-Ausblendung gelöst, die in einer separaten Session gefixt wurde.
    Strukturelle Regel nötig: auf Formular-/Auth-Seiten mit CTA im unteren Drittel ausblenden
    (analog zur bestehenden `/feedback`- und `/admin`-Ausnahme, `FeedbackButton.js` ~Z.32).
    ⚠️ Vor dem Anfassen prüfen, ob der Fix aus der Parallel-Session inzwischen committet ist.

## Hero-Animation (11.08.2026 überarbeitet – offen bleibt nur der Hallen-Clip)

Umgesetzt in `components/landing/HeroBallArc.js`:
- **Bessere Assets (erledigt):** Ball mit Radial-Verlauf, sauberen Nähten und Schlagschatten
  (liest sich jetzt auch über dem dunklen Foto), Korb mit Brett + Zielfeld, orangenem Ring und
  Netz als Rautenmuster statt gerader Striche. Handgezeichnetes, kompaktes Inline-SVG
  (keine zusätzliche Anfrage, kein Build-Schritt – deshalb kein svgo nötig).
- **Bewegung (erledigt):** Der Ball bleibt am Ende nicht mehr auf dem Ring stehen, sondern fällt
  ab `t≈0.88` durch das Netz und blendet dabei aus; der Ring gibt kurz nach („Swish").
- **Mobile-Entscheidung (geprüft, bewusst Desktop-only):** Unter 1280px reicht die Gutter neben dem
  `max-w-4xl`-Content-Block nicht; auf Telefonen läuft der Hero-Text bis an beide Ränder und füllt
  bei kleinen Viewports die volle Höhe – jede Bahn würde Headline/Buttons kreuzen oder unter dem
  Falz enden. Ein „kürzerer Bogen unter dem Textblock" wurde deshalb verworfen (Begründung steht
  als Kommentar in der Komponente).
- **Weiterhin offen:** die größere mobile Wirkung soll aus **echtem Hallenmaterial** kommen
  (KI-Videogenerierung verworfen, `dec-milo-bewegtbild-tools`). Ein Clip von Patrick/Jonatan wäre
  die Grundlage – dann als eigener Abschnitt unterhalb des Heros, außerhalb des Ladepfads.

## Arbeitsweise (verbindlich)
- Vor jedem Deploy: `npm run build` + `npx playwright test -c tests/e2e/playwright.config.mjs` (8/8),
  danach **Kais Deploy-Gate** (`test-automatisierung`, security-review + review, Mandat aus
  `dec-scouting-2026-08-10`).
- ⚠️ Vor Testläufen prüfen, ob ein Zombie-Dev-Server auf Port 3000 hängt (`netstat -ano | grep :3000`)
  – ein solcher lieferte am 10.08. reproduzierbar 500er und damit falsche Testrot-Meldungen.
- Rollback: aktueller Live-Stand per `git log` auf `redesign`; die alte Seite (PM2 `sports`,
  Port 3000, DB `test`) bleibt unangetastet als Notfall-Fallback.
