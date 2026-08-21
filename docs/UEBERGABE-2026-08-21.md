# Übergabe — Hoops Germany, Stand 21.08.2026 abends

> **Für die nächste Sitzung.** `CLAUDE.md` beschreibt, was FERTIG ist.
> Dieses Blatt beschreibt, was GERADE LÄUFT und was Patrick heute entschieden hat.
> Nach dem Einarbeiten gehört es nach `docs/` und der Inhalt in `CLAUDE.md` Abschnitt 0.

## 1. Zustand in einem Blick

| | |
|---|---|
| **Live auf hoopsgermany.de** | `3181ad2` — deployt und live nachgemessen |
| **HEAD auf `redesign`** | `3181ad2` — **deckungsgleich mit live, nichts offen** |
| Branch | `redesign` (nicht `main`) |

⚠️ **Erst am Server nachsehen, dieser Zeile nie glauben:**
```bash
ssh -i ~/.ssh/hoops_vps root@92.113.25.249 "cd /root/hoops-v2 && git log --oneline -1"
git rev-list --count <live>..HEAD
git diff <live>..HEAD --stat -- . ':(exclude)docs' ':(exclude)CLAUDE.md'
```
Die zweite Zeile ist die wichtigere: Eine Zahl allein sagt nicht, ob ein Deploy NÖTIG ist.

## 2. Die letzte Runde ist abgeschlossen — nichts hängt

Beide Gates auf `6348625` sind durch (**beide freigabefähig**), Kais Wächter ist übernommen,
alles ist deployt und live nachgemessen. **Es läuft nichts mehr im Hintergrund.**

