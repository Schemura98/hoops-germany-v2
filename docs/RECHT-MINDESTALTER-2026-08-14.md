# Rechtliche Vorprüfung — Mindestalter „ab 16": Selbstauskunft, Einwilligung, Platzierung

**Nora (recht-vorpruefung) · 14.08.2026 · Branch `redesign`, reine Quelltext- und Dokumentenarbeit**

> ⚠️ **Ich bin ein KI-Agent, keine Anwältin. Das hier ist keine Rechtsberatung.**
> Jede Aussage zur deutschen Rechtslage ist eine gekennzeichnete, unverbindliche Annahme.
> Ich formuliere in diesem Befund **keinen** Rechtstext.
>
> **Kennzeichnung durchgängig:**
> **[BELEGT]** = Datei/Zeile im Repo oder externe Quelle mit Abrufdatum ·
> **[ANNAHME]** = meine unverbindliche Einordnung ·
> **[UNGEPRÜFT]** = Tatsache, die ich nicht verifizieren konnte.
>
> **Systematik-Herkunft:** Die Severity×Likelihood-Raster in Abschnitt 6 stammen aus der
> US-geprägten Vorlage `legal:legal-risk-assessment`. Übernommen ist **nur die Systematik**
> (Skala, Score, Eskalationsstufen), **keine** materiell-rechtliche Aussage.
> Die Begriffe „GREEN/YELLOW/ORANGE/RED" sind Einordnungsstufen dieser Vorlage,
> keine Aussage über deutsche Rechtslage.

