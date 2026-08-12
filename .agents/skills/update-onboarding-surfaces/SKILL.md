---
name: update-onboarding-surfaces
description: Nach dem Bau einer neuen nutzersichtbaren Funktion/eines neuen Bereichs von Hoops Germany die Erklär- und Onboarding-Flächen mitpflegen, damit Neulinge das Feature entdecken und die Startseite nicht veraltet: Landing-Feature-Cards („Alles, was du brauchst"), Plattform-Tour, „So funktioniert's", Navbar/Footer-Links, Onboarding-Checklist. Prüft zusätzlich – mit klarer rechtlicher Warnung – Impressum/Datenschutz. Nutze diese Skill nach einem neuen Feature/Bereich, zusammen mit log-progress und update-feedback-analytics.
---

# Onboarding-/Erklär-Flächen bei neuen Funktionen aktualisieren

Wird ein **neuer, für Nutzer sichtbarer Bereich oder eine größere Funktion** gebaut, veralten leicht die
Stellen, die die Plattform **erklären und bewerben** – vor allem für neue Nutzer. Diese Skill ist die
Checkliste, damit die Startseite und das Onboarding mitwachsen. Sie ergänzt `update-feedback-analytics`
(Feedback + Analytics) und `log-progress` (Doku).

## Wann ausführen
- Nach dem Bau eines **neuen Bereichs / einer neuen Kernfunktion**, die ein Neuling kennen sollte
  (z. B. neuer Top-Level-Bereich wie Transfermarkt, Ligen, Rangliste, eine neue Community-Funktion).
- **Nicht** für interne Fixes, kleine UX-Tweaks oder Bugfixes ohne neuen nutzersichtbaren Wert – die
  Flächen bewusst knapp und ehrlich halten (nicht jede Kleinigkeit gehört auf die Landing/Tour).
- Immer nur **prüfen und bei echtem Mehrwert ergänzen** – kein Zwang, überall etwas hinzuzufügen.

## Die Flächen (Datei → was pflegen)

### 1. „Alles, was du brauchst" – Feature-Cards (Startseite)
Datei: **`app/page.js`** → `const features = [...]` (aktuell 6 Cards: `icon`/`title`/`desc`).
- Bringt das Feature einen **eigenständigen Nutzen-Baustein**, eine Card ergänzen/anpassen.
- Icon aus `react-icons/fa`; Stil der bestehenden Cards spiegeln. Lieber eine Card **schärfen** als die
  Liste beliebig verlängern (6–8 wirken kuratiert, 12 wirken beliebig).

### 2. Plattform-Tour (Willkommens-Overlay, 5 Slides)
Datei: **`components/onboarding/WelcomeTour.js`** → `const STEPS = [...]` (`title`/Text/Icon).
- Öffnet sich einmalig nach der Registrierung + über den Footer-Link „Plattform-Tour".
- Neue **große** Funktion in einen bestehenden Slide einweben (z. B. Transfermarkt-Slide) statt einen 6.
  Slide anzuhängen – die Tour soll kurz bleiben. Nur bei echtem neuem Themenblock einen Slide ergänzen.

### 3. „So funktioniert's" + Landing-Bausteine
Dateien: **`components/landing/LandingHowItWorks.js`** (login-bewusst: ausgeloggt Onboarding-Schritte,
eingeloggt „Deine nächsten Schritte"), **`LandingHero.js`** (Hero-Buttons + eingeloggte Schnellaktionen),
**`LandingOnboarding.js`**, **`LandingCTA.js`**.
- Wenn das Feature ein sinnvoller **nächster Schritt** für Nutzer ist, hier verlinken/erwähnen.

### 4. Navigation – Navbar & Footer
Dateien: **`components/layout/Navbar.js`** (öffentlich), **`components/layout/PlayerNav.js`**
(eingeloggt), **`components/layout/Footer.js`**.
- **Ein neuer eigener Bereich MUSS erreichbar sein.** Prüfen, ob er in der Navbar (ab `lg` inline, sonst
  Hamburger) und/oder im Footer verlinkt ist – sonst ist das Feature praktisch unsichtbar (vgl. „Scouting
  war nicht in der Navbar" im Verlauf). Aktive-Seiten-Markierung (`usePathname`) beibehalten.

### 5. Onboarding-Checklist
Datei: **`components/onboarding/OnboardingChecklist.js`** → `computeSteps(player)` (4 Kern-Schritte +
PWA-Bonus). Erscheint im Newsfeed und auf der eingeloggten Startseite; `done`-Status wird aus `getmyinfo`
abgeleitet.
- Nur anfassen, wenn das Feature ein **echter Erst-Schritt für neue Nutzer** ist. Neue Kern-Schritte
  zählen in Fortschritt/`allDone` – behutsam sein, sonst sehen „fertige" Bestandsnutzer die Karte wieder
  (Muster: PWA ist bewusst ein **Bonus**-Baustein, der NICHT in `allDone` zählt).

## ⚠️ 6. Impressum & Datenschutz – NUR bei echten Faktenänderungen
Dateien: **`app/impressum/page.js`**, **`app/datenschutz/page.js`** (Betreiber: Patrick Schemura, Viersen).

**Das sind rechtlich verbindliche Texte – NICHT „vollständigkeitshalber" ergänzen.** Ein neues Feature
allein ist **kein** Grund, hier zu schreiben. Anfassen nur, wenn sich **reale Fakten** ändern:
- **Impressum:** neue/geänderte **Betreiberdaten** (Name, Anschrift, Kontakt, Rechtsform, USt-IdNr.,
  Gewerbe/„Diensteanbieter"). → z. B. relevant, wenn die **Gewerbeanmeldung** (Roadmap #3) kommt.
- **Datenschutz:** eine neue Funktion verarbeitet **personenbezogene Daten auf neue Art** oder bindet
  **Dritt-Dienste** ein (z. B. Werbe-/Affiliate-Anbieter, externe Einbettungen, neues Tracking, ein neuer
  Auftragsverarbeiter). Dann den betroffenen Abschnitt anpassen.
  - Beispiel-Auslöser aus dem Code: **Open-Graph-Link-Vorschau** ruft externe Seiten serverseitig ab und
    kann **Vorschaubilder von Fremd-Servern** einbinden; **YouTube-Embeds** laden von Google. Solche
    Dritt-Einbettungen gehören in die Datenschutzerklärung, sobald sie produktiv genutzt werden.
- **Im Zweifel NICHT selbst formulieren, sondern dem User melden** („Das könnte den Datenschutz/das
  Impressum betreffen – bitte rechtlich prüfen/ergänzen"). Lieber einen Hinweis geben als einen
  juristisch falschen Text schreiben. Rechtliche Vollständigkeit ist Sache des Betreibers.

## Abschluss
1. **Build/Verify** wie üblich (lokal Lint/Preview; Prod-Build vor Deploy; Landing/Tour im Preview ansehen).
2. **Deploy** auf den VPS (`cd /root/hoops-v2 && git pull && npm run build && pm2 restart hoops-v2`;
   bei neuer Dependency zusätzlich `npm install`).
3. **`update-feedback-analytics`** (Feedback-Chip + Analytics-Bereich) und **`log-progress`** (AGENTS.md
   Abschnitt 0 + Commit-Hash) mitlaufen lassen.

## Checkliste (knapp)
- [ ] Neuer Nutzen-Baustein? → Feature-Card in `app/page.js` (`features`).
- [ ] Neuer Themenblock? → Plattform-Tour-Slide/-Text in `components/onboarding/WelcomeTour.js` (kurz halten).
- [ ] Sinnvoller nächster Schritt? → `LandingHowItWorks.js` / `LandingHero.js` erwähnen/verlinken.
- [ ] **Eigener Bereich erreichbar?** → Navbar (`Navbar.js`/`PlayerNav.js`) + ggf. Footer verlinkt.
- [ ] Echter Erst-Schritt für Neue? → Onboarding-Checklist (`OnboardingChecklist.js`) – behutsam, ggf. Bonus.
- [ ] **Reale Fakten/Dritt-Dienste geändert?** → Impressum/Datenschutz prüfen; im Zweifel dem User zur
      rechtlichen Prüfung melden statt selbst zu formulieren.
- [ ] Deploy + im Preview verifiziert + in AGENTS.md dokumentiert.
