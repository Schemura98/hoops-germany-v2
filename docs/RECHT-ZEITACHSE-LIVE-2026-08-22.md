# Rechts- und Behörden-Zeitachse: Testphase → deutschlandweite Live-Schaltung

**Nora (recht-vorpruefung) · 22.08.2026 · Auftrag: Zuarbeit für die Präsentation
Patrick & Jonatan · reine Dokumenten- und Quelltextarbeit, keine DB-Schreibzugriffe**

> ⚠️ **Ich bin ein KI-Agent, keine Anwältin und keine Steuerberaterin. Das hier ist
> keine Rechtsberatung und keine Steuerberatung.** Jede Aussage zur deutschen
> Rechtslage ist eine gekennzeichnete, unverbindliche Annahme. Ich formuliere in
> diesem Befund **keinen** verbindlichen Rechtstext.
>
> **Kennzeichnung durchgängig:**
> **[BELEGT]** = Datei/Zeile im Repo oder externe Quelle mit Abrufdatum ·
> **[ANNAHME]** = meine unverbindliche Einordnung, mit Sicherheitsgrad ·
> **[UNGEPRÜFT]** = Tatsache, die ich nicht verifizieren konnte ·
> **[→ ANWALT]** / **[→ STEUERBERATER]** = gehört zwingend dorthin, nicht zu mir.
>
> **Systematik-Herkunft:** Das Severity×Likelihood-Raster in Abschnitt 9 stammt aus
> der US-geprägten Vorlage `legal:legal-risk-assessment`, die Checklisten-Systematik
> in Abschnitt 3 aus `legal:compliance-check`. Übernommen ist **nur die Systematik**
> (Skala, Score, Eskalationsstufen), **keine** materiell-rechtliche Aussage. Die
> Stufenbezeichnungen GREEN/YELLOW/ORANGE/RED sind Rasterbegriffe dieser Vorlagen,
> keine Aussage über deutsche Rechtslage.
>
> **Vorgänger, die dieser Befund NICHT ersetzt:**
> `docs/RECHT-LEISTUNGSKARTE-2026-08-13.md` (F1-a bis F1-h) ·
> `docs/RECHT-LEISTUNGSKARTE-NACHTRAG-2026-08-13.md` ·
> `docs/RECHT-MINDESTALTER-2026-08-14.md` (F4-a bis F4-c) ·
> `docs/RECHT-HERO-CLAIM-2026-08-11.md` (§ 5 UWG, Geo-Claim).
> Dieser Befund **bündelt** deren offene Fragen und stellt sie auf eine Zeitachse.

---

## 0. Die sechs Sätze, die zählen

1. **Die Vereinsansprache per E-Mail ist der schärfste Punkt der ganzen Liste — und
   „ich schicke die Mails von Hand" hilft rechtlich fast nicht.** § 7 UWG kennt bei
   Werbe-E-Mails keine Bagatellgrenze und keine mutmaßliche Einwilligung, auch nicht
   im Geschäftsverkehr. Eine einzige Mail reicht als Verstoß. Details und die
   entscheidende Ausweichfrage in Abschnitt 6.

2. **Der Postweg ist rechtlich der deutlich einfachere Kanal, und der Abstand ist
   groß.** Die scharfen Verbotstatbestände des § 7 Abs. 2 UWG treffen E-Mail, Telefon,
   Fax und automatische Anrufe — **adressierte Briefwerbung steht dort nicht.**
   Für die Entscheidung „Flyer drucken oder digital" ist das das stärkste Argument
   auf dem Tisch. [ANNAHME, hohe Sicherheit]

3. **Die Gewerbeanmeldung hängt nicht am ersten Euro, sondern an der Absicht.** Der
   Auslöser ist nach meiner Einordnung die *Aufnahme einer auf Dauer angelegten
   Tätigkeit mit Gewinnerzielungsabsicht* — nicht die erste Einnahme. Und das
   Impressum behauptet bereits heute eine Unternehmereigenschaft, die es formal noch
   nicht gibt (§ 19 UStG, Kleinunternehmerregelung). [BELEGT · Bewertung ANNAHME]

4. **Es gibt möglicherweise längst eine GbR, ohne dass jemand etwas gegründet hat.**
   Zwei Personen, die einen gemeinsamen Zweck verfolgen — das ist nach meiner
   Einordnung bereits eine Gesellschaft bürgerlichen Rechts, ohne Vertrag, ohne
   Anmeldung. Folge: Beide haften persönlich, und im Impressum steht nur einer.
   [BELEGT für das Impressum · ANNAHME für die Rechtsfolge] **[→ ANWALT]**

5. **Das Impressum zitiert zwei Gesetze, die es nicht mehr gibt.** Es beruft sich auf
   das TMG (seit Mai 2024 durch das DDG abgelöst) und den RStV (seit November 2020
   durch den MStV abgelöst). Das ist der billigste Punkt der ganzen Liste — reine
   Textarbeit, kein Anwalt nötig für die Feststellung, sehr wohl aber für die
   Neufassung. [BELEGT `app/impressum/page.js:8,45,54,56`]

6. **Was zum Live-Gang weg muss, ist NICHT die Seed-Menge insgesamt, sondern jede
   Zahl, die ein Dritter als Reichweite liest.** 4.073 Seed-Likes gegen 16 echte ist
   der klarste Fall. Der Testphase-Banner deckt *Inhalte* ab, nicht *Zustimmungs­zahlen* —
   und ab der ersten Sponsorenzahl deckt er gar nichts mehr. Abschnitt 7.

---

## 1. Wie diese Zeitachse gebaut ist

Es gibt **drei Taktgeber**, und sie fallen nicht zusammen:

| Taktgeber | Was er auslöst | Datum |
|---|---|---|
| **Saisonstart Amateurbasketball** | Vereine melden Kader, Ergebnisse fallen an, echte Personendaten in Masse | Herbst 2026, **Datum steht nicht in unseren Unterlagen** [UNGEPRÜFT] |
| **Ende der Testphase / Live-Schaltung** | Banner fällt, Seed-Daten müssen raus, Aussagen werden nackt | Termin von Patrick zu setzen |
| **Erste Einnahme (Monetarisierung)** | Gewerbe, Steuern, AGB, Consent-Banner, Werbekennzeichnung | Heute blockiert (CLAUDE.md Roadmap 3) |

