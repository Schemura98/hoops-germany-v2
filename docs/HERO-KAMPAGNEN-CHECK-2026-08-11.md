# Hero-Kampagnen-Check — Marketing-Sicht auf Viviens Scroll-Konzept

Auftrag von Patrick, 11.08.2026. Erstellt von Nele (marketing-manager). Grundlage:
`docs/HERO-KONZEPT-2026-08-11.md` (Vivien, „Sprungball"), `components/landing/LandingHero.js`
(Ist-Stand), `docs/BEDARFSANALYSE-2026-08-09.md` (Mats), Tester-Kampagnen-Material
(`Desktop\Hoops-Marketing\Tester-Akquise\EMPFEHLUNG.md`, `flyer-a6.html`, `MARKE.md`).

**Status: reine Analyse + Textvorschläge, kein Code geändert.** Vivien hat bewusst keinen
Wortlaut angefasst — genau das ist die Lücke, die dieser Check schließt. Vier Fragen, wie
von Patrick beauftragt.

---

## Wichtige Vorab-Feststellung: Der Kampagnen-QR umgeht den Hero

`qr-signup-flyer.svg` und `qr-signup-karte.svg` zeigen direkt auf
`hoopsgermany.de/signup?src=flyer` bzw. `?src=karte` (`app/signup/page.js` puffert den
`src`-Parameter). **Ein Tester, der in der Halle scannt, sieht den Hero gar nicht** — er
landet direkt auf der Registrierung. Das ändert die Gewichtung der vier Fragen unten, hebt
sie aber nicht auf: Die Hero-Sektion bleibt relevant für organischen Traffic, Mundpropaganda
("schau mal, hoopsgermany.de"), Rückkehr-Besuche und jeden, der die URL manuell eintippt statt
zu scannen — nach Neles Erfahrung der zweitwichtigste Kanal neben dem QR selbst. Ich merke das
hier an, weil es die Dringlichkeit von Frage 3 (Mobile-Animation) relativiert und die von
Frage 2 (Botschaft) nicht schmälert.

---

## 1. Primärer CTA: „Als Spieler registrieren" bleibt richtig — kein Wechsel zu „Team gründen"

**Befund: Die heutige Reihenfolge ist korrekt.** Ich empfehle ausdrücklich **keinen Wechsel**.

**Belege:**
- **Das Kampagnenmaterial selbst fragt nirgends nach einer Team-Gründung.** Flyer und
  Visitenkarte sprechen ausschließlich die individuelle Tester-Rolle an: „Deine Liga. Dein
  Profil. Deine Stats.", „Kostenlos registrieren – dauert zwei Minuten", QR zeigt auf
  `/signup`, nicht auf `/team/register`. Würde die Startseite auf „Team gründen" umschwenken,
  entstünde ein Bruch zwischen dem, was der Flyer verspricht, und dem, was die Website zuerst
  verlangt.
- **Bedarfsanalyse, Bedarf 1 (Priorität HOCH):** „Eigene Stats & eigenes Profil, kostenlos und
  ohne Frust" ist der belegte Haupt-Hook für genau die Zielgruppe, die Johnny in der Halle
  anspricht (Liga-Spieler). Das ist ein Spieler-Bedürfnis, kein Team-Verwaltungs-Bedürfnis.
- **Bedarfsanalyse, Bedarf 4:** Team-Admin-Arbeit ist als „Ausschlusskriterium, nicht als
  Feature" eingestuft — Ehrenamts-Mangel ist das strukturelle Dauerthema der Szene. Ein Team zu
  gründen bedeutet, Admin einer laufenden Kader-/Ergebnispflege zu werden. Das einem Spieler
  3 Sekunden nach dem Abpfiff als ersten Klick anzubieten, ist eine deutlich höhere
  Verpflichtungsschwelle als „registrier dich" — und widerspricht der in Bedarf 4 belegten
  Reibungs-Vermeidung.
- **Produktlogik:** Ein Team allein zu gründen erzeugt noch kein „echtes Team" — dafür braucht
  es Mitspieler, die eingeladen werden. Das Milestone-Ziel „erste echte Teams bis ~10.09."
  entsteht als Folge genügend registrierter, aktiver Spieler (die dann selbst ihr Team
  anlegen oder von einem bestehenden Team-Admin eingeladen werden), nicht dadurch, dass ein
  einzelner Hallenkontakt sofort zum Team-Gründer gemacht wird.
- **Sekundärposition ist richtig gesetzt:** „Team gründen" bleibt als zweiter Button sinnvoll
  für die kleinere, aber reale Gruppe, die bereits mit einem Team im Kopf kommt (z. B. ein
  Mannschaftskapitän). Das rechtfertigt die Sichtbarkeit, aber nicht die Priorität.

**Annahme, die ich nicht validieren kann:** Ob Johnny in der Praxis tatsächlich öfter auf
bestehende Mannschaften trifft als auf Einzelspieler ohne Team, ist aus den vorliegenden
Dokumenten nicht belegt — reine Beobachtung aus der Halle. Falls sich das in den ersten
Turnieren anders zeigt, wäre das ein Fall für Ronjas Retention-Prüfung (H4/H5), nicht für eine
vorab geänderte Hero-Priorität.

---

## 2. Botschafts-Konsistenz Flyer ↔ Hero: **MUSS-Fix vor Deploy** — Geo-Scope-Überclaim

**Befund: Der Hero hat denselben Fehlerklassen-Fund wie der Flyer vor der Korrektur vom
10.08. — nur wurde er dort behoben und hier noch nicht.**

Mats/Nora haben am 10.08. auf dem Flyer korrigiert: „57+ echte NRW-Ligen sind schon drin"
→ „57 NRW-Ligen im Katalog … Und deine Kreisliga? Trag dein Team als Erster ein." (Pionier-
statt Bestandsbehauptung), weil 56 von 57 Ligen zum Prüfzeitpunkt null Teams hatten.

