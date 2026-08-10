# Recht-Vorprüfung: Geo-Scope-Claim „Deutschland" vs. NRW-only-Plattform

> **Vorprüfung, KEINE Rechtsberatung.** Erstellt von Nora (recht-vorpruefung), 11.08.2026,
> Auftrag Patrick, Übergabe von Nele (marketing-manager) aus `docs/HERO-KAMPAGNEN-CHECK-2026-08-11.md`.
> Alle rechtlichen Einschätzungen unten sind **unverbindliche Annahmen** einer KI, keine
> gesicherte Auskunft. Verbindlich klärt das ein Anwalt. Kein Code geändert, kein Rechtstext
> final formuliert — nur Befund + Formulierungs**vorschläge** zur Entscheidung durch Patrick
> bzw. einen Anwalt.

---

## 1. Sachverhalt (belegt, mit Fundstelle)

**Ist-Zustand der Plattform (Beleg, nicht Annahme):**
- Der offizielle Liga-Katalog enthält ausschließlich NRW-Ligen (`CLAUDE.md` Feature-Stand,
  `docs/league-catalog`-Skill; `docs/BEDARFSANALYSE-2026-08-09.md` ist explizit als
  „Amateur-Basketball-Community **NRW**" betitelt).
- `CLAUDE.md`, Abschnitt „Was NICHT gebraucht wird" (Bedarfsanalyse-Referenz): bundesweite
  Expansion / `seed-world.mjs --prod` ausdrücklich **nicht** umgesetzt, „kein Nachfrage-Beleg
  außerhalb NRW".
- Nele hat am 11.08. live gegen `GET /api/leagues?scope=all` gezählt: 63 offizielle Ligen
  Saison 2025/26, davon 5 mit mindestens einem echten Team (deutliche Unter-10-%-Füllquote;
  Zählung laut Nele automatisiert/nicht manuell verifiziert, Größenordnung aber belastbar).
- **Ergebnis:** Die Plattform ist faktisch NRW-only, mit sehr geringer Teamdichte auch
  innerhalb NRWs. Eine Aussage „Community in Deutschland" ist zum heutigen Stichtag durch
  keinen der genannten Belege gedeckt.

**Wo genau die Aussage „Deutschland" öffentlichkeitswirksam auftaucht** (Datei + Zeile,
geprüft am 11.08.2026 per Volltextsuche im Repo + `Hoops-Marketing`-Ordner):

| # | Fundstelle | Text | Sichtbarkeit / Reichweite |
|---|---|---|---|
| 1 | `components/landing/LandingHero.js:119` | Badge „Amateur-Basketball in Deutschland" | Startseite, jeder ausgeloggte Besucher — höchste Reichweite |
| 2 | `components/landing/LandingHero.js:126` | Headline „Deine Basketball-Community … in Deutschland" | s. o. |
| 3 | `app/layout.js:12` | `metadata.description`: „…Community-Plattform für Amateur-Basketball in Deutschland…" | Wird von Next.js als Fallback für `og:description` verwendet, wenn kein eigenes `openGraph`-Objekt gesetzt ist (hier der Fall, geprüft: `app/layout.js` enthält kein `openGraph`-Feld) → erscheint in Google-Suchergebnis-Snippets **und** in Link-Vorschauen bei WhatsApp/Facebook/etc. Reichweite: außerhalb der eigenen Seite, nicht steuerbar durch spätere Korrektur (Crawler-Cache) |
| 4 | `app/about/page.js:10` | „Hoops Germany ist die Community-Plattform für Amateur-Basketball in Deutschland." | `/about`-Seite, öffentlich, dediziert als Selbstdarstellung |
| 5 | `components/onboarding/WelcomeTour.js:24` | „Deine Community-Plattform für Amateur-Basketball in Deutschland …" | Erster Tour-Schritt, jedem neuen Nutzer nach Registrierung gezeigt |
| 6 | `lib/emailTemplates.js:123` | Willkommensmail: „…vernetzt dich mit der Basketball-Community in ganz Deutschland." | Jede Registrierungs-Mail — geht an jeden neuen Nutzer, dauerhaft dokumentiert (E-Mail-Postfach) |
| 7 | `components/admin/SponsorReportView.js:94` | Sponsoring-Report-Intro: „…Community-Plattform für Amateur-Basketball in Deutschland." | Wird an (potenzielle) **Sponsoren** ausgegeben — externe Geschäftspartner, die eine Reichweiten-/Investitionsentscheidung treffen. Höherer Einzelfall-Impact als die übrigen Endnutzer-Flächen, auch wenn die Stückzahl kleiner ist |