⚠️ **Der Fehler, den ich vermeiden will:** Diese drei werden gern in einen Topf
geworfen („wenn wir live gehen, machen wir das alles"). Sie liegen aber zeitlich
auseinander, und **die Vereinsansprache läuft VOR allen dreien** — sie ist die erste
Handlung nach außen, die einen scharfen Rechtsrahmen hat.

**Was ich NICHT liefere:** konkrete Kalenderdaten. Die kann nur Patrick setzen, weil
sie von seinem Saisonstart-Termin und seiner Monetarisierungsentscheidung abhängen.
Ich liefere die **Reihenfolge und die Abhängigkeiten** — was worauf warten muss.

---

## 2. Die Zeitachse auf einen Blick

```
JETZT (22.08.2026)
  │
  ├─ PHASE A — VOR der ersten Vereinsmail          ← der Engpass, alles andere wartet nicht darauf
  │   A1  Kanalentscheidung Post vs. E-Mail (§ 7 UWG)         Patrick, nach Anwaltsklärung
  │   A2  Anwaltstermin: Fragenblock UWG + Vereinsdaten       Anwalt
  │   A3  Impressum auf DDG/MStV umstellen + zweiter Betreiber Anwalt formuliert, Patrick entscheidet
  │   A4  Rechtsform klären (GbR-Feststellung, nicht Gründung) Anwalt + Steuerberater
  │   A5  Vereinsprofile: Demo-Kennzeichnung prüfen            Patrick + Kai
  │
  ├─ PHASE B — VOR Saisonstart / erste echte Teams
  │   B1  Nutzungsbedingungen (AGB) entwerfen lassen          Anwalt (eigene Leistung, eigener Kostenpunkt)
  │   B2  DSA: Meldeweg + Kontaktstelle                        Anwalt klärt Pflicht, dann Bau
  │   B3  Datenschutzerklärung: Alter, Rechtsgrundlage, Abschnitt 10 final
  │   B4  Auftragsverarbeitung + Drittlandtransfer (Atlas/Hostinger/Google)
  │   B5  Verzeichnis von Verarbeitungstätigkeiten (Art. 30)
  │   B6  Markenrecherche „Hoops Germany"                      Anwalt (Markenrecht)
  │
  ├─ PHASE C — Ende Testphase / LIVE-SCHALTUNG
  │   C1  Seed-Zahlen weg (Likes, Follower, Bestände)          Patrick entscheidet, Claude baut
  │   C2  Geo-Claim „Deutschland" gegen echte Abdeckung prüfen
  │   C3  Sponsor-Report: Seed-Anteile raus, Klarnamen raus
  │   C4  Banner fällt — vorher prüfen, was er getragen hat
  │
  ├─ PHASE D — VOR der ersten Einnahme (Monetarisierung)
  │   D1  Gewerbeanmeldung (§ 14 GewO)                         Patrick, Gewerbeamt
  │   D2  Steuerlicher Erfassungsbogen (ELSTER)                Steuerberater
  │   D3  Kleinunternehmer ja/nein — DIE nicht rückholbare Entscheidung
  │   D4  Rechtsform final (GbR bleibt / UG)                   Anwalt + Steuerberater + Notar
  │   D5  Geschäftskonto, Buchführung, Rechnungsvorlage
  │   D6  Consent-Banner + Werbekennzeichnung (Affiliate/Ads)
  │
  └─ PHASE E — laufend, ab Live
      E1  Betroffenenanfragen, Löschanträge, Meldungen bearbeiten
      E2  Beitragsbescheide IHK, Steuervoranmeldungen
      E3  Markenüberwachung, Vertragsverlängerungen
```

---

## 3. Spur 1 — Gewerbeanmeldung, Rechtsform, Steuern

### 3.1 Was die Gewerbepflicht auslöst

**Sachverhalt [BELEGT]:** Es gibt keine Gewerbeanmeldung (Auftragsangabe Patrick,
gedeckt durch `CLAUDE.md` Roadmap 3: „Monetarisierung – BLOCKIERT bis
Gewerbeanmeldung"). Das Impressum sagt gleichzeitig:
`app/impressum/page.js:40-42` — *„Gemäß § 19 UStG wird keine Umsatzsteuer berechnet
(Kleinunternehmerregelung)."*

**Berührte Norm [ANNAHME, hohe Sicherheit]:** § 14 Abs. 1 GewO — wer den
selbständigen Betrieb eines stehenden Gewerbes anfängt, muss dies der Behörde
**gleichzeitig** anzeigen. Also keine Schonfrist, keine „erst mal schauen"-Phase.
Ein Gewerbe ist nach der üblichen Definition eine selbständige, planmäßige, auf
Dauer angelegte, nach außen erkennbare Tätigkeit **mit Gewinnerzielungsabsicht**.

**Was das für die Frage „ab wann?" heißt [ANNAHME, mittlere Sicherheit]:**

| Auslöser | Löst Pflicht aus? | Meine Einordnung |
|---|---|---|
| Erste Einnahme | Ja, spätestens dann | Aber: **zu spät.** Die Pflicht knüpft an den Beginn, nicht an den Zufluss. |
| Gewinnerzielungs**absicht** + Aufnahme des Betriebs | Ja, nach meiner Lesart **das ist der Auslöser** | Der Betrieb läuft. Die Absicht ist dokumentiert (Roadmap 3 nennt Affiliate, Sponsoren, AdSense). |
| Reichweite / Nutzerzahl | Nein | Ist kein Tatbestandsmerkmal. |
| Kostenlose Plattform ohne jede Absicht | Nein | Wäre ein Hobby/Liebhaberei. **Das ist Hoops Germany nach eigener Dokumentation nicht.** |

⚠️ **Der Punkt, den ich für den unangenehmsten halte und nicht weichspüle:** Die
Dokumentation des Projekts belegt die Gewinnerzielungsabsicht selbst. Roadmap 3 nennt
Affiliate, Sponsorenfläche und AdSense; es gibt einen Sponsoren-Report; es gibt eine
Zielgruppe 5 „lokale Sponsoren" (`docs/ZIELGRUPPEN.md`). Wer später argumentieren will,
das sei alles nur ein Hobby gewesen, argumentiert gegen die eigenen Unterlagen.

**Was passiert, wenn zu spät [ANNAHME, mittlere Sicherheit]:** Die verspätete Anzeige
ist eine Ordnungswidrigkeit (§ 146 GewO), das Bußgeld bewegt sich nach meiner Kenntnis
im unteren dreistelligen bis niedrigen vierstelligen Bereich — **konkrete Beträge
nenne ich bewusst nicht, ich kenne die aktuelle Praxis nicht.** Der praktisch größere
Ärger ist ein anderer: Die Anmeldung kann **rückwirkend** verlangt werden, und dann
sind Steuererklärungen für zurückliegende Zeiträume fällig, für die niemand Belege
gesammelt hat.

**[→ ANWALT / → STEUERBERATER] Frage G-1:**
> Die Plattform ist seit Juni 2026 öffentlich erreichbar, kostenlos, ohne Einnahmen,
> aber mit dokumentierter Monetarisierungsabsicht (Affiliate, Sponsoring, Werbung).
> **Ab welchem Zeitpunkt ist die Gewerbeanzeige nach § 14 GewO fällig — mit Aufnahme
> des Betriebs, mit der ersten Einnahme, oder ab dem Zeitpunkt, ab dem die Absicht
> nach außen erkennbar wurde?** Und falls rückwirkend: welche Folgen hat das?

**[→ ANWALT] Frage G-2 (die unangenehme Anschlussfrage):**
> Das Impressum weist seit Beginn die Kleinunternehmerregelung nach § 19 UStG aus,
> also eine Unternehmereigenschaft, die gewerberechtlich nicht angemeldet ist.
> **Ist das ein eigenständiges Problem — und wenn ja: Impressum korrigieren oder
> Gewerbe anmelden?**

---

### 3.2 Rechtsform — und warum sie vor der Ansprache geklärt gehört

**Sachverhalt [BELEGT]:** Impressum und Datenschutzerklärung nennen **ausschließlich
Patrick Schemura** als Betreiber bzw. Verantwortlichen
(`app/impressum/page.js:9-16`, `app/datenschutz/page.js:11-16`). Jonatan ist an
zahlreichen Stellen als Mit-Entscheider dokumentiert (`CLAUDE.md`: „final mit Patrick
& Jonatan", Super-Admin-Konto, `docs/FUER-JONATAN-MATERIAL.md`).

**Berührte Norm [ANNAHME, mittlere Sicherheit]:** §§ 705 ff. BGB. Eine GbR entsteht
nach meiner Einordnung **von selbst**, sobald sich zwei Personen zur Verfolgung eines
gemeinsamen Zwecks zusammenschließen — ohne Vertrag, ohne Anmeldung, ohne dass jemand
das Wort „Gesellschaft" in den Mund nimmt. Wenn das hier zutrifft, folgt daraus:

- **Beide haften persönlich und unbeschränkt**, auch mit dem Privatvermögen, auch
  gesamtschuldnerisch — jeder für alles.
- **Das Impressum ist unvollständig**, weil es nur einen von zwei Betreibern nennt
  (§ 5 DDG verlangt die Angabe des Diensteanbieters).
- **Der „Verantwortliche" der Datenschutzerklärung ist möglicherweise falsch benannt** —
  Verantwortlicher nach Art. 4 Nr. 7 DSGVO ist, wer über Zwecke und Mittel entscheidet.
  Bei zwei Entscheidern kommt gemeinsame Verantwortlichkeit (Art. 26 DSGVO) in
  Betracht, die eine Vereinbarung verlangt.

⚠️ **Warum das VOR die Vereinsansprache gehört und nicht danach:** In dem Moment, in
dem Vereine angeschrieben werden, tritt das Projekt als Absender nach außen auf. Wer
dann Absender ist — eine Person oder eine Gesellschaft — bestimmt, wer haftet, wer im
Briefkopf steht und wen eine Abmahnung trifft. Das nachträglich zu ordnen, ist teurer
als es vorher zu klären, und die Klärung ist im ohnehin geplanten Termin eine Frage
von Minuten.

**Vergleich der zwei realistischen Wege [ANNAHME, keine Empfehlung — das ist Patricks
und Jonatans Entscheidung]:**

| | **GbR (ggf. schon vorhanden)** | **UG (haftungsbeschränkt)** |
|---|---|---|
| Entstehung | automatisch, formlos | Notar + Handelsregister, kostenpflichtig |
| Haftung | beide persönlich, unbeschränkt | grundsätzlich auf das Gesellschaftsvermögen begrenzt |
| Stammkapital | keines | ab 1 €, aber praktisch mehr nötig |
| Buchführung | Einnahmen-Überschuss-Rechnung möglich | Bilanzierung, Offenlegung |
| Laufende Kosten | gering | Notar, Register, Jahresabschluss, ggf. Steuerberater-Pflicht |
| Passt wann | solange kein nennenswertes Haftungsrisiko und kein Fremdkapital | sobald Sponsorenverträge, Werbeeinnahmen, Nutzerdaten in Masse |
| Reihenfolge-Effekt | **ändert die Reihenfolge nicht** — Gewerbeanzeige für jeden Gesellschafter bzw. für die Gesellschaft | **ändert die Reihenfolge sehr wohl:** Notar und Handelsregister müssen **vor** die Gewerbeanmeldung, weil das Gewerbe für die UG angemeldet wird |

⚠️ **Das ist die Antwort auf die Frage aus dem Auftrag „Ändert die Rechtsform etwas an
der Reihenfolge?": Ja, aber nur bei der UG.** Bei der GbR meldet man das Gewerbe an
und ist fertig. Bei der UG steht die Gründung **vorher** — wer erst das Gewerbe
anmeldet und dann eine UG gründet, macht die Anmeldung zweimal.

**[→ ANWALT] Frage G-3:**
> Zwei Privatpersonen betreiben gemeinsam eine Plattform, Entscheidungen werden
> gemeinsam getroffen, es gibt keinen schriftlichen Vertrag. **Besteht bereits eine
> GbR? Falls ja: Was folgt daraus für Impressum, Datenschutz-Verantwortlichkeit
> (Art. 26 DSGVO) und Haftung — und ist eine schriftliche Gesellschaftervereinbarung
> vor dem Live-Gang angezeigt?**

**[→ STEUERBERATER] Frage S-1:**
> GbR oder UG — bei erwarteten Einnahmen aus Affiliate, Sponsoring und Werbung im
> unteren vierstelligen Bereich im ersten Jahr: **Was ist steuerlich und
> haftungsseitig der sinnvollere Weg, und ab welcher Größenordnung kippt die Antwort?**

---

### 3.3 Umsatzsteuer, Kleinunternehmerregelung, IHK

**§ 19 UStG (Kleinunternehmerregelung) [ANNAHME, extern gestützt, Zahlen vom
Steuerberater zu bestätigen]:** Es gibt Umsatzgrenzen, unterhalb derer keine
Umsatzsteuer ausgewiesen und abgeführt wird. Diese Grenzen wurden **zum 01.01.2025
geändert** (nach meinem Kenntnisstand: Vorjahresumsatz bis 25.000 €, laufendes Jahr
bis 100.000 €). **Ob diese Zahlen für 2026 unverändert gelten, weiß ich nicht sicher —
das ist eine Zwei-Minuten-Frage an den Steuerberater und ich rate ausdrücklich davon
ab, meine Zahlen zu übernehmen.**

⚠️ **DIE EINE ENTSCHEIDUNG, DIE SICH SCHLECHT ZURÜCKNEHMEN LÄSST — und deshalb VOR
die erste Einnahme gehört:** Der Verzicht auf die Kleinunternehmerregelung (Option zur
Regelbesteuerung) **bindet nach meiner Kenntnis mehrere Jahre.** [ANNAHME, mittlere
Sicherheit] Das ist genau die Sorte Entscheidung, nach der der Auftrag fragt.

Die Abwägung in einem Satz, den ein Nicht-Steuerberater versteht: *Kleinunternehmer
heißt, man schlägt keine Umsatzsteuer auf und darf im Gegenzug die Umsatzsteuer aus
eigenen Ausgaben nicht zurückholen.* Wer viel investiert (Server, Druck, Werkzeuge)
und wenig einnimmt, verschenkt damit Geld. Wer wenig investiert und an Privatleute
verkauft, gewinnt. **Welcher Fall Hoops Germany ist, kann nur jemand beurteilen, der
die Zahlen sieht — also der Steuerberater, und zwar bevor die erste Rechnung
geschrieben ist.**

**IHK [ANNAHME, mittlere Sicherheit]:** Mit der Gewerbeanmeldung entsteht nach meiner
Kenntnis **automatisch** eine Pflichtmitgliedschaft in der zuständigen Industrie- und
Handelskammer (§ 2 IHKG). Niemand tritt bei, man ist es. Es gibt Beitragsbefreiungen
für kleine Gewerbetreibende unterhalb bestimmter Ertragsgrenzen und Sonderregeln für
Existenzgründer; **die konkreten Grenzen und ob sie hier greifen, gehört zum
Steuerberater.** Wichtig ist nur: **Der Beitragsbescheid kommt ungefragt, und er
überrascht Leute regelmäßig.** Für Ines gehört er als Kostenpunkt in die Planung, auch
wenn er klein ist.

**[→ STEUERBERATER] Fragen S-2 bis S-5, alle vor der ersten Einnahme:**
> **S-2** Kleinunternehmerregelung beibehalten oder zur Regelbesteuerung optieren —
> und wie lange bindet die Option?
> **S-3** Welche Belege müssen ab wann gesammelt werden, und ab wann rückwirkend?
> **S-4** Affiliate-Einnahmen aus dem Amazon-Partnerprogramm: Wie sind sie
> umsatzsteuerlich einzuordnen, insbesondere bei einem ausländischen Vertragspartner?
> **S-5** Gewerbesteuer: Greift der Freibetrag, und ab welcher Größenordnung wird das
> relevant?

---

## 4. Spur 2 — Steuerberater: ab wann sinnvoll, ab wann nötig

**Meine Einordnung [ANNAHME], klar getrennt:**

| | Zeitpunkt | Begründung |
|---|---|---|
| **Sinnvoll ab** | **jetzt**, als einmaliges Erstgespräch | Weil S-2 (Kleinunternehmer ja/nein) und S-1 (Rechtsform) sich später schlecht ändern lassen. Ein Erstgespräch ist billig, eine falsch gesetzte Weiche nicht. |
| **Nötig spätestens** | **vor der ersten Einnahme** | Ab dann laufen Aufzeichnungspflichten und Fristen, die niemand nachholen kann, ohne Belege zu haben, die er nicht gesammelt hat. |
| **Zwingend** | bei UG-Gründung | Bilanzierungspflicht — das macht kein Laie nebenbei. |

**Was VOR der ersten Einnahme geklärt sein muss, weil es danach schwer zu ändern ist
[ANNAHME]:**

1. **Kleinunternehmer ja/nein** (S-2) — Bindungswirkung. Die wichtigste.
2. **Rechtsform** (S-1) — ein späterer Wechsel GbR → UG ist eine Einbringung mit
   eigenen steuerlichen Folgen, nicht ein Formularwechsel.
3. **Wem gehören die Einnahmen** — bei zwei Betreibern: Gewinnverteilung. Ohne
   Vereinbarung gilt die gesetzliche Verteilung, und die passt selten zu dem, was die
   Beteiligten meinen.
4. **Trennung privat/geschäftlich** — Geschäftskonto. Wer Einnahmen aufs Privatkonto
   laufen lässt, produziert eine Aufräumarbeit, die später teurer ist als das Konto.
5. **Umgang mit den bisherigen Ausgaben** — Server, Domain, Druck, Werkzeuge sind seit
   Monaten angefallen. Ob und wie weit sie rückwirkend geltend gemacht werden können,
   ist eine echte Frage mit echtem Geldwert. **Das ist der Punkt, an dem sich ein
   Erstgespräch selbst bezahlen kann.**

**Was schiefgeht, wenn zu spät:** Die Weiche steht schon, wenn er sie zum ersten Mal
sieht. Belege für zurückliegende Ausgaben sind nicht mehr da. Und im schlechtesten
Fall ist eine Bindung eingegangen, die vier Jahre trägt.

**Kostenehrlichkeit (für Ines):** Ein steuerliches Erstgespräch ist ein eigener
Kostenpunkt, kein Anhängsel des Anwaltstermins. **„Spar dir den Steuerberater" ist
hier keine Option, die ich vertreten würde** — die Entscheidung S-2 allein trägt
mehrjährige Wirkung.

---

## 5. Spur 3 — Anwalt: der gebündelte Fragenkatalog

### 5.1 Was schon gesammelt war (aus den Vorbefunden)

**Aus `docs/RECHT-LEISTUNGSKARTE-2026-08-13.md`:**
- **F1-a** Rechtsgrundlage nach Art. 6 Abs. 1 DSGVO für öffentlich, **ohne Login**
  abrufbare Profildaten (Name, Verein, Statistiken, Geburtsdatum) — trägt lit. b
  (Vertrag) das, oder braucht es lit. a oder lit. f?
- **F1-b** Ist eine teilbare Bilddatei mit Klarnamen/Verein/Liga/Leistungsdaten zur
  Verbreitung auf Fremdplattformen eine Zweckänderung (Art. 6 Abs. 4 DSGVO)?
- **F1-c** §§ 107, 108 BGB: Ist der unentgeltliche Nutzungsvertrag mit einem 16- oder
  17-Jährigen ohne Sorgeberechtigte wirksam — und was folgt für lit. b, wenn nein?
- **F1-d** Genügt Selbstauskunft zum Geburtsdatum als „angemessene Anstrengung"?
- **F1-e** Trägt die skizzierte Stufe 1 der Leistungskarte?
- **F1-f** Datenschutz-Folgenabschätzung nach Art. 35 DSGVO nötig?
- **F1-g** Team-Admin erzeugt Karte über einen **anderen** Spieler — ändert das etwas?
- **F1-h** Öffentliche Ausgabe von `birthdate` (nicht nur `age`) vs. Datenminimierung
  (Art. 5 Abs. 1 lit. c DSGVO)?

**Aus `docs/RECHT-MINDESTALTER-2026-08-14.md`:**
- **F4-a** Genügt eine serverseitig erzwungene Selbstauskunft mit Zeitstempel-Beleg
  als Altersprüfung für einen kostenlosen, nicht auf Kinder gerichteten
  Amateursport-Dienst mit **öffentlich sichtbaren Profilen** — oder verlangt die
  öffentliche Sichtbarkeit ein stärkeres Mittel?
- **F4-b** Ist Hoops Germany „Anbieter einer Online-Plattform" im Sinne des DSA, und
  greift die Kleinstunternehmens-Ausnahme des Art. 19 DSA? Falls Art. 28 DSA doch
  anwendbar wäre: welche Maßnahmen?
- **F4-c** Muss die Altersgrenze in der Datenschutzerklärung stehen?

**Aus `CLAUDE.md` Roadmap 9 / `dec-datenschutz` (offen seit 02.07.2026):**
- **F5** Datenschutzerklärung Abschnitt 10 (YouTube-Einbettung im
  no-cookie-Modus + Link-Vorschauen mit Klick-zum-Laden) — die Formulierung ist
  ein Vorschlag von uns, keine geprüfte Fassung. [BELEGT `app/datenschutz/page.js:93-120`]

**Aus `docs/RECHT-HERO-CLAIM-2026-08-11.md`:**
- **F6** Geo-Claim „Amateur-Basketball in Deutschland" bei faktisch NRW-Abdeckung —
  § 5 UWG. Der Befund hat sieben Fundstellen benannt, darunter die
  Suchmaschinen-Beschreibung und die Willkommensmail.

### 5.2 Was für die Live-Schaltung neu dazukommt

- **F7 (UWG-Block, der wichtigste)** — vollständig in Abschnitt 6.3.
- **F8 (Vereinsdaten)** — vollständig in Abschnitt 6.6.
- **F9 (Impressum)** Das Impressum zitiert § 5 TMG, § 55 Abs. 2 RStV, § 7 Abs. 1 TMG
  und §§ 8–10 TMG. TMG und RStV sind nach meinem Kenntnisstand durch DDG und MStV
  abgelöst. **Welche Angaben verlangt § 5 DDG heute, wer ist bei zwei Betreibern zu
  nennen, und löst der Nachrichten-Block eine Benennungspflicht nach § 18 Abs. 2 MStV
  aus?** [BELEGT für die Zitate · ANNAHME für die Ablösung]
- **F10 (Nutzungsbedingungen)** Es gibt keine AGB. Nutzer laden Bilder und Texte hoch,
  Team-Admins tragen Daten über Dritte ein. **Welche Regelungen sind vor dem
  Live-Gang unverzichtbar — Rechteeinräumung an hochgeladenen Inhalten, Sperrung von
  Konten, Haftungsbegrenzung, Kündigung?** Das ist eine **eigene Leistung mit eigenem
  Kostenpunkt**, und ich sage das ausdrücklich, statt es unter „passt schon mit rein"
  zu verstecken.
- **F11 (DSA-Pflichten unterhalb der Ausnahme)** Art. 19 DSA nimmt Kleinstunternehmen
  von einem Teil der Plattformpflichten aus — nach meiner Lesart **nicht** von den
  Pflichten, die jeden Hostingdienst treffen, insbesondere dem Melde- und
  Abhilfeverfahren (Art. 16 DSA) und der Kontaktstelle (Art. 11/12 DSA).
  **Ist das richtig gelesen, und was heißt es konkret?** [ANNAHME, mittlere Sicherheit]
- **F12 (Foto- und Bildrechte)** Nutzer laden Profil- und Beitragsbilder hoch, auf
  denen Dritte zu sehen sein können. **Wie weit trägt § 22 KUG neben der DSGVO, und
  was muss in den Nutzungsbedingungen dazu stehen?**
- **F13 (Marke)** **Bestehen der Wortmarke „Hoops Germany" bzw. dem Logo ältere
  Rechte entgegen — und ist eine eigene Anmeldung vor der bundesweiten Ausweitung
  angezeigt?** Fachrichtung Markenrecht; das ist eine eigene Recherche (DPMA/EUIPO),
  kein Nebensatz im Datenschutztermin.
- **F14 (Analytics/Consent)** Die eigene Reichweitenmessung schreibt eine
  Sitzungskennung in den Browserspeicher
  (`components/AnalyticsTracker.js:44-49`, `localStorage["analyticsSessionId"]`).
  **Ist das nach § 25 TDDDG einwilligungsfrei „unbedingt erforderlich", oder braucht
  es schon heute — vor jeder Werbung — ein Einwilligungsbanner?** [BELEGT für den
  Code · ANNAHME für die Frage] **Das ist ein Live-Zustand, kein Zukunftsthema.**

### 5.3 Was VOR dem Ende der Testphase geklärt sein muss — und was danach reicht

| Frage | Wann | Warum genau dann |
|---|---|---|
| **F7 (UWG/Vereinsmails)** | **VOR der ersten Mail** | Der Verstoß entsteht mit dem Absenden. Danach ist er nicht mehr klärbar, nur noch verteidigbar. |
| **F8 (Vereinsdaten anlegen)** | **VOR der Ansprache** | Die Ansprache verweist auf Profile, die schon da sind. Wenn deren Anlage angreifbar ist, liefert die Mail den Beleg dafür mit. |
| **F9 (Impressum)** | **VOR der Ansprache** | Ein Impressum mit falscher Rechtsgrundlage ist der erste Punkt, den ein empfangender Verein oder dessen Anwalt anschaut. |
| **F1-a / F1-h (öffentliche Profildaten)** | **vor Saisonstart** | Ab Saisonstart wächst der Bestand echter Personendaten sprunghaft. Eine falsche Rechtsgrundlage wird mit jedem Datensatz teurer zu korrigieren. |
| **F1-c (§§ 107/108 BGB)** | **vor Saisonstart** | Jugendmannschaften melden im Herbst. Bis dahin ist es theoretisch. |
| **F5 (Datenschutz Abschnitt 10)** | **vor Live** | Offen seit 02.07. Kein akuter Auslöser, aber es ist der Abschnitt, der bei jeder Prüfung als Erstes gelesen wird. |
| **F14 (Consent/Analytics)** | **vor Live** | Es läuft heute schon. Je später, desto mehr Datensätze auf möglicherweise falscher Grundlage. |
| **F10 (AGB)** | **vor Live**, spätestens vor der ersten Einnahme | Ohne AGB fehlt die Rechteeinräumung für hochgeladene Inhalte. |
| **F11 (DSA)** | **vor Live** | Der Meldeweg muss existieren, bevor jemand etwas zu melden hat. |
| **F13 (Marke)** | **vor der bundesweiten Ausweitung** | Nach der Ausweitung ist die Reichweite des Konflikts größer und ein Namenswechsel teurer. |
| **F1-b / F1-e / F1-g (Leistungskarte)** | **danach** | Die Karte ist nicht gebaut. Reine Vorratsfrage. |
| **F1-f (DSFA)** | **danach**, außer F1-a fällt ungünstig aus | Hängt an F1-a. |
| **F4-c (Alter in der DSE)** | **danach** | Bestätigungsfrage, kein Blocker. |
| **F12 (Bildrechte)** | **mit F10 zusammen** | Gehört in dieselbe Vertragsarbeit. |

**Kostenehrlichkeit (für Ines):** F1-a bis F1-h, F4-a bis F4-c, F5, F7, F8, F9, F11,
F12 und F14 sind **Fragen in einem Erstberatungsmandat** — umrissen, entscheidbar,
kein offener Prüfauftrag. Das ist der Grund, warum sie so formuliert sind: Ein Anwalt,
der zwanzig entscheidbare Fragen bekommt, ist deutlich günstiger als einer, der sich
den Sachverhalt selbst erarbeiten muss. **Eigene Kostenpunkte, die NICHT
mitlaufen:** F10/F12 (Nutzungsbedingungen — Vertragsgestaltung) und F13
(Markenrecherche — andere Fachrichtung). Diese zwei ehrlich getrennt auszuweisen,
statt sie im Erstberatungshonorar zu verstecken, ist der Unterschied zwischen einer
belastbaren und einer schöngerechneten Planung.

---

## 6. Spur 4 — DIE VEREINSANSPRACHE

> Dies ist der ausführlichste Abschnitt, weil er der einzige ist, bei dem eine
> **Handlung nach außen** kurz bevorsteht und der Rechtsrahmen scharf ist.

### 6.0 Patricks Präzisierung: „Ich schicke die Mails selbst, von Hand, einzeln"

**Nachgereicht am 22.08.2026:** Kein automatisierter Versand, keine Serienmail.
Jede Mail wird einzeln geschrieben und an den jeweiligen Verein angepasst (Name,
Liga, Bezug), verschickt an die auf der Vereinsseite bzw. im Vereinsimpressum
veröffentlichte Kontaktadresse.

**Meine Einordnung, und ich mache sie unbequem statt bequem [ANNAHME, hohe
Sicherheit]: Rechtlich ändert das an der Kernfrage sehr wenig.** Drei Gründe:

1. **§ 7 Abs. 2 UWG unterscheidet nicht nach Versandart.** Der Tatbestand knüpft an
   „Werbung unter Verwendung elektronischer Post ohne vorherige ausdrückliche
   Einwilligung". Ob die Mail aus einem Versandwerkzeug oder aus Patricks
   Mailprogramm kommt, ist im Wortlaut nicht angelegt. Auch nicht, ob es eine Mail
   oder tausend sind.
2. **Eine einzelne Mail reicht.** Nach meiner Kenntnis ist bereits die **erste**
   unverlangte Werbe-E-Mail der Verstoß — es gibt keine Freimenge und keine
   Bagatellgrenze. Wer 40 Vereine anschreibt, hat nach dieser Lesart nicht *einen*
   riskanten Vorgang, sondern **40 voneinander unabhängige.**
3. **Die veröffentlichte Kontaktadresse ist keine Einwilligung — und das ist der
   Punkt, an dem sich die meisten irren.** Ein Verein, der eine E-Mail-Adresse in sein
   Impressum stellt, tut das, **weil das Gesetz ihn dazu verpflichtet**. Aus der
   Erfüllung einer gesetzlichen Pflicht eine Zustimmung zu Werbung abzuleiten, hieße,
   die Pflicht in einen Nachteil zu verwandeln. Nach meiner Kenntnis der
   Rechtsprechung wird genau so **nicht** argumentiert. [ANNAHME, mittlere bis hohe
   Sicherheit] **[→ ANWALT, Frage F7-e]**

**Was sich durch den Handversand tatsächlich ändert — und es ist nicht nichts:**

| | Ändert sich | Meine Einordnung |
|---|---|---|
| **Rechtmäßigkeit nach § 7 UWG** | **nein** | Der Tatbestand ist derselbe. |
| **Formale Pflichten** (Absenderangaben, Werbekennzeichnung, Abmeldehinweis, Art. 14 DSGVO) | **nein, gar nicht** | Sie hängen am Inhalt und am Zweck, nicht am Werkzeug. Abschnitt 6.4 gilt unverändert. |
| **Praktisches Entdeckungs- und Beschwerderisiko** | **ja, deutlich** | Eine erkennbar persönlich geschriebene Mail an einen thematisch passenden Empfänger löst seltener eine Beschwerde aus als eine Serienmail. Das ist ein Risiko-, kein Rechtmäßigkeitsargument. |
| **Beweislage, falls jemand sich beschwert** | **ja, zum Guten** | Patrick kann belegen, was er an wen geschrieben hat und dass es individuell war. Das hilft bei Verhandlung und Schadensbegrenzung. |
| **Schadenshöhe** | **ja** | Weniger Empfänger = weniger mögliche Anspruchsteller. |
| **Der eine Punkt, der die Rechtslage wirklich bewegen könnte** | **vielleicht** | Siehe unten — aber es ist nicht der Handversand, sondern der **Inhalt**. |

⚠️ **DER PUNKT, DER WIRKLICH TRAGEN KÖNNTE, UND ER IST EIN ANDERER ALS „VON HAND":**
§ 7 UWG setzt eine **geschäftliche Handlung** voraus (§ 2 UWG). Wenn eine Mail
tatsächlich *nur* die Erlaubnis erfragt, einen Verein als Sachinformation zu führen —
ohne die eigene Leistung anzupreisen, ohne Registrierungsaufforderung, ohne Anleitung
zum Team-Admin — dann ist es nach meiner Einordnung möglicherweise gar keine Werbung.
**Aber genau das ist bei dem geplanten Paket nicht der Fall:** Vorstellung der Idee +
Bitte um Erlaubnis + **Anleitung, wie man Team-Admin wird** ist die Bewerbung einer
Dienstleistung mit einer Handlungsaufforderung. Damit ist es nach meiner Lesart eine
geschäftliche Handlung. [ANNAHME, mittlere Sicherheit] **[→ ANWALT, Frage F7-f]**

⚠️ **Und deshalb die Warnung, um die der Auftrag ausdrücklich gebeten hat: Aus „ich
mache es ja von Hand" darf keine Sicherheit abgeleitet werden.** Der Handversand macht
das Risiko **kleiner und beherrschbarer** — er macht die Handlung nicht **rechtmäßig**.
Wer beides verwechselt, verschickt vierzig Mails im guten Glauben und hält die eine
Antwort, die eine Abmahnung ist, für Pech statt für die vorhersehbare Folge.

### 6.1 Sachverhalt

**Vorhaben [BELEGT durch Auftrag Patrick, 22.08.2026]:** E-Mail-Adressen von Vereinen
recherchieren und ein Paket versenden — (a) Vorstellung der Idee, (b) Bitte um
Erlaubnis zur Integration des Vereins, (c) Anleitung zum Team-Admin. Versand einzeln,
von Hand, individuell angepasst.

**Vorhandenes Material [BELEGT]:** In `~/Projekte/Hoops-Marketing/Tester-Akquise/`
liegen druckfertige Stücke — `Hoops_Germany_Flyer_A6_Druck.pdf`,
`Hoops_Germany_Testerkarte_A6_Druck.pdf`, `Hoops_Germany_Visitenkarte_Druck.pdf`,
jeweils mit Schnittmarken. **Eine E-Mail-Vorlage für die Vereinsansprache existiert
nicht.** Das ist eine Chance: Sie kann von vornherein richtig gebaut werden, statt
später korrigiert.

### 6.2 Berührte Normen [ANNAHME]

| Norm | Was sie regelt | Sicherheitsgrad meiner Einordnung |
|---|---|---|
| **§ 7 Abs. 1 UWG** | Generalklausel: unzumutbare Belästigung | hoch |
| **§ 7 Abs. 2 Nr. 2 UWG** | Werbung per elektronischer Post **ohne vorherige ausdrückliche Einwilligung** — Verbotstatbestand | hoch |
| **§ 7 Abs. 3 UWG** | Ausnahme für Bestandskunden | hoch, dass sie **hier nicht greift** |
| **§§ 823, 1004 BGB analog** | Unterlassungsanspruch des Empfängers (Recht am eingerichteten und ausgeübten Gewerbebetrieb bzw. allgemeines Persönlichkeitsrecht) | mittel |
| **§ 5a Abs. 4 UWG** | Kommerzieller Zweck darf nicht verschleiert werden | mittel |
| **§§ 5, 6 DDG** | Anbieterkennzeichnung, kommerzielle Kommunikation muss erkennbar sein | mittel |
| **Art. 6 Abs. 1 lit. f DSGVO** | Rechtsgrundlage für die Verarbeitung recherchierter Kontaktdaten | mittel |
| **Art. 14 DSGVO** | Informationspflicht bei nicht beim Betroffenen erhobenen Daten | hoch |
| **Art. 21 Abs. 4 DSGVO** | Hinweis auf das Widerspruchsrecht bei Direktwerbung, spätestens bei der ersten Kommunikation | hoch |

### 6.3 Die drei Irrtümer, die ich vorweg ausräume

**Irrtum 1: „Im B2B ist Kaltakquise per Mail erlaubt."**
**Nein — nach meiner Einordnung ist das der verbreitetste und teuerste Irrtum im
deutschen Direktmarketing.** [ANNAHME, hohe Sicherheit] § 7 Abs. 2 Nr. 2 UWG
unterscheidet **nicht** zwischen Verbrauchern und Unternehmen. Es gibt hier keine
Ausnahme für den Geschäftsverkehr. Die Vorstellung, B2B sei freier, stammt aus der
**Telefon**werbung — dort gab es historisch tatsächlich eine Stufe „mutmaßliche
Einwilligung" für Gewerbetreibende. **Für E-Mail hat es diese Stufe nie gegeben.**

**Irrtum 2: „Die Adresse steht doch öffentlich auf der Vereinsseite."**
Öffentlich abrufbar heißt nicht: zur Werbung freigegeben. Siehe 6.0, Punkt 3. Die
Veröffentlichung erfüllt eine Pflicht; sie erteilt keine Erlaubnis. [ANNAHME]

**Irrtum 3: „Wir verkaufen ja nichts, es ist kostenlos."**
Entgeltlichkeit ist kein Tatbestandsmerkmal. Maßgeblich ist die **geschäftliche
Handlung** — die Förderung des Absatzes oder Bezugs von Waren oder Dienstleistungen.
Eine kostenlose Plattform, die Nutzer gewinnen will, um später Werbung zu verkaufen,
handelt nach meiner Einordnung geschäftlich. [ANNAHME, mittlere Sicherheit]

**[→ ANWALT] Fragenblock F7 — der wichtigste des ganzen Termins:**
> **F7-a** Ist die geplante Vereinsansprache (Vorstellung + Erlaubnisbitte + Anleitung
> zum Team-Admin) eine geschäftliche Handlung im Sinne des UWG, obwohl die Plattform
> kostenlos ist und derzeit keine Einnahmen erzielt?
> **F7-b** Falls ja: Greift § 7 Abs. 2 Nr. 2 UWG uneingeschränkt auch gegenüber
> eingetragenen Vereinen — und gibt es für Vereine als Empfänger irgendeine
> Besonderheit gegenüber gewerblichen Empfängern?
> **F7-c** Gibt es einen gangbaren Weg zur **vorherigen ausdrücklichen Einwilligung**,
> der nicht selbst schon die zu genehmigende Mail ist? (Formular auf der Website,
> Telefonanruf, Ansprache über den Verband.)
> **F7-d** Wie ist ein **Anruf** zu bewerten, bei dem um Erlaubnis für die Zusendung
> gebeten wird — § 7 Abs. 2 Nr. 1 UWG, und gilt für Vereine als Nicht-Verbraucher der
> Maßstab der mutmaßlichen Einwilligung?
> **F7-e** Kann aus der Veröffentlichung einer Kontaktadresse im Vereinsimpressum eine
> Einwilligung oder ein mutmaßliches Einverständnis abgeleitet werden?
> **F7-f** Verändert es die Bewertung, wenn die Mail **ausschließlich** die Erlaubnis
> erfragt (ohne Anleitung, ohne Registrierungsaufforderung, ohne Anpreisung) und die
> Anleitung erst nach einer Antwort folgt?
> **F7-g** Der Versand erfolgt **einzeln, von Hand, individuell angepasst**. Ändert
> das an der Bewertung nach § 7 UWG etwas — und falls nein: Ändert es etwas an der
> Rechtsfolge (Unterlassungsanspruch, Kostenerstattung, Wiederholungsgefahr)?
> **F7-h** Wer trägt bei zwei Betreibern das Risiko — der Absender persönlich, beide,
> oder die Gesellschaft?

### 6.4 Was in eine solche Mail hinein MUSS — und was nicht hinein DARF

**Unabhängig vom Ausgang von F7 gilt: Wenn eine Mail geschrieben wird, dann so.**
Diese Pflichten hängen am Inhalt, nicht am Versandwerkzeug — **der Handversand ändert
hier nichts.** [ANNAHME, mittlere bis hohe Sicherheit]

**MUSS hinein:**

1. **Vollständige Absenderangaben** — dieselben Angaben wie im Impressum: Name(n)
   der Betreiber (bei zwei Betreibern **beide**, siehe 3.2), ladungsfähige Anschrift,
   E-Mail, Telefon. Eine Fußzeile mit „Hoops Germany" allein genügt nicht.
2. **Erkennbarkeit des kommerziellen Zwecks** — schon in Betreff und Einstieg muss
   klar sein, dass es eine Ansprache eines Plattformbetreibers ist. Ein Betreff, der
   wie eine Vereinsangelegenheit aussieht, ist nach meiner Einordnung § 5a Abs. 4 UWG.
3. **Woher die Adresse stammt** — Art. 14 Abs. 2 lit. f DSGVO. Ein Satz genügt:
   „Ihre Kontaktadresse haben wir der öffentlich zugänglichen Vereinsseite entnommen."
4. **Hinweis auf das Widerspruchsrecht (Abmeldemöglichkeit)** — Art. 21 Abs. 4 DSGVO
   verlangt ihn bei Direktwerbung **spätestens bei der ersten Kommunikation**,
   ausdrücklich und getrennt von anderen Informationen. Praktisch: ein deutlich
   sichtbarer Satz, keine Fußnote. ⚠️ **Das gilt auch bei einer einzeln von Hand
   geschriebenen Mail.**
5. **Der Rest der Art.-14-Informationen** — Verantwortlicher, Zweck, Rechtsgrundlage,
   Speicherdauer, Betroffenenrechte. Übliche Lösung: kurzer Absatz plus Link auf die
   Datenschutzerklärung. ⚠️ Die verlinkte Erklärung muss diesen Fall dann auch
   **abdecken** — heute tut sie das nicht [BELEGT: `app/datenschutz/page.js` enthält
   keinen Abschnitt zu Direktansprache oder recherchierten Kontaktdaten].

**DARF NICHT hinein [ANNAHME]:**

- **Keine Behauptung einer Zusammenarbeit, die es nicht gibt.** Kein „offizieller
  Partner", kein „in Kooperation mit dem Verband", kein Verbandslogo. § 5 UWG.
- **Keine Behauptung, der Verein sei bereits dabei**, wenn nur ein Datensatz angelegt
  wurde. Das ist der Punkt, an dem die Ansprache und der Datenbestand
  zusammenstoßen — siehe 6.6.
- **Keine unbelegten Reichweiten- oder Nutzerzahlen.** Wenn eine Zahl genannt wird,
  muss sie die **echte** sein, nicht die mit Seed-Anteil. § 5 UWG, und es ist derselbe
  Gegenstand wie die 4.073 Seed-Likes aus Abschnitt 7.
- **Kein „Deutschland"-Claim, der über die tatsächliche Abdeckung hinausgeht** —
  `docs/RECHT-HERO-CLAIM-2026-08-11.md` hat das für die Website durchdekliniert; für
  eine Mail an einen Verein außerhalb NRW gilt es verschärft, weil dieser Verein den
  Claim unmittelbar an sich selbst prüft.
- **Kein Zeitdruck-Vorwand** („nur bis Freitag", „letzte Plätze"), wenn es ihn nicht
  gibt. § 5 UWG.
- **Keine Anhänge, die nicht angefordert wurden**, falls vermeidbar — kein
  Rechtsproblem, aber der schnellste Weg in den Spamfilter, und ein Zustellversuch,
  der im Spam landet, ist ein Risiko ohne Ertrag.

### 6.5 Postweg vs. E-Mail — die Antwort auf „Flyer drucken oder digital"

**Meine Einordnung [ANNAHME, hohe Sicherheit]: Der Postweg ist rechtlich deutlich
einfacher, und das ist kein Nuancenunterschied.**

Die scharfen Verbotstatbestände des § 7 Abs. 2 UWG treffen **elektronische Post,
Telefon, Fax und automatische Anrufmaschinen**. **Adressierte Briefwerbung steht dort
nicht.** Für sie gilt nur die Generalklausel des § 7 Abs. 1 UWG — eine unzumutbare
Belästigung ist ein Brief nach meiner Kenntnis erst dann, wenn der Empfänger
erkennbar widersprochen hat (etwa durch einen Aufkleber oder eine vorherige Bitte).

| | **E-Mail** | **Brief / Flyer** |
|---|---|---|
| Vorherige Einwilligung nötig? | **ja** (§ 7 Abs. 2 Nr. 2 UWG) | **nein**, nach meiner Einordnung |
| Ein einzelner Verstoß genügt? | ja | greift so nicht |
| Handversand ändert die Lage? | nein | Frage stellt sich nicht |
| DSGVO-Pflichten | Art. 14 + Art. 21 Abs. 4 | dieselben, **wenn** eine natürliche Person adressiert wird |
| Bei Adressierung an `info@verein.de` / „An den Vorstand" | Verein als juristische Person → DSGVO nach meiner Lesart **nicht** einschlägig; UWG **bleibt** | Verein als juristische Person → DSGVO nach meiner Lesart **nicht** einschlägig |
| Bei Adressierung an eine namentlich genannte Person | DSGVO **greift zusätzlich** | DSGVO **greift zusätzlich** |
| Kosten | nahe null | Druck + Porto |
| Reichweite pro Aufwand | hoch | niedriger |
| Rechtliches Restrisiko | **das höchste Einzelrisiko der ganzen Liste** | gering |

⚠️ **Der Satz für die Präsentation:** *Die Mail ist billiger im Versand und teurer im
Fehlerfall. Der Brief ist teurer im Versand und der einzige Kanal, bei dem der
Fehlerfall praktisch entfällt.*

⚠️ **Der Zwischenweg, den ich für den stärksten halte [ANNAHME, keine Empfehlung im
Rechtssinn]:** Brief oder Flyer an den Verein, darin ein QR-Code oder eine kurze
Adresse zu einem **Formular auf der eigenen Website**, über das der Verein die
Zusendung weiterer Informationen **selbst anfordert**. Damit erzeugt der Verein die
Einwilligung, und die anschließende E-Mail-Kommunikation steht auf sicherem Grund.
Der Postweg wird so nicht zum Ersatz für die Mail, sondern zu ihrem Türöffner.
**Ob dieser Weg trägt, ist Frage F7-c.**

⚠️ **Was ich dabei ehrlich benennen muss:** Der Zwischenweg kostet Zeit und Rücklauf.
Von hundert Briefen füllen nicht hundert Vereine ein Formular aus. Wer die schnelle
Reichweite will, will die Mail — und muss dann F7 vorher geklärt haben. Ich stelle die
Abwägung dar; entscheiden muss Patrick.

### 6.6 Dürfen Vereinsdaten ohne Rückfrage angelegt werden?

**Sachverhalt [BELEGT]:** Auf `hoops_prod` stehen echte Vereine. `CLAUDE.md` nennt
namentlich „Mönchengladbach Scorpions e. V." und beziffert den echten Bestand mit
**6 Teams / 31 Spielern / 15 Beiträgen** gegenüber einem Seed-Bestand von
**40 Teams / 345 Spielern / 288 Beiträgen** allein aus `seed-world`. Es gibt eine
Kennzeichnung für Demo-Inhalte (`components/DemoBadge.js`, Kommentar wörtlich:
„damit Besucher Demo nie für echt halten").

**Meine Einordnung, getrennt nach Datenart [ANNAHME]:**

| Datenart | Einordnung | Sicherheit |
|---|---|---|
| **Vereinsname, Liga, Ort, Spielklasse** | Daten einer **juristischen** Person. Die DSGVO schützt nach Art. 4 Nr. 1 nur natürliche Personen — nach meiner Lesart also **kein** Datenschutzthema. Es sind zudem öffentlich verfügbare Sachinformationen aus Ligatabellen. | mittel bis hoch |
| **Namen von Vorstandsmitgliedern, Trainern, Ansprechpartnern** | **Personenbezogene Daten.** DSGVO greift voll, inklusive Art. 14. | hoch |
| **Vereinslogo** | Weder DSGVO noch Sachinformation, sondern **Urheber- und Markenrecht**. Der problematischste Einzelposten. | mittel |
| **Spielerlisten des Vereins** | Personenbezogene Daten Dritter, teils Minderjähriger. | hoch |

**Was daraus folgt, in einfachen Worten [ANNAHME]:**

- **Ein sachlicher Verzeichniseintrag** — „SV Musterstadt, Bezirksliga 2, Musterstadt" —
  ist nach meiner Einordnung **vertretbar ohne Rückfrage**. Das ist die Sorte
  Information, die auch in jeder Ligatabelle steht.
- **Ein Profil, das so aussieht, als sei der Verein hier aktiv**, ist etwas anderes.
  Wenn ein Besucher aus der Darstellung schließt, der Verein sei Mitglied, Partner
  oder Nutzer, ist nach meiner Einordnung § 5 UWG berührt — irreführende Angabe über
  geschäftliche Verhältnisse — und daneben das Namensrecht (§ 12 BGB, § 5 MarkenG).
  ⚠️ **Und dieser Fall ist nicht theoretisch:** Das Produkt gibt Vereinen Kader,
  Beiträge und Statistiken. Ein befülltes Profil sieht nach Teilnahme aus.
- **Ein Logo ohne Erlaubnis zu übernehmen, würde ich nicht tun.** Es ist der eine
  Punkt der Liste, bei dem ich ohne jede Einschränkung sagen würde: erst fragen.
- **Die Kennzeichnung ist der Hebel.** `DemoBadge` existiert bereits. Ob sie an jedem
  ungefragt angelegten Vereinsprofil sichtbar ist, habe ich **nicht** gemessen —
  siehe 6.7.

**[→ ANWALT] Fragenblock F8:**
> **F8-a** Dürfen Name, Liga und Ort eines Vereins ohne Rückfrage als Verzeichniseintrag
> geführt werden — und wo verläuft die Grenze zu einer Darstellung, die eine
> Teilnahme oder Zusammenarbeit suggeriert (§ 5 UWG, § 12 BGB, § 5 MarkenG)?
> **F8-b** Welche Kennzeichnung ist nötig, damit ein ungefragt angelegtes Vereinsprofil
> nicht als Teilnahme gelesen wird — und genügt ein Abzeichen?
> **F8-c** Vereinslogos: Nur mit ausdrücklicher Erlaubnis, oder gibt es eine
> Zulässigkeit für die reine Identifizierung?
> **F8-d** Wenn ein Verein widerspricht — welcher Anspruch besteht, und wie schnell
> muss reagiert werden?
> **F8-e** Ligastruktur- und Tabellendaten stammen aus Verbandsquellen. Berührt die
> systematische Übernahme das Datenbankherstellerrecht (§§ 87a ff. UrhG)?

### 6.7 Was VOR der ersten Mail (oder dem ersten Brief) erledigt sein sollte

Reihenfolge, jede Zeile mit Begründung:

1. **F7 und F8 beim Anwalt klären.** Ohne das ist alles Weitere ein Blindflug.
2. **Impressum auf DDG/MStV umstellen und beide Betreiber nennen** (F9). Es ist die
   Seite, die ein empfangender Verein als Erstes prüft.
3. **Datenschutzerklärung um den Fall „Direktansprache" ergänzen.** Sie muss den Fall
   abdecken, auf den die Mail verlinkt. [→ ANWALT, Teil von F5/F7]
4. **Kanalentscheidung treffen** (Post / Mail / Zwischenweg) — Patrick.
5. **Vereinsprofile im Bestand ansehen und die Kennzeichnung prüfen.** Konkret die
   Frage: Sieht ein ungefragt angelegtes Vereinsprofil aus wie eine Teilnahme?
   ⚠️ **Ich habe das NICHT gemessen** — dafür müsste ich `hoops_prod` lesen und die
   Oberfläche ansehen. Das gehört zu Tobias (Browser-Gate) bzw. Lina (wie liest ein
   Erstbesucher das?), nicht zu mir.
6. **Eine einzige Mustermail bauen und prüfen lassen** — statt vierzig verschiedene
   von Hand geschriebene Fassungen mit vierzig verschiedenen Fehlern. ⚠️ Individuell
   angepasst heißt nicht: jedes Mal neu erfunden. Ein festes Gerüst mit variablen
   Feldern (Name, Liga, Bezug) ist individuell **und** prüfbar. Wortlaut: Nele.
   Rechtsprüfung: Anwalt. **Nicht ich** — ich formuliere keinen Rechtstext.

---

## 7. Spur 5 — Was mit dem Ende der Testphase kippt

### 7.1 Was der Banner heute tatsächlich sagt

[BELEGT `components/TestPhaseBanner.js:9-10`], wörtlich:

> „🚧 **Testphase:** Hoops Germany ist im Testbetrieb – einige Inhalte sind
> Beispieldaten. **Feedback geben**"

**Meine Einordnung [ANNAHME]:** Der Satz deckt **Inhalte** ab — Beiträge, Vereine,
Profile. Er deckt **Zahlen nicht ab**, und zwar aus einem einfachen Grund: Ein Leser
versteht „einige Inhalte sind Beispieldaten" als „nicht alles, was hier steht, ist
echt passiert". Er versteht es **nicht** als „die 40 unter diesem Beitrag sind keine
40 Menschen". Zustimmungszahlen sind keine Inhalte, sie sind Messwerte über Inhalte.

### 7.2 Was spätestens zum Live-Gang weg sein MUSS

| # | Gegenstand | Belegte Größe | Warum es weg muss | Norm [ANNAHME] |
|---|---|---|---|---|
| **K1** | **Seed-Likes** | 4.073 Seed gegen **16** echte; höchster Einzelwert 40; 101 Beiträge mit 20+ [BELEGT CLAUDE.md Roadmap 2] | Ein Leser liest „40" als 40 Personen. Das ist eine Angabe über die Beliebtheit einer Dienstleistung. | § 5 UWG |
| **K2** | **Seed-Anteile im Sponsor-Report** | „Regionale Stärke" und „Beliebteste Inhalte" ziehen aus dem Gesamtbestand: **406 Spieler, davon 375 Seed (92 %)** [BELEGT] | Zwei Absätze weiter steht gedruckt, die Zahlen seien um Testkonten bereinigt. Das gilt nur für einen Teil der Seite. **Ab dem ersten verschickten Link sofort akut.** | § 5 UWG |
| **K3** | **Klarnamen im Sponsor-Report-PDF** | fünf echte Spielernamen unter einer gedruckten Zusicherung, es würden keine personenbezogenen Daten genannt; unter den Genannten können 16-/17-Jährige sein [BELEGT CLAUDE.md] | Der teilbare Link ist gefiltert, **der PDF-Weg nicht.** Zwei Wege nach draußen, einer geschützt. | DSGVO + die eigene Zusicherung |
| **K4** | **„+100 %" bei leerem Vorzeitraum** | `growth()`: `if (!prev) return cur > 0 ? 100 : 0` — bei Zeitraum „90 Tage"/„1 Jahr" zeigt der Report +100 %, wo gar nichts gemessen wurde [BELEGT] | Eine Wachstumsangabe, der keine Messung zugrunde liegt. | § 5 UWG |
| **K5** | **Geo-Claim „Deutschland"** | sieben Fundstellen, darunter Suchmaschinen-Beschreibung und Willkommensmail [BELEGT `docs/RECHT-HERO-CLAIM-2026-08-11.md`] | Solange NRW-only: Angabe über wesentliche Merkmale. **Mit der bundesweiten Ausweitung löst sich das von selbst — aber erst, wenn sie eingetreten ist, nicht wenn sie geplant ist.** | § 5 UWG |
| **K6** | **Seed-Vereine und Seed-Spieler** | 40 Teams / 345 Spieler mit `seedTag: "world"`, dazu Demo-Kreisligen | Ein Verein, der auf der Plattform steht und nicht existiert, ist ein anderer Fall als ein Beitrag, der erfunden ist. | § 5 UWG, ggf. § 12 BGB bei ähnlichen Namen |

⚠️ **Der Satz, den ich für den wichtigsten dieses Abschnitts halte:** **Der Banner ist
kein Schutzschild, das man einfach stehen lässt.** Zwei Gründe. Erstens deckt er
Zustimmungszahlen ohnehin nicht ab — die Wahrheit war also nie durch ihn getragen.
Zweitens: **Sobald der erste Sponsoren-Report nach draußen geht, ist der Empfänger
jemand, der eine Investitionsentscheidung trifft.** Ihm gegenüber wiegt eine
aufgeblähte Zahl schwerer als gegenüber einem Besucher, und ein Banner am oberen
Bildrand entlastet nicht.

### 7.3 Was Testphase-Nachsicht genießt — meine Einordnung

| Gegenstand | Einordnung |
|---|---|
| **Beispiel-Beiträge mit erfundenem Text** | Vom Banner nach meiner Lesart **getragen**, solange sie als Beispiel erkennbar sind (`DemoBadge`). |
| **Demo-Kreisligen mit `isDemo` und noindex** | **Getragen** — sie sind gekennzeichnet und nicht auffindbar. |
| **Unfertige Funktionen, fehlende Feinschliffe** | Kein Rechtsthema. |
| **Fehlende AGB** | **Bis zur ersten Einnahme tragbar** [ANNAHME] — der Zünder ist die Monetarisierung. Ab echten Vereinen mit hochgeladenen Inhalten wird es aber unabhängig davon eng (F10/F12). |
| **Zustimmungs- und Reichweitenzahlen** | **NICHT getragen.** Weder heute noch später. |
| **Klarnamen im Sponsor-PDF** | **NICHT getragen.** Datenschutz kennt keine Testphase. |
| **Rechtsgrundlage öffentlicher Profildaten (F1-a)** | **NICHT getragen.** Es sind echte Personen, seit dem ersten Tag. |

⚠️ **Die Trennlinie in einem Satz:** *Der Banner trägt, was erkennbar ausgedacht ist.
Er trägt nicht, was gemessen aussieht — und er trägt gar nichts, wo echte Menschen
betroffen sind.*

---

## 8. Spur 6 — Was noch nicht auf dem Schirm war

> Der Auftrag sagt: „Lieber ein Punkt zu viel als eine böse Überraschung im Herbst."
> Hier sind sie. Ich habe sie nach dem sortiert, was mich am meisten beunruhigt.

### N1 — Verzeichnis von Verarbeitungstätigkeiten (Art. 30 DSGVO)
Es gibt keins im Repo [BELEGT: keine Datei dieser Art in `docs/`]. Die
Ausnahme für Organisationen unter 250 Beschäftigten greift nach meiner Lesart
**nicht**, wenn die Verarbeitung **nicht nur gelegentlich** erfolgt — und die
laufende Verarbeitung von Nutzerdaten einer Plattform ist nicht gelegentlich.
[ANNAHME, mittlere Sicherheit] **Es ist die erste Unterlage, die eine
Aufsichtsbehörde anfordert.** Es ist keine große Arbeit, aber es entsteht nicht von
selbst. **[→ ANWALT, Bestätigungsfrage]**

### N2 — Auftragsverarbeitung und Drittlandtransfer
Die Daten liegen bei **MongoDB Atlas** (`hoops.tbhsg.mongodb.net`) und **Hostinger**;
E-Mails laufen über Hostinger-SMTP; Anmeldung optional über **Google**; die
Nachrichten kommen über **Google News RSS**. Für jeden dieser Dienstleister braucht es
nach meiner Einordnung einen **Auftragsverarbeitungsvertrag (Art. 28 DSGVO)** — und
für alles, was in den USA verarbeitet wird, eine Grundlage nach Art. 44 ff. DSGVO.
⚠️ **Ich weiß nicht, in welcher Region der Atlas-Cluster liegt.** [UNGEPRÜFT] Das ist
eine Zwei-Minuten-Prüfung in der Atlas-Oberfläche und sie sollte gemacht werden, bevor
jemand danach fragt. **[→ ANWALT + Patrick]**

### N3 — § 25 TDDDG: Die Reichweitenmessung läuft heute schon
`components/AnalyticsTracker.js:44-49` schreibt eine dauerhafte Sitzungskennung in
den `localStorage`. [BELEGT] § 25 TDDDG (die Nachfolgeregelung des TTDSG) verlangt
nach meiner Einordnung für das Speichern von Informationen auf dem Endgerät eine
Einwilligung, **außer** es ist unbedingt erforderlich. Ob eine eigene
Reichweitenmessung „unbedingt erforderlich" ist, ist genau die umstrittene Frage.
[ANNAHME, mittlere Sicherheit] ⚠️ **Das ist kein Zukunftsthema, das mit AdSense
kommt — es läuft seit Monaten.** Frage F14.

### N4 — DSA: Meldeweg und Kontaktstelle
Nutzer laden Beiträge, Bilder und Kommentare hoch — die Plattform ist damit nach
meiner Einordnung ein Hostingdienst im Sinne des DSA. Art. 19 DSA nimmt
Kleinstunternehmen von einem Teil der Plattformpflichten aus, nach meiner Lesart aber
**nicht** vom **Melde- und Abhilfeverfahren (Art. 16)** und **nicht** von der
**Kontaktstelle (Art. 11/12)**. [ANNAHME, mittlere Sicherheit] Im Code habe ich eine
Meldefunktion für Kaderplätze und für Ligen gefunden (`report-roster-slot`,
`leagues/report`), **aber keine allgemeine Meldefunktion für Beiträge und
Kommentare** [BELEGT, Suche in `app/api/posts`]. Frage F11. ⚠️ **Der Meldeweg muss
existieren, bevor der erste Nutzer etwas zu melden hat — und mit Saisonstart steigt
die Zahl der Beiträge sprunghaft.**

### N5 — Nachrichtenfeed: fremde Überschriften
`app/api/news/rss/route.js` zieht Google-News-RSS und zeigt **Überschrift, Quelle,
Datum, Link** — keine Textauszüge, keine Bilder. [BELEGT] Das ist die
zurückhaltendste denkbare Form, und ich halte das Risiko für **gering**. Zwei Punkte
trotzdem: das Presse-Leistungsschutzrecht (§§ 87f ff. UrhG) erlaubt „einzelne Wörter
oder sehr kurze Auszüge" — bei einer vollständigen Überschrift ist das ein Grenzfall
[ANNAHME, niedrige Sicherheit]; und die Nutzungsbedingungen des Feed-Anbieters für
eine kommerzielle Nutzung habe ich **nicht gelesen** [UNGEPRÜFT]. Kein Blocker, aber
ein Punkt, der in einer bundesweiten, monetarisierten Fassung anders aussieht als in
einer Testphase.

### N6 — Marke „Hoops Germany"
Es gibt **keinen dokumentierten Marken-Check** für Hoops Germany. Zwei Richtungen:
(a) Verletzt der Name ältere Rechte Dritter? (b) Kann jemand anders ihn anmelden, während
Hoops bundesweit Bekanntheit aufbaut? ⚠️ **Beides wird mit der bundesweiten
Ausweitung teurer, nicht billiger** — ein Namenswechsel nach der Ansprache von
hunderten Vereinen ist etwas anderes als heute. Frage F13, **eigener Kostenpunkt.**

### N7 — Bestandskonten ohne Altersbeleg
`CLAUDE.md`: Konten von vor dem 13.08.2026 haben keinen Altersbeleg, und
`models/Player.js` verbietet zu Recht das nachträgliche Setzen. [BELEGT] Solange 0
echte Profile unter 16 gemessen sind, folgenlos — aber die Lücke wächst nicht von
selbst zu. Einmalige Bestätigung beim nächsten Login wäre in der Testphase billig.
**Patricks Entscheidung, kein Anwaltsthema.**

### N8 — Der verwaiste Team-Admin und die 48 unverwaltbaren Vereine
`CLAUDE.md` Roadmap 16 (a): **48 der 66 Prod-Teams haben einen unerreichbaren Admin**
[BELEGT]. Kein Rechtsproblem im engeren Sinn — **aber** wenn im Rahmen der
Vereinsansprache ein echter Verein auf sein eigenes, unverwaltbares Profil trifft,
ist das genau der Moment, in dem aus einer Produktschwäche eine Beschwerde wird.
**Gehört in die Vorbereitung der Ansprache, nicht in den Anwaltstermin.**

### N9 — Praktisches, das kein Gesetz ist, aber Geld kostet
- **Geschäftskonto:** Viele Banken untersagen in ihren Bedingungen die geschäftliche
  Nutzung von Privatkonten. Spätestens mit der ersten Einnahme.
- **Versicherung:** Eine Berufs-/Betriebshaftpflicht für Online-Dienste ist keine
  Pflicht, aber der übliche Weg, um genau die Risiken abzufedern, die auf dieser
  Liste stehen. ⚠️ Eine Rechtsschutzversicherung deckt nach meiner Kenntnis
  **Abmahnungen wegen eigener Werbung typischerweise nicht** — das ist die Lücke, die
  Leute überrascht. [ANNAHME, mittlere Sicherheit, → Versicherungsberatung]
- **Künstlersozialabgabe:** Wer regelmäßig freie Grafiker, Fotografen oder Texter
  beauftragt, kann abgabepflichtig werden. Heute nicht der Fall (die Arbeit macht ein
  KI-Team), aber sobald Jonatan oder Dritte gegen Rechnung Material liefern, gehört
  die Frage zum Steuerberater. [ANNAHME, niedrige Sicherheit] **[→ STEUERBERATER]**

### N10 — Zwei Punkte, bei denen ich Entwarnung gebe
Weil auch das dazugehört, statt nur Aufgaben aufzutürmen:
- **Datenschutzbeauftragter:** § 38 BDSG verlangt ihn nach meiner Kenntnis erst ab
  20 Personen, die ständig automatisiert Daten verarbeiten. Zwei Betreiber → **nicht
  erforderlich.** [ANNAHME, mittlere Sicherheit]
- **Hinweis auf Verbraucherstreitbeilegung (§ 36 VSBG):** Nach meiner Kenntnis
  ausgenommen bei bis zu 10 Beschäftigten. → **nicht erforderlich.** [ANNAHME,
  mittlere Sicherheit]

---

## 9. Dringlichkeit — belegt, nicht gefühlt

Systematik: `legal:legal-risk-assessment` (US-Vorlage, **nur die Skala übernommen**,
keine materiell-rechtliche Aussage). Score = Severity × Likelihood, je 1–4.
Die Begründungen sind meine **[ANNAHME]**.

| # | Punkt | Sev | Lik | Score | Stufe | Begründung |
|---|---|---|---|---|---|---|
| **A1** | Vereinsmails ohne geklärte § 7-Frage | 3 | 4 | **12** | 🔴 RED | Sev 3: Unterlassungsanspruch + Kosten je Empfänger, kein Betriebsstopp. Lik 4: **Der Versand ist konkret geplant und steht kurz bevor.** Höchster Score der Liste, und er ist der einzige, bei dem der Auslöser im Kalender steht. |
| **K2/K3** | Sponsor-Report: Seed-Anteile + Klarnamen im PDF | 3 | 3 | **9** | 🟠 ORANGE | Sev 3: Empfänger trifft eine Investitionsentscheidung; Klarnamen betreffen echte, teils minderjährige Personen. Lik 3: **ab dem ersten verschickten Link sofort** — und die Vereinsansprache ist genau der Anlass, bei dem so ein Link entsteht. |
| **F1-a** | Rechtsgrundlage öffentlicher Profildaten | 3 | 3 | **9** | 🟠 ORANGE | Sev 3: träfe die Grundlage der gesamten Kernfunktion. Lik 3: offen seit 02.07.; mit Saisonstart wächst der Bestand sprunghaft. |
| **K1** | 4.073 Seed-Likes gegen 16 echte | 2 | 3 | **6** | 🟡 YELLOW | Sev 2: Beanstandungs-/Abmahnrisiko. Lik 3: sichtbar für jeden Besucher, und Zielgruppe 5 sind Sponsoren. |
| **F9** | Impressum zitiert TMG und RStV | 2 | 3 | **6** | 🟡 YELLOW | Sev 2: Impressumsverstöße sind ein klassischer Abmahngegenstand. Lik 3: **fällt jedem auf, der hinsieht** — und ab der Ansprache sehen Vereine hin. **Aufwand: Minuten. Bestes Verhältnis der Liste.** |
| **N4** | DSA-Meldeweg fehlt | 2 | 3 | **6** | 🟡 YELLOW | Sev 2: Pflichtverstoß ohne unmittelbaren Schaden. Lik 3: Beiträge steigen mit Saisonstart. |
| **N3** | § 25 TDDDG / Analytics ohne Einwilligung | 2 | 3 | **6** | 🟡 YELLOW | Sev 2: Aufsichtsthema, kein Bußgeldschwerpunkt bei dieser Größe. Lik 3: **läuft heute**, jeder Tag erzeugt Datensätze. |
| **G-1** | Gewerbeanzeige | 2 | 3 | **6** | 🟡 YELLOW | Sev 2: Ordnungswidrigkeit + rückwirkende Steuerfolgen. Lik 3: Der Zustand besteht seit Juni und ist dokumentiert. |
| **N2** | AV-Verträge / Drittlandtransfer | 2 | 3 | **6** | 🟡 YELLOW | Sev 2: formaler Mangel. Lik 3: die erste Betroffenenanfrage legt ihn offen. |
| **F8** | Vereinsprofile ohne Rückfrage | 2 | 3 | **6** | 🟡 YELLOW | Sev 2: Unterlassung/Löschung. Lik 3: **steigt genau mit der Ansprache** — man macht die Betroffenen auf sich aufmerksam. |
| **N1** | Kein Verarbeitungsverzeichnis | 2 | 2 | **4** | 🟢 GREEN | Erst bei Prüfung relevant, dann aber sofort. |
| **F10** | Keine AGB | 2 | 2 | **4** | 🟢 GREEN | Zünder ist die Monetarisierung. Steigt mit echten Vereinen. |
| **G-3** | Rechtsform/GbR ungeklärt | 3 | 2 | **6** | 🟡 YELLOW | Sev 3: persönliche Haftung beider. Lik 2: wird erst bei einem Anspruch relevant — dann aber voll. |
| **N6** | Marke ungeprüft | 3 | 1 | **3** | 🟢 GREEN | Sev 3: ein Namenswechsel nach bundesweiter Ansprache wäre teuer. Lik 1: keine Anhaltspunkte, aber auch keine Prüfung. |
| **N5** | Nachrichtenfeed | 1 | 2 | **2** | 🟢 GREEN | Zurückhaltendste Nutzungsform. |
| **N7** | Bestandskonten ohne Altersbeleg | 2 | 1 | **2** | 🟢 GREEN | **[BELEGT]** 0 echte Profile unter 16. |

**Der einzige belegte Zeitdruck steht nicht in einer Norm, sondern im Kalender:** Die
Vereinsansprache ist geplant, der Saisonstart kommt im Herbst, und beides trifft auf
einen Rechtsrahmen, der bei E-Mail keine Nachsicht kennt. **Alles auf dieser Liste
lässt sich vorher billig erledigen und nachher teuer.**

**Empfohlene Reihenfolge:**
F9 (Impressum, heute, Minuten) → F7/F8 im Anwaltstermin → Kanalentscheidung Patrick →
K2/K3 (Sponsor-Report, vor dem ersten Link) → F1-a/F1-c/F5/F14/F11 im selben Termin →
Steuerberater-Erstgespräch → K1/K5/K6 zum Live-Gang → G-1/D-Block vor der ersten
Einnahme.

---

## 10. Optionen — einschließlich „nichts tun"

Für den einen Punkt, der zeitkritisch ist (Vereinsansprache):

| Option | Was sie löst | Was sie kostet | Restrisiko |
|---|---|---|---|
| **A — Nichts tun, nicht ansprechen** | Kein neues Risiko aus der Ansprache. | Der Saisonstart verstreicht ohne Vereine. Das ist der Moment, in dem die Plattform ihren Zweck erfüllt oder nicht. | **Nicht null:** Der Bestand bleibt, wie er ist — echte Vereinsprofile, Seed-Zahlen, veraltetes Impressum. „Nichts tun" beseitigt nicht, was live ist. |
| **B — E-Mails verschicken, ohne F7 zu klären** | Nichts. | Erspart ein Anwaltsgespräch. | 🔴 Höchstes Risiko der ganzen Liste. Jede Mail ein eigener Vorgang. **Ausdrücklich nicht meine Empfehlung.** |
| **C — Nur Postweg, keine Mails** | Den scharfen § 7-Tatbestand vollständig. | Druck, Porto, geringerer Rücklauf. | 🟢 Gering. Der DSGVO-Teil bleibt, wenn namentlich adressiert wird. |
| **D — Postweg mit Rückkanal (Formular), Mails erst nach Anforderung** | § 7 **und** baut Einwilligungen für später auf. | Zeit, Rücklaufquote, ein Formular muss gebaut werden. | 🟢 Gering, **wenn** F7-c bestätigt. |
| **E — F7 klären, dann entscheiden** | Die Unsicherheit selbst. | Ein Termin, der ohnehin geplant ist. Zeitverzug bis zum Termin. | 🟡 Der Verzug ist das einzige echte Risiko — und er ist steuerbar, indem der Termin vorgezogen wird. |

⚠️ **Option C fühlt sich langsamer an, als sie ist:** Die Flyer sind bereits gedruckt
bzw. druckfertig [BELEGT], die Mustermail existiert nicht. **Der Postweg ist heute der
Kanal, der weiter ist.**

---

## 11. Wen ich einbezogen habe und warum

| Person | Warum | Was von dort kommen muss |
|---|---|---|
| **Nele (marketing-manager)** | Der Wortlaut der Vereinsansprache ist Marketing-Text, nicht Rechtstext. Sie hat den Geo-Claim-Fall schon einmal gedreht (`docs/HERO-KAMPAGNEN-CHECK-2026-08-11.md`). | Mustermail-Wortlaut, Betreffzeile, und die Frage, wie „ab 16" und Reichweite ehrlich formuliert werden. **Ich liefere die Pflichtbestandteile, nicht die Sätze.** |
| **Lina (onboarding-referentin)** | Punkt 6.6 hängt an einer Wahrnehmungsfrage: Sieht ein ungefragt angelegtes Vereinsprofil aus wie eine Teilnahme? Das ist genau ihre Frage. | Befund am Live-Produkt: Wie liest ein Vereinsvorstand sein eigenes Profil? |
| **Tobias (qa-reviewer)** | 6.7 Punkt 5 und N8 brauchen einen Blick ins laufende Produkt, den ich nicht geleistet habe. | Ist die `DemoBadge` an Vereinsprofilen sichtbar? Was sieht ein Verein, wenn er dem Link aus der Mail folgt? |
| **Kai (test-automatisierung)** | K3 (Klarnamen im PDF) ist ein offener Punkt aus seinem Gebiet; K4 ist eine Codestelle. | Ob der PDF-Weg noch Klarnamen führt, ist messbar. Meine Angabe stammt aus `CLAUDE.md`, **nicht aus eigener Messung.** |
| **Ines (budgetverwalter)** | Anwalts- und Steuerberaterkosten sind echte Posten. | Ich habe sie ehrlich getrennt: Erstberatung (viele Fragen, ein Termin) · Nutzungsbedingungen (eigene Leistung) · Markenrecherche (eigene Fachrichtung) · Steuerberater (eigener Termin). **„Spar dir den Anwalt" würde ich bei A1 und F1-a nicht vertreten.** |
| **Hanna (hr-koordinator)** | Trägt Ergebnisse ins Roster. | Dieser Befund ist als Zuarbeit für die Präsentation zu vermerken. |
| **Mats / Ronja** | **Nicht einbezogen** — hier ist keine Bedarfs- oder Retentionsfrage berührt. Ich nenne es, damit die Auslassung eine Entscheidung ist und kein Versehen. | — |

---

## 12. Was ich NICHT geprüft habe — damit niemand mehr Sicherheit annimmt, als da ist

1. **`hoops_prod` habe ich nicht gelesen.** Alle Bestandszahlen in diesem Befund
   (4.073 Likes, 375 Seed-Spieler, 48 verwaiste Admins, 6 echte Teams) stammen aus
   `CLAUDE.md`, nicht aus eigener Messung. Sie sind dort als gemessen dokumentiert,
   aber ich habe sie nicht nachgezählt.
2. **Ich habe die Live-Seite nicht im Browser angesehen.** Ob die `DemoBadge` an
   Vereinsprofilen erscheint, weiß ich nicht.
3. **Ich habe keine Gesetzestexte im Wortlaut abgerufen.** Sämtliche Normzitate
   stammen aus meinem Kenntnisstand, nicht aus einer Quelle mit Abrufdatum. Für die
   Kernaussagen (§ 7 UWG, § 14 GewO, Art. 14/21 DSGVO) ist meine Sicherheit hoch, für
   die Zahlen (§ 19 UStG) niedrig. **Nichts davon ersetzt die Prüfung durch einen
   Anwalt oder Steuerberater.**
4. **Ich habe keine Rechtsprechung recherchiert.** Wo ich „nach meiner Kenntnis der
   Rechtsprechung" schreibe, ist das eine Erinnerung, kein Zitat.
5. **Ich kenne den Saisonstart-Termin nicht.** Er steht in keiner Projektunterlage,
   die ich gelesen habe. Alle Aussagen „vor Saisonstart" sind deshalb relativ, nicht
   datiert.
6. **Ich kenne die Atlas-Region nicht** (N2) und **habe die Nutzungsbedingungen des
   Nachrichtenfeeds nicht gelesen** (N5).
7. **Ich habe keinen Rechtstext formuliert.** Weder Impressum noch Datenschutz noch
   Mustermail. Das ist Sache des Betreibers und seines Anwalts, und es bleibt es.

---

## 13. Die eine Bitte an Patrick

Wenn aus diesem Befund nur **eine** Sache umgesetzt wird, dann diese:

> **Vor der ersten Vereinsmail einen Anwaltstermin, in dem F7 und F8 gestellt werden.**

Der Grund ist nicht, dass die Fragen die schwierigsten wären. Der Grund ist, dass sie
die einzigen sind, bei denen die Handlung **unwiderruflich** ist. Ein Impressum lässt
sich am nächsten Tag ändern. Eine Zahl lässt sich korrigieren. Eine verschickte Mail
lässt sich nicht zurückholen — und wenn vierzig davon draußen sind, sind es vierzig
Vorgänge, nicht einer.

Alles andere auf dieser Liste hat Zeit. Das nicht.