**Anschlussdokumente:** `docs/RECHT-LEISTUNGSKARTE-2026-08-13.md` (Ursprungsprüfung,
Anwaltsfragen F1-a bis F1-h) · `docs/RECHT-LEISTUNGSKARTE-NACHTRAG-2026-08-13.md`
(Nachtrag nach Patricks „ab 16") · `docs/ENTDECKBARKEIT-BEFUND-2026-08-14.md` P2-3 (Lina).
Dieser Befund ersetzt keines davon.

---

## 0. Die drei Sätze, die zählen

1. **Die Selbstauskunft ist das richtige Instrument — und sie darf gerade *nicht* zur
   Einwilligungserklärung umgebaut werden.** Eine Einwilligung wäre hier ein
   Kategorienfehler: „Ich bin mindestens 16" ist eine Tatsachenangabe, keine Zustimmung
   zu einer Verarbeitung. Wer sie als Einwilligung formuliert, erzeugt einen Widerspruch
   zur eigenen Datenschutzerklärung, die als Rechtsgrundlage **Art. 6 Abs. 1 lit. b DSGVO
   (Vertrag)** nennt, nicht lit. a. **[BELEGT** `app/datenschutz/page.js:29` **· ANNAHME
   zur Bewertung]**

2. **Das ungelöste Problem sitzt woanders:** Nicht bei Art. 8 DSGVO (der greift nur bei
   Einwilligung), sondern bei **§§ 107, 108 BGB** — 16- und 17-Jährige sind beschränkt
   geschäftsfähig, und der Nutzungsvertrag ist die Rechtsgrundlage, auf die sich die
   Plattform beruft. Das ist unverändert **Anwaltsfrage F1-c**, jetzt nur schärfer
   gestellt. **[ANNAHME, niedrige Sicherheit]**

3. **Rechtliche Pflicht ist genau eine Sache, und sie hat nichts mit „16" zu tun:**
   `/team/join/[token]` und `/team/claim/[token]` legen Konten an, verlinken aber weder
   Datenschutzerklärung noch Impressum — anders als `/signup`. **[BELEGT]** Alles Übrige
   zum Mindestalter ist Empfehlung, nicht Pflicht. Linas P2-3 ist **kein Rechts-Gate**;
   sie kann sofort weiterlaufen.

---

## 1. Sachverhalt — was heute tatsächlich im Code steht

Alles in diesem Abschnitt ist **[BELEGT]**, am 14.08.2026 im Arbeitsverzeichnis gelesen.
Kein Dev-Server gestartet, kein Build gelaufen, `hoops_prod` nicht angefasst.

### 1.1 Wo die Regel wirkt

| Stelle | Datei/Zeile | Was genau |
|---|---|---|
| Registrierungsformular | `app/signup/page.js:215-225` | Kontrollkästchen, Text wörtlich: „Ich bin mindestens 16 Jahre alt." Voreinstellung **nicht** angehakt (`:39`). Client-Prüfung vor dem Absenden (`:88-91`). |
| Kaderplatz annehmen | `app/team/claim/[token]/page.js:269-278` | wortgleich, Client-Prüfung `:107` |
| Team-Einladung | `app/team/join/[token]/page.js:283-292` | wortgleich, Client-Prüfung `:100` |
| Server | `app/api/player/playerregister/route.js:35-37` | `minAgeConfirmed !== true` → Abbruch mit 400 |
| Beleg je Konto | `app/api/player/playerregister/route.js:61` · `models/Player.js:118` | `minAgeConfirmedAt: Date` — Zeitpunkt, nicht Boolean |
| Google-Weg | `app/api/auth/google/route.js:60-73` · `callback/route.js:95-106` | Cookie `g_oauth_minage`; **neue** Konten nur mit Cookie, Bestandskonten unberührt; Cookie wird ohne Bestätigung aktiv gelöscht |
| Profil-Änderung | `app/api/player/update-profile/route.js:73-88` | **neu eingetragenes** Geburtsdatum unter 16 wird abgewiesen; ein unverändert mitgeschicktes Bestandsdatum nicht |
| Kein Pflicht-Geburtsdatum | `models/Player.js:105-117` (Kommentar) | bewusst, weil `age`/`birthdate` über die öffentliche Profil-API einsehbar sind |

**Bewertung dieses Bestands [ANNAHME]:** Das ist eine ordentlich gebaute Zugangsschranke.
Sie wirkt serverseitig, sie ist nicht durch den OAuth-Weg umgehbar, sie ist nicht
vorausgehakt, und sie hinterlässt je Konto einen Zeitstempel. Die drei Dinge, an denen
solche Schranken üblicherweise scheitern (nur Client-Prüfung · OAuth-Umgehung ·
vorausgefülltes Häkchen), sind hier alle vermieden. Das ist die Ausgangslage, mit der
man in ein Anwaltsgespräch geht — nicht die, die man dort reparieren lässt.

### 1.2 Wo die Regel **nicht** steht — gemessen

| Fläche | Befund |
|---|---|
| `app/datenschutz/page.js` | 10 Abschnitte, **kein** Abschnitt zu Alter/Minderjährigen. Die Zeichenfolge „16" kommt nicht vor. **[BELEGT]** (deckt sich mit Linas Messung im laufenden Produkt) |
| `app/about/page.js` | keine Altersangabe **[BELEGT]** |
| AGB / Nutzungsbedingungen | **existieren nicht** — in `app/` gibt es keine entsprechende Route **[BELEGT]** |
| `app/impressum/page.js` | § 5 TMG, Kontakt, § 19 UStG, Haftung, OS-Plattform — kein Altersbezug (auch keiner nötig) **[BELEGT]** |

### 1.3 Ein Befund, den der Auftrag nicht bestellt hat — und der der einzige Pflichtpunkt ist

**`/signup` verlinkt Datenschutz und Impressum**, seit 13.08. über die gemeinsame Hülle:
`components/layout/AuthShell.js:92-98`, mit ausdrücklichem Kommentar, dass es ein reiner
**Verweis** und keine Einwilligungserklärung ist. Richtig so. **[BELEGT]**

**`/team/join/[token]` und `/team/claim/[token]` tun das nicht.** Beide bringen eine
eigene Hülle mit (`app/team/join/[token]/page.js:9-21`, `app/team/claim/[token]/page.js:10-21`),
importieren **kein** `AuthShell` und **keinen** `Footer`. Und der `Footer` steht **nicht**
im Wurzel-Layout (`app/layout.js:25-41` — dort nur AnalyticsTracker, TestPhaseBanner,
PageTransition, WelcomeTour). **[BELEGT]**

Ergebnis: Auf zwei von drei Wegen, auf denen ein Konto entsteht, findet der Nutzer im
Moment der Datenerhebung **weder** die Datenschutzerklärung **noch** das Impressum.

Berührte Normen **[ANNAHME]**: **Art. 13 Abs. 1, 2 DSGVO** (Information „zum Zeitpunkt der
Erhebung") und **§ 5 DDG** (vormals § 5 TMG — Anbieterkennzeichnung „leicht erkennbar,
unmittelbar erreichbar und ständig verfügbar"). Das ist unabhängig vom Mindestalter und
wäre auch dann zu schließen, wenn es die 16er-Regel nie gegeben hätte.

---

## 2. Frage 1 — Selbstauskunft oder Einwilligungserklärung?

### 2.1 Warum Art. 8 DSGVO hier vermutlich gar nicht das operative Problem ist

**Berührte Norm [ANNAHME]:** Art. 8 Abs. 1 DSGVO gilt nach seinem Wortlaut **nur**, wenn
die Verarbeitung **auf einer Einwilligung nach Art. 6 Abs. 1 lit. a beruht** und ein
Dienst der Informationsgesellschaft einem Kind **direkt angeboten** wird.

Hoops Germany beruft sich für den Kern der Verarbeitung ausdrücklich auf **Art. 6 Abs. 1
lit. b DSGVO** — Vertragserfüllung: **[BELEGT]** `app/datenschutz/page.js:29`. Auf
Einwilligung (lit. a) beruft sich die Erklärung an **genau einer** Stelle: dem Klick zum
Laden eingebetteter Drittinhalte, `app/datenschutz/page.js:120-121`.

**Folgerung [ANNAHME, mittlere Sicherheit]:** Solange lit. b die tragende Grundlage ist,
ist Art. 8 DSGVO **nicht die Norm, an der die Registrierung hängt**. Eine
„Einwilligungserklärung zum Mindestalter" würde deshalb nicht eine Lücke schließen,
sondern eine Grundlage suggerieren, die die eigene Datenschutzerklärung nicht behauptet.
Das ist schlechter als der jetzige Zustand, nicht besser.

**Zweites Argument, unabhängig davon [ANNAHME, hohe Sicherheit]:** Eine Einwilligung ist
nach Art. 4 Nr. 11 DSGVO eine **Willenserklärung** — freiwillig, informiert, für
bestimmte Zwecke, widerruflich (Art. 7 Abs. 3). „Ich bin mindestens 16 Jahre alt" ist
nichts davon. Es ist eine **Tatsachenangabe**. Man kann eine Tatsache nicht widerrufen,
und man willigt in sein Alter nicht ein. Wer den Satz in „Ich willige ein …" umschreibt,
erzeugt eine Erklärung, die im Streitfall **nichts trägt**, weil sie keinen
Verarbeitungszweck benennt.

**Meine Einordnung, klar gesagt:** Die Selbstauskunft ist die **richtige Rechtsnatur** für
das, was sie leistet — eine Zugangsvoraussetzung. Die Frage „Selbstauskunft oder
Einwilligung?" hat, so gestellt, die Antwort **Selbstauskunft**. Verbindlich klärt auch
das ein Anwalt; aber ich sehe hier keinen ernsthaften Zweifelsfall, und ich sage lieber,
wo ich sicher bin, als überall gleich unsicher zu klingen.

### 2.2 Wo das echte, ungelöste Problem sitzt: §§ 107, 108 BGB

Und genau hier wird es unbequem — die Wahl von lit. b **entkommt** der Minderjährigkeit
nicht, sie **verschiebt** sie vom Datenschutzrecht ins Zivilrecht:

- Ein 16- oder 17-Jähriger ist **beschränkt geschäftsfähig** (§ 106 BGB). Ein
  Nutzungsvertrag, der ihm nicht **lediglich rechtlich vorteilhaft** ist (§ 107 BGB),
  ist ohne Einwilligung der Sorgeberechtigten **schwebend unwirksam** (§ 108 BGB).
- Ein kostenloser Dienst ist nicht automatisch „lediglich rechtlich vorteilhaft" —
  er begründet Pflichten (Nutzungsregeln, Datenüberlassung).
- Wenn der Vertrag schwebend unwirksam wäre, **wäre lit. b als Rechtsgrundlage der
  Verarbeitung angreifbar** — und man landet doch wieder bei der Einwilligung, also bei
  Art. 8, also bei den Eltern.

**[ANNAHME, ausdrücklich niedrige Sicherheit — das ist meine unsicherste Aussage in
diesem Befund.]** Das Verhältnis §§ 107/108 BGB ↔ DSGVO ist in der Literatur streitig
und von mir nicht auflösbar. Es ist unverändert **Anwaltsfrage F1-c** aus
`docs/RECHT-LEISTUNGSKARTE-2026-08-13.md:263`, hier nur präziser gefasst (Formulierung
für den Anwalt: Abschnitt 5).

**Wichtig für die Erwartungshaltung:** Diese Frage ist bei **jeder** deutschen Plattform
offen, die 16-/17-Jährige ohne Elternbeteiligung registriert. Sie ist kein Hoops-Sonderfall
und kein Grund, den Betrieb anzuhalten. Sie ist ein Punkt für die Liste, die ohnehin zum
Anwalt geht.

### 2.3 Wo die Grenze zwischen „Selbstauskunft reicht" und „mehr nötig" verläuft

**[BELEGT — extern, abgerufen 14.08.2026]** Der Europäische Datenschutzausschuss leitet
aus Art. 8 ein implizites Erfordernis der Altersprüfung ab: Der Verantwortliche müsse
**„angemessene Anstrengungen"** unternehmen — und diese Maßnahmen sollen der **Natur und
dem Risiko der Verarbeitung angemessen** sein.
Quelle: [datenschutz-notizen.de, „Minderjährige im Datenschutzrecht"](https://www.datenschutz-notizen.de/minderjaehrige-im-datenschutzrecht-3940384/) ·
[it-recht-kanzlei.de, „Minderjährige & Datenschutz"](https://www.it-recht-kanzlei.de/datenverarbeitung-minderjaehrige-dsgvo.html).

**Das ist der eigentliche Maßstab, und er ist ein Verhältnismäßigkeitsmaßstab, keine
Schwelle.** Übersetzt auf Hoops **[ANNAHME]**:

| Faktor | Wirkt Richtung „Selbstauskunft genügt" | Wirkt Richtung „mehr nötig" |
|---|---|---|
| Öffentlich sichtbare Profildaten (Klarname, Verein, Statistik) | | ✗ erhöht das Risiko — Erwägungsgrund 38 DSGVO nennt Profilbildung ausdrücklich |
| Kein Pflicht-Geburtsdatum, keine besonderen Kategorien (Art. 9), keine Bezahlung, keine Werbeprofile | ✓ | |
| Zielgruppe ist **nicht** Kinder — `docs/ZIELGRUPPEN.md` führt unter 16 in keiner der fünf Zielgruppen **[BELEGT]** | ✓ | |
| Ligen-Katalog endet bei U18, U16 wurde am 13.08. entfernt **[BELEGT** `CLAUDE.md` Abschnitt 0 **]** | ✓ (Produkt lädt die Gruppe nicht mehr ein) | |
| Serverseitige Durchsetzung + Beleg je Konto | ✓ | |
| Kein Meldeweg, kein Nachkontroll-Schritt, kein Hinweis in der Datenschutzerklärung | | ✗ (Abschnitt 3) |

**Meine Einordnung [ANNAHME, mittlere Sicherheit]:** Für einen kostenlosen, nicht auf
Kinder gerichteten Amateursport-Dienst ohne Zahlungen und ohne besondere Datenkategorien
ist eine serverseitig erzwungene Selbstauskunft mit Beleg **plausibel „angemessen"** im
Sinne dieses Maßstabs. Was heute fehlt, ist nicht ein stärkeres Instrument, sondern die
**Dokumentation und Flankierung** dieses Instruments (Abschnitt 3). Eine Ausweis- oder
Video-Verifikation — das, was Meta an dieser Stelle anbietet — wäre hier **[ANNAHME]**
unverhältnismäßig und würde die Datenmenge genau in der Richtung vergrößern, die
`models/Player.js:105-117` bewusst vermeidet.

**Zweiter Rahmen, den ich beim Prüfen gefunden habe und der nicht bestellt war:**
**Art. 28 DSA** verlangt von Anbietern von Online-Plattformen, die für Minderjährige
zugänglich sind, „geeignete und verhältnismäßige Maßnahmen" zum Schutz Minderjähriger —
verpflichtet aber ausdrücklich **nicht** dazu, **zusätzliche personenbezogene Daten** zur
Altersfeststellung zu verarbeiten. **Art. 19 DSA** nimmt **Kleinst- und Kleinunternehmen**
von diesem Abschnitt aus (außer bei sehr großen Plattformen).
Quellen: [Art. 28 DSA](https://gesetz-digitale-dienste.de/dsa/artikel-28/) ·
[Art. 19 DSA](https://lxgesetze.de/dsa/19), abgerufen 14.08.2026.
**[ANNAHME]** Hoops Germany dürfte als Einzelunternehmen ohne Umsatz klar unter die
Kleinstunternehmens-Ausnahme fallen — aber der zweite Halbsatz ist der praktisch
wertvollere: Selbst dort, wo Art. 28 gilt, ist „keine zusätzlichen Daten erheben"
ausdrücklich zulässig. Das stützt die Entscheidung gegen ein Pflicht-Geburtsdatum von
einer zweiten, unabhängigen Seite. **Bestätigung durch den Anwalt sinnvoll** (neue
Frage F4-b, Abschnitt 5).

### 2.4 Stand der Praxis bei vergleichbaren deutschen Plattformen

**Ehrliche Vorbemerkung:** Ich habe öffentlich zugängliche Angaben ausgewertet, keine
Rechtsprechung und keine Aufsichtspraxis. „Was andere machen" ist nie eine
Rechtfertigung — es ist ein Indiz dafür, was als üblich gilt, und mehr behaupte ich hier
nicht.

**[BELEGT — extern, abgerufen 14.08.2026]** Der nächstliegende deutsche Vergleichsfall ist
**FUSSBALL.DE / DFBnet**:

- Ein „erweitertes Profil" ist dort **ab 13 Jahren** möglich; unter 13 nur mit
  schriftlicher Genehmigung der Erziehungsberechtigten, die der **Verein** im DFBnet
  bestätigt.
- **Daten von Kindern und Jugendlichen bis zum 16. Lebensjahr** werden für die
  Veröffentlichung **nur bei ausdrücklicher Einwilligung** verarbeitet.

Quellen: [fussball.de, „Dein FUSSBALL.DE-Profil: Das ist zu beachten"](https://www.fussball.de/newsdetail/dein-fussballde-profil-das-ist-zu-beachten/-/article-id/178854) ·
[DFB, „Informationen zur Verarbeitung von Spielerdaten"](https://www.dfb.de/fileadmin/_dfbdam/226086-Informationen_zur_Verarbeitung_von_Spielerdaten.pdf) ·
[DFB, „Datenschutz im Fußball"](https://www.dfb.de/datenschutz-im-fussball).

**Was ich daraus ableite [ANNAHME]:**

1. **Die 16er-Linie ist auch dort die Schutzlinie** — nur mit anderer Lösung: Der DFB
   lässt unter 16 zu und holt dafür eine **ausdrückliche Einwilligung** ein, über den
   Verein, mit Papierweg. Hoops Germany schließt unter 16 aus und braucht diese Maschinerie
   deshalb nicht. **Beides sind kohärente Wege; Hoops hat den erheblich billigeren gewählt.**
2. **Der Vergleich hinkt an einer Stelle, und das gehört gesagt:** Der DFB verarbeitet
   Spielerdaten primär aus dem **Spielbetrieb** (Spielrecht, Verbandsverhältnis) — eine
   ganz andere Grundlagen-Architektur als eine Selbstregistrierung. Wer sich auf „der DFB
   macht das so" beruft, beruft sich auf einen Verantwortlichen mit anderem Verhältnis
   zum Betroffenen. **[ANNAHME]**
3. **Kein Vergleichsfall ersetzt F1-c.** Auch der DFB hat das BGB-Problem für 16-/17-Jährige —
   er löst es über den Verein. Hoops hat keinen Verein dazwischen.

**Was ich NICHT geprüft habe:** Nutzungsbedingungen und Datenschutzerklärungen weiterer
Plattformen (Sportplatz-Media, Basketball-Bund/TeamSL, Spielplatz-/Ligaportale der WBV)
im Wortlaut. Ein zweiter Vergleichsfall wäre wünschenswert; ich habe ihn nicht belegt.
**[UNGEPRÜFT]**

---

## 3. Frage 2 — Muss die Altersgrenze irgendwo stehen? Pflicht vs. Empfehlung

Hier ist die Trennung, um die der Auftrag gebeten hat. Ich mache sie hart.

### 3.1 PFLICHT — genau ein Punkt, und er betrifft nicht das Alter

**P-1 · Datenschutz- und Impressum-Verweis auf `/team/join/[token]` und
`/team/claim/[token]`.**
Sachverhalt und Belege: Abschnitt 1.3. Berührte Normen **[ANNAHME]**: Art. 13 Abs. 1, 2
DSGVO (Information **zum Zeitpunkt der Erhebung**) und § 5 DDG (Anbieterkennzeichnung
„ständig verfügbar"). Beide Seiten erheben Name, E-Mail und Passwort und legen ein Konto an.

Das ist **kein Mindestalter-Thema** — es fällt hier nur auf, weil die Mindestalter-Prüfung
denselben Weg entlanggeht. Es ist der einzige Punkt dieses Befunds, bei dem ich sage:
**das gehört geschlossen, und zwar unabhängig von jeder weiteren Entscheidung.**
Aufwand: die vorhandene Fußzeile aus `AuthShell.js:92-98` in die beiden `Shell`-Bauteile
übernehmen. Kein Rechtstext nötig, kein Anwalt nötig, keine neue Fläche.

### 3.2 KEINE PFLICHT, aber deutliche EMPFEHLUNG

**E-1 · Ein Abschnitt zum Mindestalter in der Datenschutzerklärung.**
Ich habe **keine Norm gefunden, die das ausdrücklich verlangt** — der Katalog des Art. 13
DSGVO nennt Zwecke, Rechtsgrundlagen, Empfänger, Speicherdauer, Rechte, aber kein
Mindestalter. **[ANNAHME]** Trotzdem die stärkste Empfehlung dieses Befunds, aus einem
anderen Grund: **Art. 5 Abs. 2 DSGVO (Rechenschaftspflicht).** Wer sich darauf beruft,
dass Art.-8-Fragen bei ihm nicht entstehen, weil niemand unter 16 an Bord ist, muss das
**darlegen** können. `minAgeConfirmedAt` je Konto ist die technische Darlegung — die steht
bereits und ist gut. Ein Satz in der Datenschutzerklärung ist die **externe** Darlegung,
und sie kostet fast nichts. Ohne sie existiert die Regel nur im Code und in einem
Häkchen-Text.
→ Rechtstext. **Betreiber/Anwalt, ausdrücklich nicht Nele, ausdrücklich nicht ich.**
Was der Baustein leisten muss: Abschnitt 4.

**E-2 · Ein dokumentierter Reaktionsweg für gemeldete Unter-16-Konten.**
**[BELEGT]** Es gibt heute keinen: eine Suche über `app/` findet keine Melde- oder
Prüfroutine mit Altersbezug (`report-roster-slot` betrifft Kaderplätze, nicht Alter).
Der Maßstab „angemessene Anstrengungen" (2.3) fragt nach dem **System**, nicht nach dem
Häkchen. Ein Verantwortlicher, der auf einen Hinweis hin nichts tun kann, hat die
schwächere Position — und zwar genau in dem Moment, in dem es darauf ankommt.
Billigste tragfähige Fassung: ein Satz in der Datenschutzerklärung (E-1), der sagt, dass
bei Kenntnis eines Kontos unter 16 gelöscht wird, plus `info@hoopsgermany.de` als Weg.
Kein neues Bauteil nötig.

**E-3 · Die Grenze vor dem Formular nennen (Linas P2-3).**
**Rechtlich ist das keine Pflicht, und ich sage das deutlich**, weil eine
Scheinbegründung schlimmer wäre als keine: Ich habe geprüft, ob hier Daten eines
Unter-16-Jährigen verarbeitet werden, bevor er von der Grenze erfährt — **nein.**
`app/signup/page.js:88-91` bricht **vor** dem `axios.post` ab; dasselbe Muster in
`join:100` und `claim:107`. **[BELEGT]** Es verlässt kein Byte den Browser. Damit ist
P2-3 **kein Datenschutz-Befund**, sondern ein Fairness- und Erlebnispunkt.
**Konsequenz für Lina und Nele: kein Rechts-Gate. Ihr könnt loslegen** — mit den
Leitplanken aus Abschnitt 4.2.

**E-4 · Eine Begründung neben dem Häkchen.**
Ebenfalls keine Pflicht. Aber sie hat einen rechtlichen Nebennutzen **[ANNAHME]**: Art. 12
Abs. 1 DSGVO verlangt verständliche, klare Sprache, „insbesondere für Informationen, die
sich speziell an Kinder richten" — und 16-/17-Jährige sind Minderjährige. Eine nackte
Behauptung ohne Bezug ist schwerer als eine, die sagt, worauf sie sich bezieht.
Wortlaut: Nele, Leitplanken in 4.2.

### 3.3 ZURÜCKGESTELLT — mit benanntem Zünder

**Z-1 · AGB / Nutzungsbedingungen.** Es gibt keine **[BELEGT]**. AGB sind **nie Pflicht**.
Aber: Die Altersgrenze hat heute **keine vertragliche Heimat**. Sie ist eine
Zugangsschranke im Code und eine Tatsachenangabe im Formular — sie ist keine
**Nutzungsbedingung**, auf die man sich berufen könnte, wenn ein Konto wegen falscher
Altersangabe gelöscht werden soll. **[ANNAHME]** Das ist heute folgenlos (keine echten
Fälle bekannt) und wird relevant, sobald es Streit gibt oder Geld fließt.
**Zünder:** `dec-gewerbe` / Monetarisierung (`CLAUDE.md` Roadmap #3) — spätestens dort
sind AGB praktisch unvermeidlich, und dann gehört die Altersregel hinein.
**Kostenpunkt für Ines:** AGB-Erstellung ist eine **eigene** Anwaltsleistung, nicht Teil
der Erstberatung zu den F1-Fragen. Wer beides in einen Termin packt, unterschätzt den
Aufwand. Ich empfehle **nicht**, sich das zu sparen — ich empfehle, es **später und
gebündelt** mit der Gewerbeanmeldung zu machen.

**Z-2 · Bestandskonten von vor dem 13.08.2026 haben keinen Beleg.**
`models/Player.js:112-117` hält ausdrücklich fest, dass `minAgeConfirmedAt` bei
Altkonten fehlt und **nicht nachträglich gesetzt werden darf** — das ist richtig,
denn ein nachträglich gesetzter Zeitstempel wäre eine Fälschung. **[BELEGT]**
Folge: Die Regel deckt Neuregistrierungen ab, den Bestand nicht.
**Entlastend [BELEGT** `CLAUDE.md` Abschnitt 0 **]:** Auf `hoops_prod` wurden **0 echte
Profile unter 16** festgestellt.
**Entscheidbare Frage an Patrick:** Soll es für Bestandskonten eine einmalige Bestätigung
geben (Abfrage beim nächsten Login)? In der Testphase mit kleiner Nutzerzahl ist das
billig; nach dem Wachstum ist es lästig. Ich empfehle **ja, jetzt** — aber es ist eine
Produkt-, keine Rechtsentscheidung.
**Zweite entlastende Anmerkung:** Der bewusste Kompromiss in
`update-profile/route.js:73-88` (Bestandsdatum unter 16 bleibt speicherbar, damit das
Konto bedienbar bleibt) ist aus meiner Sicht **richtig** — die Alternative wäre ein Konto,
das sich nicht mehr korrigieren lässt.

---

## 4. Was die Textbausteine leisten müssen — und wer sie schreibt

**Ich formuliere hier nichts.** Das Folgende ist eine Anforderungsbeschreibung.

### 4.1 Baustein A — Datenschutzerklärung, neuer kurzer Abschnitt
**Hoheit: Betreiber (Patrick) bzw. Anwalt. Nicht Nele. Nicht ich.**

**Muss leisten:**
1. sagen, dass sich das Angebot an Personen **ab 16 Jahren** richtet;
2. sagen, dass bei der Registrierung eine **Selbstauskunft** verlangt und **gespeichert**
   wird (das ist die Rechenschafts-Darlegung, E-1);
3. sagen, was geschieht, wenn dem Betreiber ein Konto unter 16 **bekannt wird** (E-2);
4. einen **Kontaktweg** nennen (bestehende `info@`-Adresse genügt).

**Darf ausdrücklich NICHT:**
- als **Einwilligung** formuliert sein (Abschnitt 2.1);
- behaupten, das Alter werde **verifiziert** — es wird erklärt, nicht geprüft. Eine
  Überbehauptung an dieser Stelle ist gefährlicher als das Schweigen von heute;
- eine Rechtsgrundlage neu behaupten, die Abschnitt 2 der Erklärung nicht trägt;
- den Eindruck erwecken, es handle sich um eine Jugendschutz-Alterskontrolle im Sinne
  des JMStV — das ist ein anderer Regelungsbereich und hier nicht einschlägig **[ANNAHME]**.

**Stilhinweis:** Die Erklärung schließt heute mit „Stand: Juli 2026. Diese
Datenschutzerklärung ersetzt keine Rechtsberatung."
(`app/datenschutz/page.js:124-126`). Wer den Abschnitt einfügt, muss das **Datum
mitziehen**, sonst behauptet die Seite einen Stand, den sie nicht mehr hat — genau das
Muster aus `docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md`.

### 4.2 Baustein B — Erklär-Flächen (Nele)
**Hoheit: Nele. Freigegeben, kein Rechts-Gate** (Begründung: E-3).

Betroffene Stellen (Vorschlag Lina, `ENTDECKBARKEIT-BEFUND-2026-08-14.md` P2-3):
Unterzeile von `/signup` (`app/signup/page.js:127`, heute „Erstelle dein kostenloses
Spielerprofil.") · ein Satz auf `/about` · ein Halbsatz neben dem Häkchen.

**Muss leisten:** die Grenze **vor** dem Ausfüllen nennen und einen **nachvollziehbaren
Grund** geben.

**Der Grund, der trägt und den ich als Tatsache bestätigen kann [BELEGT]:**
Profile auf Hoops Germany sind **öffentlich sichtbar** — Name, Verein, Position,
Statistiken (`app/datenschutz/page.js:40-45`, Abschnitt 4 der Erklärung). Genau deshalb
ist die Plattform ab 16. Das ist ein Sachgrund, keine Rechtsbehauptung — und er ist
für einen 14-Jährigen verständlicher als jede Norm.

**Rote Linien für den Wortlaut — bitte wörtlich beachten:**
- **Nicht** „gesetzlich vorgeschrieben" / „nach DSGVO verboten". Das wäre eine
  Rechtsaussage, die ich **nicht** belegen kann: Es gibt keine Norm, die eine 16er-Grenze
  für so ein Angebot anordnet. Es ist eine **Betreiberentscheidung** — begründet, aber
  nicht angeordnet.
- **Nicht** „wir prüfen dein Alter". Es wird nicht geprüft.
- **Nicht** „Ich willige ein". Der Häkchen-Text bleibt eine Tatsachenangabe (2.1).
- **Kein** Superlativ, kein Sicherheitsversprechen („so sind alle Nutzer garantiert
  über 16") — das wäre zusätzlich eine §-5-UWG-Frage und schlicht unwahr.

**Meine Empfehlung zum Häkchen-Text selbst:** unverändert lassen. Er ist kurz, klar,
wortgleich an drei Stellen und rechtlich sauber. Was fehlt, gehört **daneben**, nicht
**hinein**.

### 4.3 Wer sonst noch dranmuss
- **Claude (Bau):** P-1 (Fußzeile in die zwei `Shell`-Bauteile) — sofort machbar, kein
  Text nötig. Alles Übrige erst nach Baustein A/B.
- **Kai / Tobias:** P-1 ist nutzersichtbar → beide Gates wie üblich. Kai zusätzlich:
  Der Prüfmechanismus in `tests/e2e/auth.spec.mjs:83-92` (jeder Aufrufer von
  `playerregister` muss `minAgeConfirmed` mitschicken) ist genau die richtige Bauart —
  ein **zweiter** Test derselben Machart für „jede kontoerzeugende Seite verlinkt die
  Datenschutzerklärung" würde P-1 dauerhaft absichern. Vorschlag, keine Anordnung.

---

## 5. Was an den Anwalt geht — und was es kostet

Der Termin ist ohnehin geplant (`docs/RECHT-LEISTUNGSKARTE-2026-08-13.md` Abschnitt 1.6,
Fachrichtung IT-/Datenschutzrecht). **Alles Folgende sind Zusatzfragen im selben Termin,
kein zusätzlicher Anlass.** Für Ines: **kein neuer Kostenpunkt** gegenüber der bereits
kalkulierten Erstberatung. Ausnahme ist Z-1 (AGB) — das ist eine eigene Leistung, und ich
sage das ausdrücklich, statt es unter „passt schon mit rein" zu verstecken.

**F1-c (unverändert, jetzt präziser gefasst):**
> Die Plattform stützt die Verarbeitung auf Art. 6 Abs. 1 lit. b DSGVO (Nutzungsvertrag)
> und lässt Nutzer ab 16 zu. Ist ein solcher unentgeltlicher Nutzungsvertrag mit einem
> 16- oder 17-Jährigen ohne Beteiligung der Sorgeberechtigten nach §§ 107, 108 BGB
> wirksam — und falls nein, welche Folge hat das für die Rechtsgrundlage lit. b?

**F4-a (neu):**
> Genügt eine serverseitig erzwungene Selbstauskunft mit Zeitstempel-Beleg als
> „angemessene Anstrengung" zur Altersprüfung für einen kostenlosen, nicht auf Kinder
> gerichteten Amateursport-Dienst mit öffentlich sichtbaren Profilen — oder verlangt die
> öffentliche Sichtbarkeit ein stärkeres Mittel?

**F4-b (neu):**
> Ist Hoops Germany ein „Anbieter einer Online-Plattform" im Sinne des DSA, und greift
> die Kleinstunternehmens-Ausnahme des Art. 19 DSA? Falls Art. 28 DSA doch anwendbar
> wäre: Welche „geeigneten und verhältnismäßigen Maßnahmen" wären hier gemeint?

**F4-c (neu, klein, Bestätigungsfrage):**
> Muss die Altersgrenze in der Datenschutzerklärung stehen, oder genügt die interne
> Dokumentation über `minAgeConfirmedAt`? Falls sie hineingehört: als Tatsachenhinweis
> oder mit Rechtsgrundlagenbezug?

**Ausdrücklich NICHT an den Anwalt:** die Frage, ob eine Begründung neben dem Häkchen
steht (E-3/E-4). Das ist Produkt- und Textarbeit. Sie dorthin zu geben, wäre teuer
und würde nichts klären.

---

## 6. Dringlichkeit — belegt, nicht gefühlt

Systematik: `legal:legal-risk-assessment` (US-Vorlage, **nur die Skala übernommen**).
Score = Severity × Likelihood. Die Begründungen sind meine **[ANNAHME]**.

| # | Punkt | Sev. | Lik. | Score | Stufe | Begründung der Einstufung |
|---|---|---|---|---|---|---|
| **P-1** | join/claim ohne Datenschutz-/Impressum-Verweis | 2 | 3 | **6** | YELLOW | Sev. 2: Abmahn-/Beanstandungsrisiko, kein Bußgeld-Schwerpunkt. Lik. 3: fällt bei jeder Betroffenenanfrage und jedem externen Blick sofort auf; die Wege sind **aktiv im Einsatz** (drei Einladungswege im Kader-Tab, `CLAUDE.md`). **Aufwand Minuten — bestes Verhältnis im ganzen Befund.** |
| **E-1** | Datenschutzerklärung schweigt zum Alter | 2 | 3 | **6** | YELLOW | Sev. 2: kein eigenständiger Verstoß, aber Schwächung der Rechenschaftsdarlegung. Lik. 3: die Erklärung ist die erste Fläche, die jemand liest, der nachfragt. |
| **F1-c** | §§ 107/108 BGB bei 16-/17-Jährigen | 3 | 2 | **6** | YELLOW | Sev. 3: träfe die Rechtsgrundlage einer Nutzergruppe, nicht den Betrieb. Lik. 2: setzt eine Beschwerde oder einen Elternkonflikt voraus; keine bekannt. **Kein eigener Anlass — läuft im geplanten Termin mit.** |
| **E-2** | kein Reaktionsweg bei Meldung | 2 | 2 | **4** | GREEN | Wird erst bei einem echten Hinweis relevant — dann aber sofort und sichtbar. |
| **Z-2** | Bestandskonten ohne Beleg | 2 | 2 | **4** | GREEN | **[BELEGT]** 0 echte Profile unter 16 auf `hoops_prod`. Deshalb heute folgenlos. |
| **Z-1** | keine AGB | 2 | 2 | **4** | GREEN | Zünder ist die Monetarisierung, die ohnehin blockiert ist (`CLAUDE.md` Roadmap #3). |
| **E-3/E-4** | fehlende Begründung vor/neben dem Formular | 1 | – | **–** | GREEN | **Kein Rechtsrisiko.** Es verlässt kein Datum den Browser (`signup:88-91`). Reine Produktqualität. |

**Der einzige belegte Zeitdruck** liegt nicht in einer Norm, sondern im Kalender:
`docs/RECHT-LEISTUNGSKARTE-NACHTRAG-2026-08-13.md` nennt als Zünder Jugendmannschaften
ab September; die Tester-Kampagne zielt auf **erste echte Teams bis ~10.09.2026**.
Bis dahin steigt die Wahrscheinlichkeit, dass ein 15-Jähriger auf eine Einladung eines
Team-Admins trifft — also genau auf `/team/join` und `/team/claim`, die zwei Seiten aus
P-1. **Das ist der Grund, P-1 vorzuziehen, und er ist belegt, nicht gefühlt.**

**Empfohlene Reihenfolge:** P-1 (heute, kein Text nötig) → E-3/E-4 (Nele, freigegeben) →
E-1/E-2 (mit Patrick, Rechtstext) → F1-c/F4-a/F4-b/F4-c im geplanten Anwaltstermin →
Z-1/Z-2 nach Patricks Entscheidung.

---

## 7. Optionen — einschließlich „nichts tun"

| Option | Was passiert | Risiko | Kosten |
|---|---|---|---|
| **A — nichts tun** | Selbstauskunft bleibt wie sie ist, ohne Flankierung | P-1 bleibt offen und ist der einzige Punkt, den ich **nicht** empfehlen kann liegenzulassen: Er ist billig zu schließen und trifft ab September die wahrscheinlichsten Wege. Die Altersregel bleibt außerhalb des Codes undokumentiert. | 0 |
| **B — nur P-1** | Pflichtlücke geschlossen, Rest unverändert | Vertretbar. Die Altersregel bleibt undokumentiert, die Rechenschaftsdarlegung stützt sich allein auf `minAgeConfirmedAt`. | Minuten Bauzeit |
| **C — P-1 + E-1/E-2 + E-3/E-4** ⭐ | Pflicht geschlossen, Regel dokumentiert, Reaktionsweg benannt, Begründung sichtbar | Aus meiner Sicht der ausgewogene Weg. Kein Anwalt **nötig**, um zu starten; F1-c läuft parallel im geplanten Termin. | Bauzeit + ein Rechtstext-Abschnitt (Patrick/Anwalt) + Neles Zeit |
| **D — zusätzlich Pflicht-Geburtsdatum / stärkere Verifikation** | „Sicherheit" durch mehr Daten | **Rate ich ab.** Es vergrößert genau die Datenmenge, die `models/Player.js:105-117` bewusst vermeidet, und Art. 28 DSA verlangt ausdrücklich **nicht**, zusätzliche Daten zur Altersfeststellung zu verarbeiten (2.3). Mehr Daten sind hier nicht mehr Recht. | hoch, in mehrfacher Hinsicht |

**Meine Empfehlung: C.** Sie ist keine Rechtsberatung, sondern eine Abwägung von
Aufwand gegen belegbare Lücken. Die Entscheidung gehört Patrick.

---

## 8. Kollegen — einbezogen und bewusst nicht

| Wer | Warum | Was ich ihr/ihm zurückgebe |
|---|---|---|
| **Lina** (onboarding-referentin) | Ihre Messung in `ENTDECKBARKEIT-BEFUND-2026-08-14.md` P2-3 ist die Faktenbasis von Frage 2. Ich habe ihre drei Messwerte im Quelltext gegengeprüft und **bestätige alle drei**. | **Dein P2-3 ist kein Rechts-Gate.** Ich habe geprüft, ob vor dem Häkchen Daten eines Unter-16-Jährigen verarbeitet werden — nein, der Abbruch liegt vor dem Netzwerkaufruf. Deine Zurückhaltung („Ich formuliere hier ausdrücklich nichts") war trotzdem richtig: Der **Grund**, den man nennt, ist die heikle Stelle, nicht die Zahl. Leitplanken stehen in 4.2. |
| **Nele** (marketing-manager) | Baustein B ist ihre Hoheit. | **Freigegeben, mit vier roten Linien (4.2).** Der tragfähige Grund ist die öffentliche Sichtbarkeit der Profile — belegt, keine Rechtsbehauptung. **Nicht** deine Fläche: der Abschnitt in der Datenschutzerklärung. |
| **Ines** (budgetverwalter) | Anwaltskosten ehrlich ausweisen. | Die vier Fragen aus Abschnitt 5 sind **Zusatzfragen im ohnehin geplanten Termin** → kein neuer Kostenpunkt. **Ausnahme: AGB (Z-1) sind eine eigene Anwaltsleistung.** Ich empfehle nicht, sie zu sparen — ich empfehle, sie mit der Gewerbeanmeldung zu bündeln. |
| **Kai** (test-automatisierung) | P-1 ist eine strukturelle Lücke derselben Art, die er in `auth.spec.mjs:83-92` bereits absichert. | Vorschlag eines zweiten Quelltext-Tests: „jede kontoerzeugende Seite verlinkt `/datenschutz`". |
| **Tobias** (qa-reviewer) | P-1 ist nutzersichtbar. | Gate wie üblich, mobil zuerst. |
| **Hanna** (hr-koordinator) | Roster-Pflege. | Nur zur Kenntnis: zweiter Nora-Einsatz, kein Rollenwechsel. |
| **Bewusst NICHT einbezogen** | **Vivien** (keine Gestaltungsfrage — die Fußzeile existiert bereits), **Till** (KCanG/HGH, anderes Projekt), **Mats/Ronja** (keine Bedarfsfrage), **Malik** (kein neues Werkzeug nötig). | |

---

## 9. Wo meine Einordnung an ihre Grenze kommt — ehrlich

1. **Ich habe keine Rechtsprechung und keine Aufsichtspraxis ausgewertet.** Alle externen
   Quellen dieses Befunds sind Fachblogs, Gesetzesportale und eine
   Verbands-Selbstdarstellung. Für die Frage „was gilt" ist das zu wenig; für die Frage
   „wo muss ein Anwalt hinschauen" reicht es.
2. **§§ 107/108 BGB ↔ DSGVO bleibt meine unsicherste Aussage.** Unverändert seit dem
   13.08. Ich habe die Frage präziser gestellt, nicht beantwortet.
3. **Nur ein Vergleichsfall belegt** (FUSSBALL.DE/DFB), und der hat eine andere
   Grundlagen-Architektur (Verband/Spielrecht statt Selbstregistrierung). Ein zweiter
   deutscher Amateursport-Vergleichsfall im Wortlaut fehlt. **[UNGEPRÜFT]**
4. **DSA-Einordnung ist meine eigene Subsumtion**, nicht belegt: ob Hoops Germany
   „Online-Plattform" ist und ob Art. 19 greift, habe ich aus Normtext und
   Sekundärquellen abgeleitet. → F4-b.
5. **`hoops_prod` nicht angefasst.** Ob heute Konten ohne `minAgeConfirmedAt` bestehen und
   wie viele, habe ich **nicht** abgefragt — ich stütze mich auf die Angabe „0 echte
   Profile unter 16" in `CLAUDE.md` Abschnitt 0 vom 13.08. Das ist die billigste offene
   Leseabfrage, wenn Z-2 entschieden werden soll.
6. **Google-OAuth im echten Ablauf** unverändert nur im Quelltext gelesen, wie bei Lina.
   Der Punkt „einmal auf Prod durchspielen" bleibt offen.
7. **JMStV/JuSchG habe ich nicht geprüft.** Meine Einschätzung, dass sie hier nicht
   einschlägig sind (kein entwicklungsbeeinträchtigender Inhalt), ist **[ANNAHME]** und
   war nicht Auftrag.

---

*Nora · 14.08.2026 · Vorprüfung, keine Rechtsberatung, kein Rechtstext formuliert.
Kein Dev-Server gestartet, kein `npm run build`, `hoops_prod` nicht berührt.
Nur diese Datei in `docs/` angelegt, nichts committet.
Entscheidung: Patrick — zuerst P-1, dann Option C oder B.*