**Geprüft und ohne denselben Fund (zur Vollständigkeit, damit nicht an einer Stelle korrigiert
und woanders übersehen wird):**

| Fläche | Befund |
|---|---|
| `app/manifest.js` (PWA-Manifest) | Kein Geo-Scope-Claim — `description` nennt nur „im Amateur-Basketball", kein „Deutschland". Kein Fix nötig. |
| `app/installieren/page.js` | Kein Geo-Scope-Claim im Text. Kein Fix nötig. |
| `Hoops-Marketing\Tester-Akquise\flyer-a6.html`, `visitenkarte.html`, `qr-*.svg` | Volltextsuche nach „Deutschland": keine Treffer. Material wurde am 10.08. bereits auf NRW-Framing korrigiert (Mats/Nora, N2) und nutzt konsequent „NRW". Kein weiterer Fix nötig. |
| `app/impressum/page.js:16`, `app/datenschutz/page.js:16` | „Deutschland" dort ist Bestandteil der **Geschäftsadresse** (41748 Viersen, Deutschland), keine Reichweiten-Aussage. Nicht Teil dieses Befunds. |
| `app/about/page.js:11` | „…mitten im Herz des deutschen Breitensports." — Grenzfall, siehe Abschnitt 3, unten separat bewertet (keine quantifizierbare Abdeckungsbehauptung, eher Domänenbeschreibung). |
| `README.md:3`, `CLAUDE.md:195`, `AGENTS.md` | Enthalten dieselbe Formulierung, sind aber **interne Entwicklungsdokumentation**, nicht nutzersichtbar/öffentlich einsehbar. Kein UWG-relevanter Publikumskontakt — nur als Konsistenz-Hinweis vermerkt, kein Compliance-Fix. |
| `scripts/seed-*.mjs` (`NAT = ["Deutschland", …]`) | Spieler-**Nationalität** als Demo-Datenfeld, keine Reichweiten-Aussage der Plattform. Nicht Teil dieses Befunds. |

---

## 2. Rechtliche Einordnung (als Annahme, unverbindlich)

**Berührte Norm (Annahme):** § 5 Abs. 1 UWG (Irreführende geschäftliche Handlungen), ggf. i. V. m.
§ 5 Abs. 1 S. 2 Nr. 1 UWG (Angaben über wesentliche Merkmale der Dienstleistung, u. a.
Verfügbarkeit/Beschaffenheit). Angrenzend denkbar, aber hier nicht vertieft geprüft: § 3a UWG
(Rechtsbruch), verbraucherschutzrechtliche Informationspflichten. **Quelle dieser Einschätzung:**
eigene Einordnung von Nora, gestützt auf die Struktursystematik des Skills
`legal:legal-risk-assessment` (US-geprägte Vorlage — nur die Severity×Likelihood-Systematik
übernommen, keine materiell-rechtliche US-Aussage auf den deutschen Sachverhalt übertragen).
Datum der Einordnung: 11.08.2026. **Keine Rechtsprechung/Kommentarliteratur geprüft — das
müsste ein Anwalt tun.**

**Zwei offene Vorfragen, die ein Anwalt klären müsste, bevor sich die Norm überhaupt sicher
bejahen lässt:**