Der Hero trägt denselben Bestandsbehauptungs-Fehler, nur geografisch statt zahlenmäßig:

```
Badge:    „Amateur-Basketball in Deutschland"
Headline: „Deine Basketball- Community in Deutschland"
Subline:  „Finde Spieler, tritt Vereinen bei und verfolge Ligen in deiner Region."
```

- **Die Plattform ist heute NRW-only.** Der offizielle Liga-Katalog enthält ausschließlich
  NRW-Ligen; die Bedarfsanalyse ist explizit als „Amateur-Basketball-Community NRW" betitelt;
  CLAUDE.md führt „Bundesweite Expansion / seed-world" ausdrücklich unter „wird NICHT
  gebraucht" auf („kein Nachfrage-Beleg außerhalb NRW"). „Deutschland" ist der Markenname
  („Hoops Germany"), aber als Scope-Aussage im Fließtext ist es zum jetzigen Zeitpunkt nicht
  gedeckt.
- **Frisch verifiziert (11.08.2026, live gegen `GET /api/leagues?scope=all`):** 63 offizielle
  Ligen für 2025/26 (nicht mehr 57 — die Zahl wächst, wie `MARKE.md` Abschnitt 8 selbst warnt),
  davon **nur 5 mit mindestens einem echten Team**. *Hinweis zur Beleglage: Diese Zählung
  stammt aus einem automatisierten WebFetch-Abruf mit einem Hilfsmodell zur Zusammenfassung,
  keine manuelle Rohdaten-Prüfung — die Größenordnung (deutliche Unter-10-%-Füllquote) ist
  aber robust genug, um den Befund zu tragen.* Eine „Community in Deutschland" zu behaupten,
  während faktisch fünf Ligen in einem Bundesland Teams haben, ist dieselbe Art Überdehnung,
  die beim Flyer korrigiert wurde — nur eine Ebene höher (nicht „wie viele Ligen", sondern
  „wie groß und wo").
- **Die Subline** („verfolge Ligen in deiner Region … Die Plattform für Amateur-Basketball –
  von Spielern, für Spieler") ist dagegen unkritisch: Sie nennt keine überprüfbare Zahl oder
  Vollständigkeitsbehauptung, „in deiner Region" ist vage genug, um nicht falsch zu sein. Hier
  sehe ich **keinen Änderungsbedarf**.

**Textvorschlag (minimal-invasiv, layoutneutral — reiner Wortersatz, keine Strukturänderung,
kollidiert nicht mit Viviens Scroll-Choreografie):**

```diff
- Amateur-Basketball in Deutschland
+ Amateur-Basketball in NRW

- Deine Basketball-
- Community
- in Deutschland
+ Deine Basketball-
+ Community
+ in NRW
```

Begründung für „NRW" statt einer anderen Pionier-Formulierung: gleiche Silbenzahl/Layoutbreite
wie „Deutschland", also keine Rücksprache mit Vivien nötig, und es ist exakt das, was die
Plattform heute belegbar ist — keine Untertreibung, keine Übertreibung. Wortstamm „Community"
bleibt stehen (Selbstbeschreibung als Bewegung ist vertretbar, „in Deutschland" war das
Problem, nicht „Community").

**§5 UWG-Einordnung:** Das ist ein Grenzfall, kein eindeutiger Rechtsverstoß (Markenname vs.
Fließtext-Scope-Aussage ist auslegbar) — aber strukturell identisch zu dem Fund, den Nora beim
Flyer bereits (N2) qualifiziert hat. **Übergabe an Nora (recht-vorpruefung) empfohlen**, bevor
Patrick den Text final freigibt — nicht weil ich Zweifel an der Reformulierung habe, sondern
weil dieselbe Prüfinstanz, die den Präzedenzfall entschieden hat, für Konsistenz sorgen sollte.

---

## 3. Mobile-Animation: klare Empfehlung — Viviens reduzierter Ansatz ist richtig

**Empfehlung: Zeit bis zur Registrierung schlägt Wow-Effekt. Viviens Entscheidung (kein Pin,
kein Ball-Flug, nur dezenter Tint + ein Linienbogen + CTA-Puls auf Mobile) ist aus
Kampagnensicht korrekt — keine Nachbesserung nötig.**

Begründung, keine Abwägungsliste:
- Die Kernzielgruppe der Kampagne kommt „aufs Handy" — aber wie oben festgestellt, **umgeht der
  QR-Weg den Hero komplett** (direkt zu `/signup`). Das Hero-Erlebnis auf Mobile trifft also gar
  nicht die Mehrheit der Tester im entscheidenden Moment, sondern eher Zufalls-/Rückkehr-
  Besucher, die selbst navigieren. Für diese Gruppe gilt dieselbe Logik wie für Scan-Besucher:
  „schnell verstehen, schnell zum Ziel" schlägt Inszenierung, weil niemand auf dem Handy in der
  Halle Zeit für eine 140vh-Scroll-Sequenz hat.
- Deckt sich mit Bedarf 4 (Reibung minimieren) und mit dem Ton des Flyers selbst („dauert zwei
  Minuten", keine Umwege).
- Der Ball-Flug/Pin bleibt damit ein **Desktop-/Präsentations-Moment** — das ist für die
  Kampagne kein Verlust, weil Johnny den Leuten in der Halle sowieso das Handy zeigt, nicht den
  Laptop.

Keine Änderung an Viviens Konzept notwendig aus Marketing-Sicht.

---

## 4. Zweitkontakt (eingeloggte Hero-Variante): Feedback-CTA ist zu weit hinten priorisiert

**Befund (kurz, weil belegbar):** Die Kampagne definiert ihre eigene Erfolgskennzahl selbst —
`EMPFEHLUNG.md` Abschnitt 3: *„Ziel-Kennzahl der Kampagne: nicht ‚verteilte Flyer', sondern
Feedback-gebende Tester pro Turnier."* Im eingeloggten Hero (`LandingHero.js`, Zeilen 88–113)
ist „Feedback" aber der fünfte von fünf Buttons, unten rechts, als Ghost-Button — während „Zum
Feed" den einzigen primären (orangenen) Platz belegt.

Für einen Tester, der nach der Registrierung zum zweiten/dritten Mal zurückkommt, ist der
wichtigste Hero-Klick aus Kampagnensicht nicht der Feed, sondern die Feedback-Abgabe — genau
das, was Johnny bei jedem Turnier abfragen wird und was laut eigener Definition den Erfolg der
Testphase misst.

**Empfehlung:** „Feedback" in der oberen Reihe platzieren (z. B. Tausch mit „Teams"/„Mein
Team", das für einen frischen Tester ohnehin oft noch leer ist), nicht zwingend als primären
Orange-Button — ein dauerhaft aufdringlicher Feedback-Call bei jedem Besuch wäre grenzwertig
Richtung Nerv-Muster. Eine Positions-Aufwertung reicht. Das ist **kein Deploy-Blocker** für die
Scroll-Animation, sollte aber vor dem ersten Turnier-Feedback-Zyklus (~17.08. laut
Tester-Kampagne-Zeitplan) umgesetzt sein, nicht erst danach.

---

## Kollegen einbezogen

- **Nora (recht-vorpruefung) — Übergabe empfohlen, noch nicht ausgeführt:** Befund 2
  (Geo-Scope „Deutschland"/„NRW") ist ein §5-UWG-Grenzfall mit direktem Präzedenzfall (N2 vom
  10.08. auf dem Flyer). Sie sollte den Textvorschlag vor Patricks Freigabe gegenlesen.
- **Lina Vogt (Onboarding) — Review empfohlen, noch nicht angefordert:** Der Hero ist laut ihrer
  eigenen Skill-Definition (`update-onboarding-surfaces`) eine der Flächen, die zu dem passen
  müssen, was Neulinge nach der Registrierung erleben (Willkommens-Tour, Onboarding-Checklist,
  „So funktioniert's"). Sobald der NRW-Textvorschlag steht, sollte sie kurz gegenlesen, ob die
  Pionier-Framing-Sprache („noch im Aufbau") konsistent zu dem ist, was neue Nutzer nach dem
  Signup sehen — bisher nicht angestoßen, da der Wortlaut hier erst zur Freigabe ansteht.
- **Ben Adeyemi (Analytics) — nur als Hinweis, kein Auftrag:** Die drei ausgeloggten Hero-Buttons
  selbst sind aktuell nicht einzeln getrackt (nur `?src=` auf `/signup` von Flyer/Karte). Wenn
  Patrick später wissen will, ob die CTA-Reihenfolge tatsächlich wirkt (nicht nur plausibel
  ist), bräuchte es ein eigenes Klick-Tracking auf die Hero-Buttons — das ist ein optionaler
  Ausbau, keine Voraussetzung für diesen Check.
- **Vivien:** kein erneuter Auftrag nötig — ihr Konzept ändert sich durch diesen Check nicht,
  nur der Wortlaut in ihrem unverändert gelassenen „content"-Slot bekommt zwei Wort-Ersetzungen.

---

## Priorisierung

**MUSS vor Deploy:**
1. Hero-Text „Deutschland" → „NRW" (Badge + Headline, 2 Stellen) — nach Noras Kurz-Review.

**SOLLTE vor dem ersten Turnier-Feedback-Zyklus (nicht Blocker für die Animation selbst):**
2. Feedback-Button in der eingeloggten Hero-Variante nach oben/prominenter positionieren.

**Bestätigt, keine Änderung nötig:**
3. Primärer CTA „Als Spieler registrieren" bleibt erste Wahl — kein Wechsel zu „Team gründen".
4. Mobile-reduzierte Animation (Viviens Ansatz) ist aus Kampagnensicht richtig priorisiert.

**Optional / außerhalb dieses Auftrags:**
- Eigenes Klick-Tracking auf Hero-CTAs (Ben).
- Lina-Review der Pionier-Framing-Konsistenz Hero ↔ Onboarding.

---

## Annahmen, klar gekennzeichnet

- Dass Mundpropaganda/Direktaufruf der URL ein relevanter Sekundärkanal neben dem QR ist, ist
  Erfahrungswissen, nicht durch Analytics belegt (kein Traffic-Split zwischen `/signup`-Direkt-
  Ankünften mit `?src=` und Hero-Ankünften ausgewertet — dafür wäre Bens Hinweis oben die
  Voraussetzung).
- Die 63/5-Liga-Zählung vom 11.08. ist ein automatisierter Abruf mit Modell-Zusammenfassung,
  keine manuell verifizierte Rohdatenzählung — Größenordnung glaubwürdig, exakte Zahl vor
  erneuter Verwendung in Marketingmaterial gegenprüfen (wie `MARKE.md` ohnehin vorschreibt).
- Dass Team-Gründer in der Praxis eher bestehende Mannschaftsverantwortliche als
  Halleneinzelkontakte sind, ist eine plausible, aber unbelegte Annahme (siehe Abschnitt 1).