**Was zuletzt gebaut wurde** (Viviens Nacharbeit an Tobias' zwei Auflagen, plus Kais Wächter):

1. **Dreipunktlinie über dem Hero-Text bleibt**, der falsche Kommentar geht. Gemessen
   1,61–1,85 : 1 Linie zu Fläche — unter der 2:1-Grenze, ab der sich ein Strich hier als
   Zeichnung liest. **Ein Tonwert, kein Strich.** Tobias hat es angesehen und trägt es mit:
   *„Bei natürlicher Größe wirkt der Bogen wie ein Feld, das hinter der Schrift weiterläuft."*
   ⚠️ **Seine Präzisierung, die im Code noch fehlt:** Die Angabe 1,61–1,85 deckt nicht das
   Hellste ab. In der ERSTEN Überschriftzeile kreuzt die **nahe** Gruppe mit bis zu
   **2,16 : 1 auf 1920 px** — über der Grenze, mit der der Absatz argumentiert. Am Bild ändert
   es nichts (senkrechte Zonenlinien an den Zeilenenden). → Roadmap 34 (b), Vivien.
2. **Hero-Schnitt gelöst** (Roadmap 30 e): Fläche `[data-hero-naht]`, ausgeblendet wird in den
   **letzten 7 rem der Bühne**, nicht in Feldtiefe. Tobias' Messung gegen die Live-Fassung:
   Kontrast der hellsten Spur an der Naht **1,19–1,83 vorher → 1,01–1,02 nachher**, auf neun
   Breiten bis 2560 px. Der auf 1920 durchgeschnittene Bogenscheitel ist behoben.
   ⚠️ Die Zahl, mit der er als unlösbar galt („y ≈ 533"), war die Unterkante des
   ZEICHNUNGSKASTENS, nicht der Bühne (649,8) — der Fehler stammte aus meinem Auftrag.
3. **Wächter `hero-feld-auslauf.spec.mjs`** (12 Fälle, Kai).

**⚠️ Der wichtigste Methodik-Befund der Runde, und es war mein Prüfmaß:** Der übergebene
Vorschlag *„an der Naht endet kein Pfad mit sichtbarer Deckkraft"* trug **zweimal nicht**.
Erstens ist er für genau diesen Defekt **blind** — die neue Fläche liegt ÜBER der Zeichnung und
ändert an ihr keine Deckkraft; ein solcher Test wäre grün über dem Fehler, den er bewachen soll.
Zweitens ist eine feste Kontrast-Schwelle **unmöglich**: Der ausgelieferte Wert auf 1280 (1,180)
liegt ÜBER dem Defektwert auf 900 (1,178). Kai misst stattdessen den **Abfall derselben Linie
über die letzten 120 px**, in der Währung des jeweiligen Fensters — ausgeliefert 92,7–97,7 %,
im Defekt 6,3–12,7 %. Fünf Gegenproben an der Quelle; mit entferntem Element **12 von 12 rot**,
während die alte Suite bei 300 grün blieb, also **komplett blind** war.

**Zwei Doku-Befunde von Kai, beide offen** (kein Produktfehler): Die Abstandszahlen zum
Bogenscheitel in `HeroStage.js` sind durchgehend **142 px zu groß**; und die Begründung „rund
40 % Kontrastabfall" in `HeroCourt.js` reproduziert sich auf 1024/1100 nicht — der Strich ist
dort schmaler als ein Bildpunkt. Die tragende Aussage bleibt in beiden Fällen richtig.

## 3. Patricks Entscheidungen von heute, die noch NICHT in `CLAUDE.md` stehen

**(a) Google-Login auf Prod echt durchgespielt — der Punkt ist erledigt.**
Vier Ergebnisse, von Patrick selbst geklickt (ich kann keine Zugangsdaten eingeben):
1. Normale Google-Anmeldung: **funktioniert**. Kein neues Konto angelegt, das bestehende wurde
   korrekt erkannt (nachgemessen: 5 Konten mit `googleId` auf Prod, 0 neu).
2. **Flyer-Weg** `?next=/team/create&src=flyer-test`: **funktioniert**, landet in der
   Onboarding-Tour. Das war der Weg, den weder Kai noch Tobias je durchspielen konnten.
3. **Altersabfrage kommt VOR der Google-Weiterleitung** — die Selbstauskunft ist nicht umgehbar.
4. Mit bestehendem Konto landet er auf `/team/admin` statt `/team/create`. **Kein Fehler:**
   `app/team/create/page.js:33` leitet Team-Admins weiter, damit niemand versehentlich einen
   Zweitverein gründet. Tobias ist über dieselbe Stelle gestolpert.
   ⚠️ **BEANTWORTET (Patrick): „es gab keinen wirklichen Hinweis" — die Weiterleitung ist
   STUMM.** Damit ist es ein Befund → **Roadmap 35**. Der Hinweis war gebaut und steht seit dem
   15.08. als erledigt in CLAUDE.md; er greift also nicht mehr oder nicht auf diesem Weg.
   **Erst nachsehen, ob er existiert, bevor er neu gebaut wird.**

**Zusätzlich von mir live geprüft (nur lesend, Prod):** Die Weiterleitungs-Absicherung greift auch
im Google-Weg — das Ziel landet im Cookie `g_oauth_next`, und `https://evil.com`, `//evil.com`,
`/\evil.com`, `javascript:` werden **verworfen**, während `/team/create` und
`/spieler?q=max mustermann` durchkommen. **Damit sind drei der fünf Stellen aus der
Weiterleitungs-Absicherung erstmals live belegt.**

**(b) Beispieldaten bleiben — Entscheidung Patrick.**
> „Die Test User sollen eine lebendige und laufende Website sehen. Deshalb erstmal die Testdaten
> behalten." · „Likes und Kommentare nicht auf Null setzen. Die Tester sollen die Funktion auch
> sehen."

⚠️ **Roadmap 2 ist damit NICHT erledigt, sondern vertagt** („erstmal"). Der Purge bleibt für den
Cutover stehen. Die offene Abwägung, einmal genannt und von Patrick abgelehnt: 4.073 Seed-Likes
(höchster Einzelwert 40) gegen 16 echte auf 15 Beiträgen — der Testphase-Banner deckt *Inhalte*
ab, nicht *Zustimmungszahlen*. Ein Vorschlag „Zahlen plausibel machen statt löschen" (2–6 statt
40) liegt unbeantwortet; **nicht erneut vorlegen**, außer Patrick fragt.

**(c) Assist statt Wurf** — steht bereits in `CLAUDE.md` und `docs/CHRONIK.md`.

## 4. Offen vor den Flyern (Patricks eigene Reihenfolge: erst perfektionieren, dann drucken)

1. ~~Google-Login~~ ✅ erledigt, s. o.
2. **Die verlorene Leseposition** (Roadmap 31) — der einzige echte Produktfehler. Von Kai UND
   Tobias unabhängig reproduziert: von ganz unten auf `/signup` und zurück landet man 571–624 px
   zu hoch, auf `/spieler` 673–2.581 px. `history.scrollRestoration = "auto"`.
3. **Analytics bricht ab einer Datenmenge ab** (Roadmap 26). Live 3.474 Einträge → läuft; Dev-DB
   63.859 → kippt. ⚠️ `allowDiskUse` hilft **nachweislich nicht**, es braucht einen Umbau von
   `lib/analyticsSummary.js` (zweite `$setWindowFields`-Stufe). Nebenwirkung: Die Testsuite
   vergiftet sich selbst, jeder Lauf legt ~1.600 Einträge nach.
4. Kleinere: Roadmap 32, 33, 34 — alle mit Zuständigkeit versehen.

## 5. Regeln, die heute mehrfach etwas gerettet haben

- ⚠️ **Ansehen und Messen fangen verschiedene Fehlerklassen.** Drei Befunde heute kamen nur vom
  Blick aufs vergrößerte Standbild, nicht aus einer Zahl.
- ⚠️ **Richtig gemessen, in der falschen Einheit** — heute dreimal: meine Logo-Messung (Faktor
  1,76), Viviens zwei Kontrast-Sonden, Tobias' Hüllbox statt Kontur.
- ⚠️ **Eine Lücke aufzuschreiben ist keine Absicherung.** In `BallPass.js` stand wörtlich, dass
  ein zurückgebauter Befund keinen Test rot macht — genau das trat ein.
- ⚠️ **Die Lehre steht im Kommentar und nicht in der Testmatrix.** Der Text sagte dreimal
  „Breiten geprüft, Ausfall an der Höhe" — die Matrix hörte bei 1024 px Höhe auf.
- ⚠️ **Wer ein Gate startet, arbeitet bis zu dessen Ende nicht im selben Baum.** Ich habe heute
  Doku committet, während Vivien an denselben Punkten arbeitete — die Doku führte zwei Punkte
  als *offen*, während sie entschieden wurden. „Sie Code, ich Doku" reicht als Trennung **nicht**.
- ⚠️ `npm run design-audit -- --check` (mit den zwei Strichen). Die Form ohne sie reicht das Flag
  nicht durch und **prüft gar nichts**.
- Vor jedem Build `sh scripts/port-frei.sh`. Die Suite prüft seit `07150cf` die ausgelieferte
  Fassung; `E2E_MODUS=dev` zerstört den Production-Build.
- Sollstand der Suite: **300 grün / 5 rot / 1 übersprungen**. Die 5 sind Roadmap 26, namentlich
  3× `analytics-ehrlichkeit`, 2× `sponsor-report`.

## 6. Was ich NICHT tun kann

Zugangsdaten eingeben — Google-Anmeldung, Passwörter, Bezahldaten. Der letzte Schritt solcher
Prüfungen gehört immer Patrick; ich bereite ihn vor und werte aus.