1. **„Geschäftliche Handlung" (§ 2 Abs. 1 Nr. 2 UWG) trotz fehlender Gewerbeanmeldung?**
   Patrick hat laut `CLAUDE.md` (Roadmap-Punkt 3) noch keine Gewerbeanmeldung; Monetarisierung
   ist ausdrücklich „BLOCKIERT bis Gewerbeanmeldung". Das spricht dafür, dass die Testphase
   heute nicht kommerziell betrieben wird. Dagegen spricht: Die Plattform baut aktiv eine
   Nutzerbasis für eine **bereits geplante** spätere Monetarisierung auf (Affiliate, Sponsoring,
   AdSense — alles vorbereitet, nur zeitlich verschoben). Ob das ausreicht, um schon jetzt eine
   „geschäftliche Handlung zugunsten des eigenen Unternehmens" zu begründen, ist eine
   Rechtsfrage, die von der konkreten Auslegung der „Unternehmer"-Eigenschaft (§ 2 Abs. 1 Nr. 6
   UWG) abhängt — **das kann ich nicht verbindlich beantworten.**
2. **Wer wäre aktivlegitimiert (§ 8 Abs. 3 UWG)?** Ein Abmahnrisiko setzt einen tatsächlichen
   Mitbewerber oder klagebefugten Verband voraus, der die Aussage angreift. Für eine
   Nischen-Community-Plattform in der Testphase ist mir kein konkreter Wettbewerber bekannt,
   der aktuell beobachtet oder abmahnt — das ist aber eine Tatsachenfrage, keine, die ich mit
   Sicherheit verneinen kann.

**Schwere-Einordnung (angelehnt an die Severity×Likelihood-Systematik, NICHT die Skala selbst
aus dem US-Template übernommen als Rechtsaussage — nur als Strukturhilfe):**

- **Schwere, wenn es eintritt:** eher **moderat** — im wahrscheinlichsten Szenario eine
  Abmahnung mit Unterlassungserklärung + Kostenerstattungsforderung (typischerweise ein
  vierstelliger Betrag bei einem einfachen Fall), kein Szenario mit Bestandsgefährdung des
  Projekts. Reputationsschaden innerhalb der kleinen NRW-Basketball-Community wäre spürbar,
  aber begrenzt.
- **Eintrittswahrscheinlichkeit:** eher **gering bis möglich** — die Aussage steht direkt neben
  dem Markennamen „Hoops Germany" (auslegbar als Markenbezug statt Scope-Aussage, wie Nele
  bereits notiert hat), es ist keine harte Zahl wie beim Flyer-Fund (N2), und mir ist kein
  aktiver Beobachter/Wettbewerber bekannt. Nicht „remote", weil die Seite dauerhaft live,
  indexiert und öffentlich einsehbar ist (anders als eine begrenzte Druckauflage) — die
  Expositionsfläche ist also kontinuierlich vorhanden, nicht einmalig.
- **Gesamtbild:** **kein akutes Abmahnrisiko, aber ein begründetes Sorgfaltsthema** —
  strukturell identisch zu Noras Flyer-Befund N2 vom 10.08., den Nele zu Recht als
  Präzedenzfall heranzieht. Weder dramatisieren noch verharmlosen: Es ist der gleiche
  Fehlertyp, der bereits einmal korrigiert wurde, nur an mehr Stellen und mit größerer,
  dauerhafter Reichweite (Website + Mail + Sponsoring-Report statt einmaliger Druckauflage).

---

## 3. Neles Formulierungsvorschlag geprüft

**Vorschlag:** „Deutschland" → „NRW" an den zwei Hero-Stellen, layoutneutral, „Community"
bleibt stehen.

**Bewertung:** Der Vorschlag deckt den Sachverhalt — „NRW" ist durch den Liga-Katalog und die
Bedarfsanalyse tatsächlich belegt, während „Deutschland" es nicht ist. Silbenzahl/Layoutbreite
identisch, kein Rücksprachebedarf mit Vivien. Aus meiner Sicht **tragfähig als Minimallösung**
für die zwei Hero-Stellen.

