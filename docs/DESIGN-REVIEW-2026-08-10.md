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

---

## Welle 2b – Team-Admin-Panel auf das Designsystem (mechanisch, hoher Nutzen)

Betrifft `components/team/tabs/`: KaderTab, AnfragenTab, SpielplanTab, ErgebnisseTab, TryoutsTab,
EinstellungenTab.

1. **Lokale Klassen-Strings ersetzen:** Jeder Tab definiert eigene `inputClass`/`numInput`/
   `statInput`/`selectCls` (KaderTab ~Z.27, SpielplanTab ~Z.10, TryoutsTab ~Z.16, ErgebnisseTab
   ~Z.13–16, EinstellungenTab ~Z.19) → durch `inputClass`/`inputClassSm` aus `lib/ui.js` ersetzen.
   (CLAUDE.md schreibt das vor; bewusst ausgenommen bleiben nur `team/claim`, `admin/leagues`,
   `admin/update-match`.)
2. **Ladezustände:** 4 Tabs bauen einen eigenen `FaBasketballBall animate-bounce` **ohne**
   `motion-reduce` nach (AnfragenTab ~Z.56–62, SpielplanTab ~Z.161–167, ErgebnisseTab ~Z.231–237,
   TryoutsTab ~Z.130–136) → `components/ui/Loading` verwenden.
3. **Leerzustände:** handgebaute gestrichelte Boxen → `components/ui/EmptyState`.
4. **Icon-only-Buttons brauchen `aria-label`** (bisher nur `title`): KaderTab (~Z.590 FaHashtag,
   ~Z.613–625 FaSlidersH, ~Z.635–648 FaUserShield/FaUserSlash, ~Z.653–660 FaUserMinus, ~Z.760–790
   FaTrash/FaCopy), SpielplanTab ~Z.419–426, TryoutsTab ~Z.299–306.
5. **Flash-Meldungen ohne `aria-live`:** identischer Baustein in allen 6 Tabs (KaderTab ~Z.361–371,
   AnfragenTab ~Z.71–81, SpielplanTab ~Z.183–193, ErgebnisseTab ~Z.249–259, TryoutsTab ~Z.152–162,
   EinstellungenTab ~Z.313–323) → gemeinsame Komponente mit `aria-live="polite"` (ggf. `FormAlert`
   wiederverwenden/erweitern).
6. **Touch-Ziel:** DNP-Checkbox in `ErgebnisseTab.js` (~Z.462) ist `h-4 w-4` (16px) ohne erweiterte
   Klickfläche → Wrapper mit `min-h-11` (44px WCAG).
7. **Pflichtfelder markieren:** In `EinstellungenTab.js`, `app/team/create/page.js`,
   `app/player/edit-profile/page.js` sind optionale Felder teils mit „(optional)" markiert,
   Pflichtfelder aber nie → konsistente `*`-Kennzeichnung.
8. **Kader-Tab entlasten** (~Z.373–546): Drei optisch gleichwertige Wege („Bestehenden Spieler
   einladen", „Neuen Spieler anlegen", „Team-Einladungslink") ohne Führung. Häufigsten Fall
   (bestehende Accounts einladen) visuell führend machen, die anderen in ein „Weitere Optionen"-
   Accordion. **Hinweis:** Nach Welle 2a ist der Einladungslink-Block hier die alleinige Quelle –
   beim Umbau nicht versehentlich entfernen.

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

## Hero-Animation überarbeiten (Patrick-Auftrag, mit Milos neuen Werkzeugen)

Aktueller Stand: `components/landing/HeroBallArc.js` – inline-SVG-Ball zieht scroll-gesteuert einen
Bogen zum Korb-Symbol, rechts neben dem Textblock, **erst ab 1280px sichtbar** (darunter bewusst
ausgeblendet, weil der freie Rand zu schmal wird).
- **Bessere Assets:** Milo hat seit 10.08. `svgo`, `sharp`, `ffmpeg` (in
  `Desktop\Hoops-Marketing\_werkzeuge\`, Installationsvermerke dort). Ball und Korb/Netz als
  sauber gezeichnete, svgo-optimierte Vektoren statt der schlichten Kugel.
- **Mobile-Variante prüfen:** Die Zielgruppe der Tester-Kampagne kommt per QR-Code **mit dem Handy** –
  dort ist der Effekt aktuell unsichtbar. Vivien soll bewerten, ob ein kürzerer Bogen unter dem
  Textblock trägt oder ob „bewusst nur Desktop" die ehrlichere Lösung bleibt.
- **Nicht** ohne echtes Material: KI-Videogenerierung wurde verworfen (`dec-milo-bewegtbild-tools`);
  ein echter Hallen-Clip von Patrick/Jonatan wäre die Grundlage für eine größere Variante –
  dann als eigener Abschnitt unterhalb des Heros, außerhalb des Ladepfads.

## Arbeitsweise (verbindlich)
- Vor jedem Deploy: `npm run build` + `npx playwright test -c tests/e2e/playwright.config.mjs` (8/8),
  danach **Kais Deploy-Gate** (`test-automatisierung`, security-review + review, Mandat aus
  `dec-scouting-2026-08-10`).
- ⚠️ Vor Testläufen prüfen, ob ein Zombie-Dev-Server auf Port 3000 hängt (`netstat -ano | grep :3000`)
  – ein solcher lieferte am 10.08. reproduzierbar 500er und damit falsche Testrot-Meldungen.
- Rollback: aktueller Live-Stand per `git log` auf `redesign`; die alte Seite (PM2 `sports`,
  Port 3000, DB `test`) bleibt unangetastet als Notfall-Fallback.
