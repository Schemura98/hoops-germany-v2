# Wiederaufnahme – Stand 12.08.2026, abends

Einstiegspunkt nach einem Kontext-Neustart. Ersetzt die Mittagsfassung.

---

## 1. Live-Stand

**Live auf hoopsgermany.de: `a8e4fd4`** (Branch `redesign`, PM2 `hoops-v2`).
Lokal, `origin/redesign` und der VPS stehen auf demselben Commit – nichts hängt.

**Rollback: `562c629`** (Stand VOR dem gesamten Redesign) – auf dem VPS auschecken,
`npm run build`, `pm2 restart hoops-v2`.

⚠️ **`main` bleibt bewusst stehen** („Baseline: funktionierender v2-Neubau vor Design-Restyling").
Der Unterschied `redesign` ↔ `main` ist rund +43.775/−3.579 Zeilen – **das ist kein offener Posten.**
Ein PR nach `main` würde den Wiederherstellungspunkt auflösen; der Deploy läuft direkt von `redesign`.

## 2. Was heute live gegangen ist

Redesign „Anzeigetafel" auf **Navy** (`navy-950 #0B1220`, Akzent = echtes Logo-Orange `#F07A27`,
Big Shoulders + Geist + Geist Mono, Icons Phosphor), dazu die Wow-Ebene:

- **Taktiktafel im Hero**, die sich beim Scrollen zeichnet (`PlayDiagram.js`, SVG, keine Bilddaten)
- **Ballreise (A10):** Ball setzt an der Hero-Schaltfläche auf und reitet die Fortschrittsleiste
  der Feature-Strecke mit, bis er am Ende im Korb landet
- **Bildsequenz „Sprungball"** (45 Bilder, 191 KB, lädt erst beim Scrollen) im Abschluss-Abschnitt
- **A1** überbreite Überschrift, **A5** Kapitelmarken, Splitflap, Fokus-Sprung, Seitenwechsel
- **Belegbarkeit im Text:** „bestätigt vom Gegner, nicht nur von dir eingetragen",
  „deine Werte, bestätigt statt behauptet", und auf dem Profil
  „Zählt erst, wenn beide Teams das Ergebnis eintragen und es übereinstimmt."
- **„Was aus Feedback schon wurde"** auf `/feedback` – vier belegte Beispiele

## 3. Woran gerade gearbeitet wird

**Vivien: Einbauversuch mit Platzhalter-Bildern.**
Pflicht-Startpunkte: `docs/PLATZHALTER-BILDER-2026-08-12.md` und die `AUSWAHL.md` im dort
genannten Ordner (`…\Hoops-Marketing\_werkzeuge\stock-kandidaten\`, 14 Bilder in `auswahl\`).

⚠️ **Platzhalter, keine Designentscheidung.** Die entschiedene Richtung bleibt
„kein Foto, Vektor" (`dec-hoops-material-richtung`, Option 1). Der Versuch dient der Anschauung
für Jonatan. Wer eine Ansicht zeigt, sagt dazu, dass es Platzhalter sind.

## 4. Offen – Entscheidungen bei Patrick

- **Drucksachen:** freigegeben (`EMPFEHLUNG.md` §9), aber **nicht druckbereit**. Es fehlen
  Patricks **Vergleichsdruck von Hand** (Vivien hat ihn auf Pflicht gesetzt: Navy liegt bei
  ~197 % Farbauftrag) und ein **QR-Scan-Test** (Frieda hatte kein Gerät).
  Alte Fassungen liegen als `*-ALT.pdf` daneben – Archivierung wartet auf sein Ok.
- **Karriere-Zahlen:** `careerstats` filtert nur `status: "completed"`, **nicht** auf beidseitiges
  `submittedBy`. Bewusst so gelassen; der Satz auf dem Profil ist deshalb als **Systemregel**
  formuliert, nicht als Gütesiegel. Wer das verschärfen will, ändert die Zahlen aller Spieler.
- **`components/ui/Card.js`:** 0 Importe, `cardClass` 0 Verwendungen, **126 handgebaute Panels**.
  Größter offener Konsistenz-Posten; Umbau bewusst zurückgestellt.

## 5. Werkzeuge, die es gibt (nicht neu bauen)

Alle in `tmp/`, alle gegen `BASE` konfigurierbar (Standard localhost, für live
`BASE=https://hoopsgermany.de` setzen):

| Skript | prüft |
|---|---|
| `kontrast-check.mjs` | WCAG auf 17 Seiten, **zwei Breiten**, bricht ab wenn die Stile fehlen |
| `fps-check.mjs` | Bildrate bei 4×-Drosselung, **mit Gegenprobe** ob die Drosselung greift |
| `navigation-check.mjs` | 10 Wege inkl. Zurück-Taste und Strg-Klick |
| `mobil-tastatur-check.mjs` | mobil, Enter, Mittelklick |
| `swish-check.mjs`, `ballreise-check.mjs`, `a1-check.mjs` | die einzelnen Wow-Bausteine |
| `texte-check.mjs`, `fab-ueberdeckung.mjs` | Texte live, Überdeckung durch den Feedback-Knopf |
| `schriften-pruefen.mjs` | eingebettete Schriften in einem PDF (findet Fremdschriften) |
| `live-abnahme-redesign.mjs` | Abnahme gegen die echte Seite |

## 6. Lehren, die heute Geld gekostet haben

1. **Nicht rechnen, nachmessen.** Der SVG-Maßstab kostete drei Anläufe; `tmp/play-messen.mjs`
   klärte es in einer Minute.
2. **Ein Statusfeld ist kein Beleg**, solange nicht geprüft ist, *wer* es setzen kann
   („Von beiden Teams bestätigt" hätte auf admin-gesetzten Spielen gelogen).
3. **Scroll-Effekte am Seitenende** müssen auf den *erreichbaren* Scrollstand gedeckelt werden –
   die Sequenz kam sonst nie über Bild 24 von 45 hinaus.
4. **Werkzeuge, die im Fehlerfall weiterlaufen, sind gefährlicher als solche, die abbrechen.**
   Die `watch`-Skill druckte Bildlisten ohne Bilder; der Kontrast-Durchlauf meldete 152
   Fehlalarme, weil die Stile nicht geladen waren. Beide haben jetzt Abbruchbedingungen.
5. **Nie zwei Agenten gleichzeitig in den Browser.** Hat einen Prüfdurchlauf zerstört.
6. **Tobias' Klick-Werkzeug fällt regelmäßig aus.** Er meldet es sauber als „ungeklärt" –
   die Lücken mit Playwright nachziehen, nicht ihm anlasten.