**Alternative, die ich zusätzlich zur Entscheidung stelle (kein Muss, nur Option):** Statt der
reinen Ortsangabe „NRW" könnte an Stellen mit mehr Platz (About-Seite, Willkommensmail,
Sponsoring-Report — dort gibt es keinen Silbenzahl-Zwang wie im Hero) ein **Pionier-Framing**
analog zur Flyer-Korrektur vom 10.08. („57 NRW-Ligen im Katalog … trag dein Team als Erster
ein") stehen, z. B. sinngemäß „Amateur-Basketball in NRW — im Aufbau, von Spielern für
Spieler." Vorteil: konsistent mit dem bereits akzeptierten Flyer-Ton und mit Neles Hinweis,
dass Lina (Onboarding) prüfen sollte, ob die Pionier-Sprache zu dem passt, was Neulinge nach
dem Signup sehen. Das ist ein **Formulierungsvorschlag, keine Empfehlung mit Vorrang** — die
schlichte NRW-Ersetzung ist genauso vertretbar und schneller umsetzbar. **Endabnahme des
Wortlauts liegt bei Patrick bzw. einem Anwalt, nicht bei mir.**

**Für Fundstelle 7 (Sponsoring-Report) zusätzlicher Hinweis:** Weil dieser Text an externe
Geschäftspartner geht, die eine Sponsoring-/Investitionsentscheidung auf Basis der genannten
Reichweite treffen, würde ich hier **besondere Sorgfalt** empfehlen — nicht nur „Deutschland"
→ „NRW" ersetzen, sondern zusätzlich prüfen (lassen), ob der Report an anderer Stelle
Reichweiten-Kennzahlen ohne Geo-Einordnung zeigt, die im Kontext falsch verstanden werden
könnten. Das habe ich nicht vollständig geprüft — reiner Hinweis, kein abgeschlossener Befund.

---

## 4. Entscheidungsvorlage für Patrick

| # | Fundstelle | Einordnung | Begründung (1 Satz) |
|---|---|---|---|
| 1 | `LandingHero.js:119` (Badge) | **MUSS** | Höchste Reichweite (jeder ausgeloggte Besucher), identischer Fehlertyp wie bereits korrigierter Flyer-Fund N2. |
| 2 | `LandingHero.js:126` (Headline) | **MUSS** | Wie 1. |
| 3 | `app/layout.js:12` (Meta-/OG-Description) | **MUSS** | Wird zu Google-Snippet und Link-Vorschau — Reichweite über die eigene Seite hinaus, von Crawlern gecacht, also besonders zeitkritisch. |
| 4 | `app/about/page.js:10` | **MUSS** | Dedizierte Selbstdarstellungsseite; öffentlich, dauerhaft. |
| 5 | `WelcomeTour.js:24` | **SOLLTE** | Nur eingeloggte Neu-Nutzer sehen es (kleinerer, aber schriftlich fixierter Kreis); gleicher Fehlertyp, geringere UWG-Außenwirkung als 1–4. |
| 6 | `emailTemplates.js:123` (Willkommensmail) | **SOLLTE** | Geht an jeden neuen Nutzer und bleibt im Postfach dokumentiert — nicht öffentlich einsehbar wie die Website, aber dauerhaft belegbar. |
| 7 | `SponsorReportView.js:94` | **SOLLTE, mit Zusatzsorgfalt** | Geht an externe Geschäftspartner mit Entscheidungsrelevanz (siehe Abschnitt 3) — kleinere Stückzahl, aber höherer Einzelfall-Impact. |
| 8 | `app/manifest.js`, `app/installieren/page.js` | **Kann bleiben** | Kein Geo-Scope-Claim vorhanden, geprüft. |
| 9 | Marketing-Material (Flyer/Karte/QR) | **Kann bleiben** | Bereits am 10.08. auf NRW-Framing korrigiert, keine „Deutschland"-Treffer mehr. |
| 10 | `app/about/page.js:11` („deutscher Breitensport") | **Kann bleiben (Grenzfall, siehe unten)** | Domänen-/Vibe-Beschreibung ohne quantifizierbare Abdeckungsbehauptung — ähnlich Neles Einschätzung zur Subline. |
| 11 | `README.md`, `CLAUDE.md`, `AGENTS.md` | **Kann bleiben** | Interne Entwicklungsdokumentation, kein Nutzer-/Öffentlichkeitskontakt — reiner Konsistenz-Hinweis, kein Compliance-Fix nötig. |

**Zu Punkt 10 kurz begründet:** „mitten im Herz des deutschen Breitensports" behauptet keine
Abdeckung/Vollständigkeit („wir sind in ganz Deutschland aktiv"), sondern verortet die
Plattform thematisch im bundesweiten Breitensport-Kontext — vergleichbar der Subline-Bewertung
in Neles Check. Vertretbar, aber kein zwingendes „kann bleiben": **wenn Patrick maximale
Konsistenz will**, ließe sich auch das anpassen. Ich stufe es nicht als MUSS ein, weil es keine
überprüfbare Falschbehauptung im Sinne von § 5 UWG ist, sondern eine subjektive Einordnung.

---

## 5. Konkrete Frage an Anwalt (falls Patrick externe Prüfung wünscht)

„Stellt die Aussage ‚Amateur-Basketball-Community in Deutschland' auf einer öffentlich
zugänglichen, aktuell nicht gewerblich angemeldeten, aber auf spätere Monetarisierung
ausgelegten Testphase-Plattform mit tatsächlich nur einem Bundesland abgedeckter Liga-Struktur
eine irreführende geschäftliche Handlung i. S. d. § 5 UWG dar — und ändert der fehlende
Gewerbeanmeldungs-Status daran etwas (Frage der Unternehmereigenschaft nach § 2 Abs. 1 Nr. 6
UWG)?"

**Kostenpunkt (an Ines/Budget zu melden, falls beauftragt):** Eine kurze anwaltliche
Einschätzung zu genau dieser Frage dürfte sich im überschaubaren Rahmen bewegen (Kurzberatung/
Ersteinschätzung); für eine belastbare Aussage sollte trotzdem ein echtes Angebot eingeholt
werden, statt die Anwaltskosten aus Sparsamkeit zu umgehen — insbesondere weil sich die Frage
sehr wahrscheinlich wiederholt, sobald weiteres Werbematerial entsteht.

---

## 6. Kollegen einbezogen

- **Nele (marketing-manager):** Ausgangsbefund und Formulierungsvorschlag stammen von ihr
  (`docs/HERO-KAMPAGNEN-CHECK-2026-08-11.md`); dieser Bericht prüft und erweitert ihn um die
  Rechtsdimension und die weiteren Flächen, wie von ihr selbst als offener Punkt vermerkt.
- **Lina Vogt (update-onboarding-surfaces):** Von Nele bereits als nächster Reviewer
  vorgeschlagen (Konsistenz Pionier-Framing Hero ↔ Onboarding-Checklist/Welcome-Tour), noch
  nicht angefordert — sollte laut Nele erfolgen, sobald der Wortlaut steht. Ich unterstütze
  diese Empfehlung ausdrücklich für Fundstelle 5 (WelcomeTour), da dort direkt ihr
  Zuständigkeitsbereich betroffen ist.
- **Ines (budgetverwalter):** Anwaltskosten für die konkrete Frage in Abschnitt 5 als echter
  Kostenpunkt vermerkt (siehe dort) — nicht als „sparbar" dargestellt.
- **Mats (marktforscher):** nicht neu eingebunden, aber seine/Noras Flyer-Korrektur vom 10.08.
  (N2) ist die tragende Präzedenzfall-Referenz dieses Befunds.

---

## Offene Annahmen, klar gekennzeichnet

- Die 63/5-Liga-Zählung stammt von Nele (11.08., automatisierter Abruf, nicht manuell
  gegengeprüft) — für den hiesigen Befund reicht die Größenordnung, für eine erneute
  Verwendung in Material sollte sie laut `MARKE.md` vor Einsatz neu geprüft werden.
- Ob Next.js `app/layout.js`s `description` tatsächlich 1:1 als `og:description` gerendert
  wird, habe ich anhand des Codes (kein eigenes `openGraph`-Objekt vorhanden) und meines
  Next.js-14-Wissens angenommen, nicht live gegen die Produktionsseite mit einem
  Social-Debugger-Tool verifiziert — vor Umsetzung ggf. kurz gegenprüfen.
- Die rechtliche Schwere-/Wahrscheinlichkeitseinordnung in Abschnitt 2 ist meine eigene
  Anwendung einer US-geprägten Strukturvorlage auf einen deutschen Sachverhalt, ausdrücklich
  keine geprüfte Rechtsauskunft — siehe Kennzeichnung dort.
