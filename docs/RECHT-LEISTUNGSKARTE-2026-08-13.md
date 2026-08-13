# Rechtliche Vorprüfung — Leistungskarte, Sponsorenlogo, Sponsoren-Zahlen

**Nora (recht-vorpruefung) · 13.08.2026 · Branch `redesign`**

> ## ⚠️ Was dieses Dokument ist — und was nicht
>
> Ich bin ein KI-Agent, keine Anwältin. **Dies ist keine Rechtsberatung und keine
> Rechtsauskunft.** Jede Aussage zu deutschem Recht in diesem Dokument ist eine
> **gekennzeichnete Annahme**, die eine verbindliche Prüfung nicht ersetzt, sondern
> vorbereitet. Ich sage nirgends „das ist zulässig". Ich sage: „das spricht dafür,
> das dagegen — verbindlich klärt das ein Anwalt."
>
> Zweck: Patrick soll morgen in Minuten entscheiden können, **was er selbst entscheidet
> und was er einkauft** — nicht in Stunden lesen.

**Auftrag:** Vorprüfung zu drei Punkten aus `docs/LEISTUNGSKARTE-KONZEPT-2026-08-13.md`
(Nele) plus einem Fund aus der Nacht. **Nichts committet, keine Datei außerhalb `docs/`
angefasst, `hoops_prod` nicht berührt.**

**Kennzeichnung** (wie in `ZIELGRUPPEN.md`): **[BELEGT]** — Code, Datei/Zeile oder Quelle
mit Datum · **[ANNAHME]** — meine unverbindliche rechtliche Einordnung, prüfungsbedürftig ·
**[UNGEPRÜFT]** — Tatsache, die ich nicht verifizieren konnte.

**Werkzeug-Herkunft:** Die Severity×Likelihood-Systematik unten stammt aus der Skill
`legal:legal-risk-assessment` — einer **US-geprägten Vorlage**. Ich habe **nur die
Systematik** übernommen (Raster, Eskalationsstufen), **keine materiell-rechtliche Aussage**.
Die Normen unten sind deutsches Recht und stammen nicht aus der Vorlage.

---

## 0. Die Ampeln auf einen Blick

| # | Vorhaben | Ampel | Ein-Satz-Begründung |
|---|---|---|---|
| **1a** | **Leistungskarte bauen wie konzipiert** (Bilddatei, Klarname, erzeugt für alle) | 🔴 **ROT** | Die Plattform weiß bei den meisten Profilen nicht, ob die Person minderjährig ist — und sie hat für die Erzeugung heute **gar keine** dokumentierte Rechtsgrundlage, auch nicht für Erwachsene. |
| **1b** | **Karte gestalten, texten, Entwurf bauen** (Vivien, Nele, kein Auslieferungspfad) | 🟢 **GRÜN** | Ein Entwurf verarbeitet keine Personendaten. Die Gestaltung ist rechtlich folgenlos, solange nichts erzeugt und nichts ausgeliefert wird. Das entsperrt die Arbeit, die jetzt anliegt. |
| **1c** | **Bestand: öffentliches Profil mit `birthdate`/`age` ohne Altersabfrage bei Registrierung** | 🟡 **GELB, mit Zünder** | Ist **live**, nicht hypothetisch. Steigt auf ROT, sobald Johnnys Verteilung ab September Jugendmannschaften erreicht. |
| **2a** | **Dauerhaft kein Sponsorenlogo auf der Karte** (Neles Neigung) | 🟢 **GRÜN** | Das kann Patrick allein entscheiden, es braucht keinen Anwalt und kostet nichts, was heute existiert. |
| **2b** | **Sponsorenlogo auf der Karte** | 🔴 **ROT** | Löst die Bedingung von `dec-gewerbe` selbst aus und wirft eine ungeklärte Kennzeichnungsfrage auf, deren Last beim Nutzer landen könnte. |
| **3a** | **Sponsoren-Report, Fall der Nacht** (nicht hinausgegangen, korrigiert) | 🟢 **GRÜN** | Kein Schadensfall. Rechtlich folgenlos, weil kein Dritter die Zahlen gesehen hat. |
| **3b** | **Sponsoren-Report, was heute noch drinsteht** | 🟡 **GELB** | Zwei Zahlen tragen dasselbe Fehlermuster noch, ehrlich beschriftet aber ungefiltert — und der Report übermittelt **Klarnamen echter Spieler** an Sponsoren. |

**Der eine Satz, wenn Patrick nur einen liest:**
Das Vorhaben ist **nicht ohne Klärung startbar** — aber die Klärung ist kleiner, als sie
aussieht, weil die eigentliche Anwaltsfrage nicht „darf die Karte?" lautet, sondern
**„auf welcher Rechtsgrundlage verarbeitet Hoops überhaupt Profildaten öffentlich, und
was ändert sich, wenn Minderjährige dabei sind?"** — eine Frage, die ohnehin schon offen
ist (`dec-datenschutz`, offen seit 02.07.) und die die Karte nur sichtbar macht.

---

# Frage 1 — Minderjährige auf einer teilbaren Bilddatei

## 1.1 Sachverhalt (Fakten, mit Quelle)

| Fakt | Beleg |
|---|---|
| Der offizielle Liga-Katalog enthält Jugendligen U18 und U16 (m/w); Produkt-Cutoff bei U16. | **[BELEGT]** `lib/constants.js` Z. 69: `LEAGUE_AGE_GROUPS = ["Senioren", "U18", "U16"]`; `models/League.js` Z. 11 `ageGroup`. `CLAUDE.md` Abschnitt 0. |
| Der öffentliche Profil-Endpunkt gibt `age` **und** `birthdate` aus — **ohne Auth-Check**. | **[BELEGT]** `app/api/player/fetchsingleplayerinfo/route.js` Z. 7–8 (`PUBLIC_FIELDS` enthält `age birthdate`); kein Token-Check im Handler. |
| `birthdate` ist **optional** und wird nur im Profil nachgepflegt. Die Registrierung fragt **kein Alter** ab. | **[BELEGT]** `app/signup/page.js` erhebt ausschließlich Vorname, Nachname, E-Mail, Passwort. `app/player/edit-profile/page.js` Z. 218 pflegt `birthdate` nachträglich. |
| Die Registrierung enthält **keine** Einwilligungs-Abfrage, **keine** Bestätigung der Datenschutzerklärung und **keinen Link** zur Datenschutzerklärung. | **[BELEGT]** `app/signup/page.js` — Grep nach `datenschutz`/`Einwillig`/`checkbox` = 0 Treffer, auch in `components/layout/AuthShell.js`. |
| Die Datenschutzerklärung hat **keinen Abschnitt zu Minderjährigen** und nennt als Rechtsgrundlage für Profildaten Art. 6 Abs. 1 lit. b DSGVO (Vertrag). | **[BELEGT]** `app/datenschutz/page.js` Z. 24–45, Abschnitte 2 und 4. |
| Eine Ligazuordnung ist technisch ableitbar: `Player.teamId` → `Team.leagueId` → `League.ageGroup`. | **[BELEGT]** `models/Team.js` Z. 30, `models/League.js` Z. 11. |
| Ob heute tatsächlich minderjährige Nutzer registriert sind. | **[UNGEPRÜFT]** — ich habe `hoops_prod` bewusst nicht angefasst. Siehe 1.6, Schritt 0. |

**Die neue Verarbeitung, um die es geht:** Aus vorhandenen Feldern wird eine **Bilddatei**
zusammengestellt, die Klarnamen, Verein, Liga, Datum und Leistungsdaten einer Person trägt,
und die **zu dem Zweck erzeugt wird, die Plattform zu verlassen** (Instagram, WhatsApp,
Vereinsgruppen — so ausdrücklich im Konzept, Abschnitt 1 und 4).

## 1.2 Berührte Normen — **alles [ANNAHME]**, Stand meiner Kenntnis 13.08.2026

> Keine dieser Einordnungen ist gesicherte Auskunft. Ich nenne sie, damit ein Anwalt in
> Minuten sieht, worüber wir reden — nicht, damit Patrick sie für geklärt hält.

| Norm | Warum vermutlich berührt | Wie sicher ich mir bin |
|---|---|---|
| **Art. 6 Abs. 1 DSGVO** (Rechtsgrundlage) | Jede Verarbeitung braucht eine. Für die Erzeugung einer Verbreitungs-Bilddatei ist **lit. b (Vertragserfüllung)** — die heute in der Datenschutzerklärung steht — nach meinem Verständnis eher schwach: Die Karte ist nicht zur Erbringung des Dienstes erforderlich. In Betracht kommen **lit. a (Einwilligung)** oder **lit. f (berechtigtes Interesse)**. | hoch, dass die Frage sich stellt; **offen**, welche Grundlage trägt |
| **Art. 6 Abs. 4 DSGVO** (Zweckänderung) | „Profil auf der Website" und „Datei, die zur Verbreitung auf Fremdplattformen erzeugt wird" sind vermutlich **nicht derselbe Zweck**. Genau das ist Neles Beobachtung („eine eigene Kategorie") in Normform. | mittel-hoch |
| **Art. 8 DSGVO** (Einwilligung eines Kindes bei Diensten der Informationsgesellschaft) | Wenn die Rechtsgrundlage Einwilligung ist, gilt für Kinder eine Altersschwelle. **[ANNAHME]** In Deutschland dürfte **16 Jahre** gelten (Deutschland hat die Öffnungsklausel des Art. 8 Abs. 1 UAbs. 2 nach meinem Kenntnisstand nicht zur Absenkung genutzt) — darunter braucht es die Einwilligung/Zustimmung des Trägers der elterlichen Verantwortung. **Art. 8 Abs. 2** verlangt zusätzlich „angemessene Anstrengungen", diese Zustimmung zu verifizieren. | Schwelle: mittel — **ausdrücklich zu bestätigen**; Pflicht dem Grunde nach: hoch |
| **§§ 107, 108 BGB** (beschränkte Geschäftsfähigkeit, 7–17) | Ob eine datenschutzrechtliche Einwilligung ein Rechtsgeschäft ist, das der Zustimmung des gesetzlichen Vertreters bedarf, oder ob es allein auf die **Einsichtsfähigkeit** ankommt, ist — soweit ich es überblicke — **in der Literatur umstritten und nicht abschließend geklärt**. | **niedrig — genau deshalb Anwaltsfrage** |
| **Erwägungsgrund 38 DSGVO** | Kinder verdienen besonderen Schutz, „insbesondere" bei Marketing und Erstellung von Persönlichkeits-/Nutzerprofilen. Eine Karte, die zur Verbreitung gebaut wird, liegt nahe an dieser Formulierung. | mittel-hoch |
| **Art. 5 Abs. 1 lit. a und c DSGVO** | Transparenz und Datenminimierung. Ein öffentlich abrufbares `birthdate` eines Minderjährigen ist unter „Datenminimierung" erklärungsbedürftig. | hoch |
| **Art. 12 Abs. 1 S. 1 DSGVO** | Informationen an ein Kind müssen in kindgerechter Sprache erfolgen. Heute gibt es gar keine Information am Erhebungspunkt. | hoch |
| **Art. 13 DSGVO** (Informationspflicht bei Erhebung) | Auf `/signup` fehlt jeder Hinweis und jeder Link zur Datenschutzerklärung. Das ist unabhängig von der Karte. | hoch |
| **Art. 25 DSGVO** (Datenschutz durch Technikgestaltung **und Voreinstellungen**) | Abs. 2 verlangt, dass **voreingestellt** nur die für den Zweck erforderlichen Daten verarbeitet werden. Eine Sperre, die bei leerem Altersfeld **durchlässt**, ist unter Abs. 2 schwer zu begründen. Das ist der Kern von 1.4. | hoch |
| **Art. 35 DSGVO** (Datenschutz-Folgenabschätzung) | **[ANNAHME]** Verarbeitung von Daten schutzbedürftiger Personen (Kinder) in Verbindung mit öffentlicher Verbreitung könnte eine DSFA auslösen. Die Positivlisten der deutschen Aufsichtsbehörden führen Verarbeitungen zu Kindern auf. | mittel — **vom Anwalt zu prüfen** |
| **§ 22, § 23 KUG** (Recht am eigenen Bild) | **Vermutlich NICHT einschlägig, solange kein Foto drauf ist.** Ein KUG-„Bildnis" ist die Abbildung einer Person. Eine typografische Karte ist eine Bilddatei, aber kein Bildnis. **Wichtige Präzision:** Dass das Ergebnis ein `.png` ist, macht es nicht zum Bildrechtsfall. **Sobald Nele Punkt 6 (Profilfoto) kippt, kippt auch das** — dann ist § 22 KUG plus bei Minderjährigen die Einwilligung der Sorgeberechtigten das beherrschende Thema. | hoch (dass es heute nicht greift) |
| **Allg. Persönlichkeitsrecht**, Art. 2 Abs. 1 i.V.m. Art. 1 Abs. 1 GG | Namensnennung + Leistungsdaten + gezielte Verbreitung. Bei Minderjährigen wiegt es schwerer. | mittel |

**Nicht berührt, obwohl es naheliegt:** Die Nennung des **gegnerischen Vereins** ist keine
Verarbeitung personenbezogener Daten — ein Verein ist eine juristische Person (Antwort auf
Neles Punkt 2, ausführlicher in Abschnitt 4).

## 1.3 Erzeugbarkeit vs. Weitergabe — die Frage ist richtig gestellt und die Antwort ist unbequem

**[ANNAHME]** Das sind **zwei getrennte Verarbeitungen mit zwei getrennten Verantwortlichen**,
und die zweite entlastet die erste nicht:

**(a) Die Erzeugung durch die Plattform.** Patrick ist hier Verantwortlicher (Art. 4 Nr. 7
DSGVO). Der Umstand, dass ein Nutzer den Knopf drückt, macht die Plattform nach meinem
Verständnis **nicht** zum bloßen Werkzeug: Sie hat entschieden, **welche Felder** zusammen
auf ein Blatt kommen, sie hat es **gestaltet**, sie **bietet es aktiv an** (das Konzept sieht
in Abschnitt 3 ausdrücklich ein aktives Angebot bei Anlässen vor), und sie erzeugt es **zu
dem Zweck, dass es die Plattform verlässt**. „Die Seite bietet es nur an" ist deshalb
**keine Entlastung, sondern genau der Punkt** — das Anbieten ist die Verarbeitung.

**(b) Die Weitergabe durch den Nutzer.** Das ist die eigene Verarbeitung des Nutzers.
Für rein persönliche/familiäre Tätigkeiten greift die **Haushaltsausnahme**
(Art. 2 Abs. 2 lit. c DSGVO) — bei einer geschlossenen WhatsApp-Gruppe vermutlich eher, bei
einem öffentlichen Instagram-Post vermutlich eher **nicht**. **Aber:** Das ist nicht Patricks
Verantwortungsbereich und darf die Prüfung von (a) nicht ersetzen. Wer sagt „der Nutzer teilt
ja selbst", hat die Frage nach (a) nicht beantwortet, sondern übersprungen.

**Der Unterschied ist für Patrick praktisch, nicht akademisch:** Er kann (a) gestalten und
absichern. Auf (b) hat er keinen Einfluss — und deshalb darf er (b) auch nicht als Rechtfertigung
für (a) verbuchen.

### 🔎 Ein Fund, den Nele nicht gestellt hat: Karte B nennt einen Dritten

**[BELEGT]** Konzept Abschnitt 2.5: Die **Ergebniskarte des Teams** wird vom **Team-Admin**
erzeugt und trägt die Zeile `MEISTE PUNKTE: M. MUSTERMANN (24)`.

Das ist eine Karte über **eine Person, die den Knopf nicht gedrückt hat**, erzeugt von
**einer anderen Person**. Bei einer Jugendmannschaft heißt das: Ein erwachsener Team-Admin
erzeugt eine Verbreitungs-Datei mit dem Klarnamen eines Minderjährigen aus seinem Team.
Neles Liga-Sperre würde diesen Fall zwar mitfangen — aber die Konstellation ist **eigenständig
und bleibt auch bei Volljährigen bestehen**. Sie gehört mit auf den Anwalts-Tisch.

## 1.4 Neles Vorschlag: entschärft er die Frage oder verschiebt er sie?

> Neles Vorschlag: *„Karten für Jugendligen komplett gesperrt — nicht nur ‚kein Angebot',
> sondern gar nicht erzeugbar."*

**Meine Einordnung: Er verschiebt sie, aber er ist trotzdem richtig.** Beides gehört gesagt.

### Warum er verschiebt (drei Lücken)

**Lücke 1 — die Sperre setzt an der Liga an, die Rechtsfrage an der Person.**
Ein Jugendlicher, der in einer Herren-Kreisligamannschaft mitspielt, ist minderjährig, liegt
aber **außerhalb** einer ligabasierten Sperre. **[UNGEPRÜFT]** Ob und wie häufig das im
WBV-Spielbetrieb vorkommt („Hochspielen"), weiß ich nicht aus einer Quelle — **das können
Patrick und Jonatan aus eigener Anschauung in einer Minute beantworten**, und die Antwort
entscheidet, wie groß diese Lücke ist. Sie ist der wichtigste offene Tatsachenpunkt dieses
Abschnitts.

**Lücke 2 — das Altersfeld ist leer und die Voreinstellung ist durchlässig.**
Genau die Warnung aus dem Auftrag, und sie trägt. `birthdate` ist optional, die Registrierung
fragt es nicht ab. Eine Sperre der Form „sperre, **wenn** Alter < 18" bedeutet im Regelfall:
**sperrt nicht**. Und der Umkehrschluss „kein Geburtsdatum ⇒ volljährig" ist keine Feststellung,
sondern eine Vermutung zu eigenen Gunsten. **[ANNAHME]** Unter Art. 25 Abs. 2 DSGVO
(datenschutzfreundliche **Voreinstellung**) ist das die schwer begründbare Richtung — die
Voreinstellung müsste „keine Karte" sein, nicht „Karte, außer …".

**Lücke 3 — die Grundfrage bleibt für Erwachsene offen.**
Die Minderjährigkeit **verschärft** die Frage nach der Rechtsgrundlage, sie **erzeugt** sie
nicht. Auch für einen 24-jährigen Bezirksligaspieler gibt es heute keine dokumentierte
Rechtsgrundlage für „Bilddatei mit Klarnamen zur Verbreitung erzeugen", und die
Datenschutzerklärung nennt keine. Wer die Jugend sperrt und den Rest ungeprüft startet,
hat den **auffälligsten** Fall gelöst und den **häufigsten** nicht.

### Warum er trotzdem richtig ist

- Er senkt die **Severity** des Restrisikos erheblich — der schutzbedürftigste Personenkreis
  ist raus.
- Er ist **billig**: `Team.leagueId → League.ageGroup ∈ {U18, U16}` ist ein Bestandsdatum,
  keine neue Erhebung. **[BELEGT]** Die Felder existieren.
- Er ist ein **dokumentierbarer Beleg** für Art. 25 DSGVO — eine bewusste, vor dem Bau
  getroffene und schriftlich begründete Schutzentscheidung ist gegenüber einer Aufsichtsbehörde
  etwas anderes als eine nachträgliche Erklärung. **Dieses Dokument ist Teil dieses Belegs.**
- Er kostet nichts: Es gibt heute faktisch keine bespielten Jugendligen mit echten Teams
  (**[BELEGT]** 1 externes Team, `CLAUDE.md`).

**Fazit: Die Sperre ist notwendig und nicht hinreichend.** Sie darf nicht als Erledigung
verbucht werden — genau das wäre die bequeme erfundene Sicherheit.

## 1.5 Der praktikable, ehrliche Zwischenweg

Ich schlage **nicht** vor, was zulässig ist — ich schlage vor, **was Patrick entscheiden kann,
ohne dass jemand so tut, als sei die Frage geklärt.** Drei Stufen, aufsteigend im Risiko:

### Stufe 0 — sofort startbar, ohne Anwalt: der **Link statt der Datei**

Die Karte erzeugt zunächst **keine Bilddatei**, sondern nur einen **Link** auf die Seite,
die es ohnehin schon öffentlich gibt (`/p/<slug>`, `/match/<id>`).

- **Warum das rechtlich anders liegt [ANNAHME]:** Es entsteht **keine neue
  Zusammenstellung**, die die Plattform verlässt und dort dauerhaft weiterlebt. Ein Link
  zeigt auf einen Bestand, der jederzeit korrigierbar und **löschbar** ist — eine verteilte
  Bilddatei ist es nicht. Genau diese **Irreversibilität** ist der Kern des Unterschieds
  zwischen Karte und Profil, den Nele zutreffend gespürt hat.
- **Was es kostet:** Den Kern des Konzepts. Eine Karte, die kein Bild ist, ist keine Karte.
- **Wofür es trotzdem taugt:** Es macht `?src=`-Messung (Konzept 4.2/4.3) und den ganzen
  Rückweg **sofort** baubar und misst schon, ob überhaupt jemand teilt — Neles eigene
  **[HYPOTHESE]** aus Konzept Abschnitt 8 („ob Z1 die Karte wirklich teilt") wird so
  validiert, **bevor** Geld für einen Anwalt und Aufwand für Bilderzeugung ausgegeben wird.
  Das ist auch der Ines-Punkt: erst messen, dann investieren.

### Stufe 1 — die enge Variante: drei kumulative Tore, Voreinstellung „nein"

Wenn Patrick die Bilddatei will, ohne dass die Rechtsgrundlagenfrage schon beantwortet ist,
ist **das** die Form, die ich einem Anwalt vorlegen würde — **nicht als geklärt, sondern als
Vorschlag mit einer präzisen Frage daran**:

1. **Liga-Tor:** keine Karte, wenn `League.ageGroup ∈ {U18, U16}`. (Neles Sperre.)
2. **Datums-Tor:** keine Karte, wenn `birthdate` gesetzt **und** Alter < 18.
3. **Voreinstellungs-Tor — der entscheidende:** keine Karte, wenn `birthdate` **leer** ist.
   Statt durchzulassen fragt die Karte **an der Stelle der Erzeugung** einmalig nach dem
   Geburtsdatum, mit ehrlichem Grund („damit wir keine Karten von Minderjährigen erzeugen").

Punkt 3 dreht die Voreinstellung um: aus „erzeugt, außer wir wissen es besser" wird
„erzeugt nur, wo wir es wissen". Das ist der einzige Teil, der die Lücke aus 1.4 wirklich
schließt — und er ist **billiger als er klingt**, weil er nichts an der Registrierung ändert
und nur die Leute trifft, die tatsächlich eine Karte wollen.

**Die Ehrlichkeitsgrenze dieses Weges, die mitgesagt gehört:**
Eine **Selbstauskunft ist keine Altersprüfung**. Ein 15-Jähriger, der ein falsches Datum
einträgt, ist damit nicht draußen. Ob eine Selbstauskunft als „angemessene Anstrengung"
im Sinne von **Art. 8 Abs. 2 DSGVO** genügt, **weiß ich nicht** — und das ist exakt eine der
Fragen an den Anwalt (F1-b unten). Wer sagt, das reiche schon, erfindet Sicherheit.

### Stufe 2 — vollständig: Einwilligung als tragende Grundlage

Nur nach Anwaltsprüfung. Bedeutet: echte, granulare, widerrufliche Einwilligung für die
Kartenerzeugung, dokumentiert, mit Nachweis (Art. 7 Abs. 1 DSGVO) — und für Minderjährige
zusätzlich der Weg über die Sorgeberechtigten. **Das ist ein Produktbaustein, kein Textbaustein.**
Ich formuliere ihn nicht.

**Meine Empfehlung an Patrick (kein Beschluss, seine Entscheidung):**
**Stufe 0 jetzt bauen, Stufe 1 dem Anwalt vorlegen, Stufe 2 nur wenn Stufe 1 nicht trägt.**
Begründung: Stufe 0 kostet nichts an Rechtssicherheit, liefert die Messung, die Neles
Kernhypothese prüft, und hält den Septembertermin (erste echte Spiele) offen.

## 1.6 Was Patrick selbst entscheiden kann — und was zwingend zum Anwalt geht

### ✅ Kann Patrick allein entscheiden (heute, ohne Kosten)

| Entscheidung | Anmerkung |
|---|---|
| Jugendligen-Sperre umsetzen (ja/nein) | Eine Schutzentscheidung nach oben ist nie beratungspflichtig. Ich empfehle: ja. |
| Stufe 0 (Link statt Datei) bauen lassen | Erzeugt keine neue Verarbeitung. |
| Kein Profilfoto auf der Karte (Neles 2.4) | Vermeidet § 22 KUG vollständig. Kostenlos. |
| Vivien und Nele weiterarbeiten lassen (Entwurf, Wortlaut, Formate) | 🟢 — keine Verarbeitung, kein Risiko. **Das sollte er tun, es blockiert sonst grundlos.** |
| **Schritt 0: zählen lassen, ob es überhaupt Minderjährige gibt** | Eine reine **Lese**-Abfrage auf `hoops_prod`: Profile mit gesetztem `birthdate` und Alter < 18, plus Teams in Ligen mit `ageGroup ∈ {U18, U16}`. **Macht die Dringlichkeit belegt statt gefühlt** und kostet fünf Minuten. Ich habe sie bewusst nicht selbst ausgeführt. |
| Reihenfolge festlegen: Klärung vor Bau | Siehe Ampel. |

### ⚖️ Muss zwingend an einen Anwalt (Fachrichtung: **IT-/Datenschutzrecht**, gern mit Bezug zu Vereins-/Sportdaten)

Formuliert als **entscheidbare Fragen**, nicht als Themen — damit ein Erstgespräch kurz bleibt:

> **F1-a** Auf welche Rechtsgrundlage nach Art. 6 Abs. 1 DSGVO stützt sich die
> Veröffentlichung der Profildaten (Name, Verein, Statistiken, **Geburtsdatum**) auf einem
> **ohne Login** abrufbaren Profil — und trägt die heute in der Datenschutzerklärung genannte
> lit. b (Vertragserfüllung) das, oder braucht es lit. a oder lit. f?
> *(Diese Frage ist der Hebel: Sie ist ohnehin offen — `dec-datenschutz` seit 02.07. — und
> beantwortet zugleich die halbe Kartenfrage.)*
>
> **F1-b** Ist die **Erzeugung einer teilbaren Bilddatei mit Klarnamen, Verein, Liga und
> Leistungsdaten zum Zweck der Verbreitung auf Fremdplattformen** eine Zweckänderung
> gegenüber der Profil-Veröffentlichung (Art. 6 Abs. 4 DSGVO)? Falls ja: welche Grundlage
> trägt sie?
>
> **F1-c** Genügt für Minderjährige ab 16 die **eigene** Einwilligung, oder braucht es
> in jedem Fall die Sorgeberechtigten? Welche Altersschwelle gilt in Deutschland konkret
> (Art. 8 Abs. 1 DSGVO i.V.m. deutschem Umsetzungsrecht), und welche Rolle spielen
> §§ 107, 108 BGB neben Art. 8 DSGVO?
>
> **F1-d** Genügt eine **Selbstauskunft zum Geburtsdatum an der Stelle der Erzeugung**
> als „angemessene Anstrengung" nach Art. 8 Abs. 2 DSGVO — oder verlangt diese Verarbeitung
> mehr?
>
> **F1-e** Ist die skizzierte **Stufe 1** (drei kumulative Tore, Voreinstellung „keine Karte")
> ein tragfähiger Weg, oder muss vor dem ersten erzeugten Bild eine echte Einwilligungslösung
> stehen?
>
> **F1-f** Löst diese Verarbeitung eine **Datenschutz-Folgenabschätzung** nach Art. 35 DSGVO
> aus (Daten Minderjähriger, Verbreitungszweck)?
>
> **F1-g** Sonderfall: Ein **Team-Admin** erzeugt eine Karte, die **einen anderen Spieler**
> namentlich nennt (Konzept 2.5). Ändert das die Bewertung — bei Erwachsenen und bei
> Minderjährigen?
>
> **F1-h** Bestandsfrage, unabhängig von der Karte: Ist die **öffentliche Ausgabe von
> `birthdate`** (nicht nur `age`) über einen ungeschützten Endpunkt mit Art. 5 Abs. 1 lit. c
> DSGVO (Datenminimierung) vereinbar?

**Kostenhinweis (Ines):** Das ist ein Erstberatungsmandat im IT-/Datenschutzrecht mit
**acht klar umrissenen Fragen** — kein offener Prüfauftrag. Das ist der Grund, warum ich sie
so formuliert habe: Ein Anwalt, der acht entscheidbare Fragen bekommt, ist deutlich günstiger
als einer, der ein Konzept liest und sich den Sachverhalt selbst erarbeiten muss. Ein Betrag
steht mir nicht zu — aber **„spar dir den Anwalt" ist hier keine Option, die ich vertreten
würde**, und der Posten gehört ehrlich in die Monetarisierungs-Rechnung.

## 1.7 Optionen — inklusive „nichts tun"

| Option | Was sie löst | Was sie kostet | Restrisiko |
|---|---|---|---|
| **A — Nichts tun, Karte nicht bauen** | Kein neues Risiko. | Der Septembermoment (erste echten bestätigten Spiele) verstreicht ohne Karte — Neles Argument aus 1.4, das ich für stark halte. | **Nicht null:** Der **Bestand** (1c) bleibt unverändert offen. „Nichts tun" beseitigt nicht, was live ist. |
| **B — Karte bauen wie konzipiert, ohne Klärung** | Nichts. | — | 🔴 Höchstes Risiko. Ausdrücklich **nicht** meine Empfehlung. |
| **C — Nur Jugendligen-Sperre, sonst wie konzipiert** | Den auffälligsten Fall. | gering | 🟠 Lücken 1–3 aus 1.4 bleiben. Fühlt sich sicherer an, als es ist — die gefährlichste der vier Optionen, weil sie zur Erledigung verbucht wird. |
| **D — Stufe 0 jetzt, Stufe 1 nach Anwalt** | Termin gehalten, Hypothese gemessen, Risiko nicht erhöht. | Anwaltskosten (planbar), Karte kommt später als Bild. | 🟡 Bestand (1c) bleibt, wird aber durch F1-a mitgeklärt. |

## 1.8 Dringlichkeit — belegt, nicht gefühlt

**Systematik:** Severity × Likelihood (Herkunft: `legal:legal-risk-assessment`, US-Vorlage;
nur das Raster übernommen).

| Sachverhalt | Severity | Likelihood | Score | Stufe |
|---|---|---|---|---|
| Karte gebaut wie konzipiert (B) | **4** — Aufsichtsbehördliches Verfahren möglich; Reputationsschaden **genau in der Zielgruppe, die gewonnen werden soll** (Vereine, Eltern, Ehrenamt); Art. 83 DSGVO. | **3** — möglich: Vereine und Eltern sind aufmerksam, und die Karte ist per Konstruktion **sichtbar**. | **12** | 🟠 **HOCH → externe Prüfung** |
| Bestand 1c (öffentliches Profil mit `birthdate`, keine Altersabfrage) — **ist live** | **3** | **2** — 9 externe Nutzer, keine bekannte Beschwerde. **Trigger:** steigt auf 4, sobald ab September Jugendmannschaften erreicht werden. | **6** | 🟡 **MITTEL, mit Zünder** |
| Karte nicht gebaut, Bestand unverändert | 3 | 2 | 6 | 🟡 |

**Belege für die Einstufung** (keine gefühlte Dringlichkeit):
- Die Verarbeitung ist **noch nicht gebaut** — es gibt kein laufendes Risiko aus der Karte.
  **[BELEGT]** Konzept: „Nichts gebaut, nichts committet."
- Es gibt heute **faktisch keine erzeugbare echte Karte** — 1 externes Team, und die
  Doppelbestätigung braucht zwei. **[BELEGT]** `CLAUDE.md`, Konzept 1.4.
- **Deshalb ist Zeit da.** Die Dringlichkeit ist **nicht** „sofort", sondern **„vor dem Bau,
  und der Bau ist für September relevant"**. Der ehrliche Termin ist damit:
  **Anwaltsgespräch bis Ende August**, nicht heute Nacht.
- Der **Bestand (1c)** ist der Teil, der jetzt läuft — er ist der Grund, warum die Sache
  nicht auf „irgendwann" darf.

---

# Frage 2 — Sponsorenlogo und Werbekennzeichnung

## 2.1 Sachverhalt

Nele hat das Sponsorenlogo **bewusst nicht** auf die Karte gesetzt (**[BELEGT]** Konzept 2.4,
Tabelle „Was ausdrücklich NICHT drauf steht") und die Frage an mich weitergereicht.
Monetarisierung ist plattformweit gesperrt bis zur Gewerbeanmeldung (**[BELEGT]** `CLAUDE.md`
Roadmap #3; `ZIELGRUPPEN.md` Z5). `dec-gewerbe` ist **konditioniert** („erst bei Einnahmen"),
**nicht terminiert** (Memory-Index, Budget & Freigaben).

## 2.2 Berührte Normen — **alles [ANNAHME]**

| Norm | Warum vermutlich berührt |
|---|---|
| **§ 5a Abs. 4 UWG** (Nichtkenntlichmachen des kommerziellen Zwecks) | Die zentrale Norm der „Werbung"-Kennzeichnung in sozialen Medien seit der UWG-Novelle 2021/22. |
| **§ 5a Abs. 4 S. 2 UWG** | Die sog. Influencer-Klausel: Ein kommerzieller Zweck **zugunsten eines fremden Unternehmens** liegt **nicht** vor, wenn **keine Gegenleistung** gewährt oder versprochen wurde. **Das ist der entscheidende Satz für den Spieler.** |
| **§ 8 Abs. 2 UWG** (Zuwiderhandlungen von Mitarbeitern und **Beauftragten**) | Der Hebel, über den ein Verstoß des Nutzers auf Patrick zurückschlagen könnte — falls der teilende Nutzer als „Beauftragter" gilt. |
| **§ 6 DDG** (Digitale-Dienste-Gesetz, Trennungsgebot für kommerzielle Kommunikation; früher § 6 TMG) | Kommerzielle Kommunikation muss als solche klar erkennbar sein. |
| **§ 22 MStV** (Werbekennzeichnung in Telemedien) | Parallelnorm, je nach Einordnung des Angebots. |
| **§ 14 GewO** (Anzeigepflicht bei Gewerbeaufnahme) | Entgeltliche Werbefläche = gewerbliche Tätigkeit. |
| **§ 5 DDG** (Impressumspflicht; früher § 5 TMG) | Besteht bereits; ein Impressum ist vorhanden. |
| **§ 5 UWG** (Irreführung) | Falls die Karte den Eindruck erweckt, der Sponsor sei Partner des Vereins oder der Liga. |

## 2.3 Meine Einordnung — mit klarer Trennung zwischen wahrscheinlich und offen

**Wer trüge die Verantwortung? [ANNAHME]** Nicht „entweder — oder", sondern **beide,
in unterschiedlichen Rollen**:

- **Der Nutzer, der postet**, ist derjenige, der die geschäftliche Handlung vornimmt. Die
  Kennzeichnungspflicht trifft im Ausgangspunkt **ihn**.
- **Aber:** Nach § 5a Abs. 4 S. 2 UWG entfällt der kommerzielle Zweck zugunsten eines fremden
  Unternehmens, wenn er **keine Gegenleistung** erhält. Ein Spieler, der aus Freude über
  24 Punkte eine Karte repostet, auf der zufällig ein Sponsorenlogo klebt, dürfte danach
  **eher nicht** kennzeichnungspflichtig sein. **[ANNAHME, mittlere Sicherheit]**
- **Das kippt aber sofort**, wenn er irgendetwas dafür bekommt — Gewinnspiel-Teilnahme,
  Freimonat, Sichtbarkeitsvorteil, Prämie. Dann ist die Gegenleistung da, und mit ihr die Pflicht.
- **Für Patrick** ist die Frage über § 8 Abs. 2 UWG relevant: Ist ein Nutzer, dem die Plattform
  ein fertiges Werbemittel in die Hand drückt, ein „Beauftragter"? **[ANNAHME]** Bei rein
  freiwilligem Teilen ohne Gegenleistung eher nicht — aber ich bin mir hier **nicht sicher**,
  und das ist genau die Stelle, an der ich nicht raten will.

**Neles eigentlicher Punkt ist aber kein juristischer, und er trägt:**
> *„Wir würden dem Nutzer eine Pflicht anhängen, die er nicht bestellt hat."*

Das stimmt unabhängig vom Ausgang der Rechtsfrage. Und es kollidiert direkt mit `ZIELGRUPPEN.md`
Z2 („jede Funktion, die ihm zusätzliche Pflegearbeit auferlegt, kämpft gegen diese Realität")
und mit dem Ton in `MARKE.md`. **Der Produktgrund gegen das Logo ist stärker als der rechtliche
Zweifel** — und er ist entscheidbar, ohne dass jemand einen Anwalt bezahlt.

## 2.4 Der Zusammenhang mit `dec-gewerbe` — der praktisch wichtigste Absatz zu Frage 2

Drei Sätze, die zusammengehören:

1. **Das Logo ist nicht „später mal" — es ist der Auslöser.** `dec-gewerbe` ist konditioniert
   auf „erst bei Einnahmen". Ein entgeltliches Sponsorenlogo **erzeugt** diese Einnahmen. Die
   Karte mit Logo ist damit keine Gestaltungsfrage, sondern der Vorgang, der die Bedingung
   erfüllt. **[ANNAHME]** § 14 GewO knüpft die Anzeigepflicht an die **Aufnahme** der
   Tätigkeit, nicht an den Zahlungseingang.

2. **Die fehlende Gewerbeanmeldung ist keine Schutzschicht — sie ist ein zweites Problem.**
   Das ist der unbequeme Teil. **[ANNAHME]** Die Unternehmereigenschaft im Sinne des UWG und
   die Verantwortlichkeit im Sinne der DSGVO hängen **nicht** an der Anmeldung. Wer ohne
   Anmeldung eine entgeltliche Werbefläche betreibt, hat beide Fragen gleichzeitig — plus
   die steuerliche. Es gibt hier keine Reihenfolge, in der „erstmal ohne" die sichere ist.

3. **Daraus folgt eine klare Reihenfolge, die Patrick allein festlegen kann:**
   **Gewerbe zuerst, Logo danach.** Nicht umgekehrt, und nicht gleichzeitig.

**Kostenehrlichkeit (Ines):** Gewerbeanmeldung, ggf. Steuerberater und die
Werbekennzeichnungs-Prüfung sind **echte Posten der Monetarisierung**, keine Formalie am
Rand. Sie gehören in die Rechnung, bevor eine Sponsorenzusage steht — nicht danach.

## 2.5 Was Patrick entscheiden kann, was zum Anwalt geht

### ✅ Allein entscheidbar
- **Kein Sponsorenlogo auf Leistungskarten — dauerhaft.** Neles Neigung. Braucht keinen Anwalt,
  kostet heute nichts (Monetarisierung ist ohnehin gesperrt), und beseitigt die Frage
  vollständig statt sie zu verwalten. **Meine klare Empfehlung.**
- Die Reihenfolge „Gewerbe zuerst, Logo danach" festhalten.
- Werbeflächen auf der Seite belassen (dort ist die Kennzeichnung Patricks eigene Aufgabe und
  er hat sie in der Hand).

### ⚖️ Zum Anwalt — **nur falls Patrick das Logo wirklich will**
> **F2-a** Muss ein Nutzer, der ohne Gegenleistung eine von der Plattform erzeugte Grafik mit
> Sponsorenlogo teilt, den Beitrag nach § 5a Abs. 4 UWG als Werbung kennzeichnen?
>
> **F2-b** Haftet der Plattformbetreiber für eine fehlende Kennzeichnung durch den Nutzer —
> insbesondere über § 8 Abs. 2 UWG (Beauftragteneigenschaft)?
>
> **F2-c** Ab welchem Punkt löst die Werbefläche die Anzeigepflicht nach § 14 GewO aus:
> Aufnahme, erste Zusage oder erster Zahlungseingang?
>
> **F2-d** Welche Kennzeichnung braucht die Werbefläche **auf der Seite selbst**
> (§ 6 DDG / § 22 MStV)?

## 2.6 Dringlichkeit — belegt

| Sachverhalt | Severity | Likelihood | Score | Stufe |
|---|---|---|---|---|
| Logo ohne Klärung + ohne Gewerbe | 3 | 3 | **9** | 🟡 obere Kante |
| **Entscheidung „kein Logo"** | — | 1 | **≤3** | 🟢 |

**Belegte Nicht-Dringlichkeit:** Monetarisierung ist gesperrt, es gibt **einen** Sponsoren-Kandidaten,
und Nele hat das Logo bereits weggelassen. **[BELEGT]** `ZIELGRUPPEN.md` Z5, Konzept 2.4.
**Diese Frage ist heute nicht dringend — sie ist nur dann dringend, wenn Patrick das Logo will.**
Dann aber vor dem ersten Gespräch mit dem Kandidaten, nicht danach.

---

# Frage 3 — Sponsoren-Report: die ungefilterten Zahlen

## 3.1 Sachverhalt (Fakten, mit Quelle)

| Fakt | Beleg |
|---|---|
| Der Report zeigte `p.users.total` und `p.teams.total` — `countDocuments({})` ohne Basisfilter, also **inkl. Demo-Fixtures und interner Testkonten**. Gemessen: **70 Teams** (68 `isDemo`) und **410 Profile**, während ehrlich **1 externes Team** und **9 externe Nutzer** waren. Faktor ~70 bzw. ~45. | **[BELEGT]** Commit `024b2ed`, 13.08.2026, 01:59 Uhr. |
| Der Code sagte über die gefilterten Zahlen wörtlich, sie seien die einzigen, die man nach außen zeigen dürfe — der Report benutzte die anderen. | **[BELEGT]** Commit-Text `024b2ed`, Bezug `lib/analyticsSummary.js` Z. 137. |
| Der Report ist ein **teilbarer, passwortgeschützter Link**, der das Haus verlässt. | **[BELEGT]** `app/sponsor-report/[token]`, `models/ReportShare.js`. |
| **Er ist niemandem gezeigt worden.** | **[BELEGT]** Bestätigung Patrick (im Auftrag). |
| Korrigiert: Der Endpunkt baut jetzt eine **Positivliste** neu auf, statt das interne Summary zu kürzen — mit ausdrücklicher Begründung im Code. | **[BELEGT]** `app/api/analytics/public-report/route.js` Z. 7–45, 100–106. |

## 3.2 Was gegolten hätte, wenn er hinausgegangen wäre — **[ANNAHME]**

| Norm | Einordnung | Wer könnte was |
|---|---|---|
| **§ 5 UWG** (irreführende geschäftliche Handlung) | Angaben über wesentliche Merkmale und den Umfang der Leistung. Gilt auch **gegenüber Unternehmern**. | **Wichtige Präzision:** Nach § 8 Abs. 3 UWG sind **Mitbewerber und Verbände** anspruchsberechtigt — **nicht der getäuschte Kunde selbst**. Ein Sponsor hätte aus dem UWG **keinen eigenen Anspruch**. Das wird oft falsch erinnert. |
| **§ 311 Abs. 2, § 241 Abs. 2, § 280 Abs. 1 BGB** (culpa in contrahendo) | **Der praktisch schärfste Hebel.** Verletzung vorvertraglicher Aufklärungspflichten — **Fahrlässigkeit genügt**, kein Vorsatz nötig. | Der Sponsor selbst: Schadensersatz, ggf. Lösung vom Vertrag. |
| **§ 123 BGB** (Anfechtung wegen arglistiger Täuschung) | Setzt **Vorsatz** voraus. Hier lag ein Programmierfehler vor, kein Vorsatz — **greift nach meiner Einschätzung nicht**. | Sponsor: Anfechtung. |
| **§ 313 BGB** (Wegfall der Geschäftsgrundlage) | Falls die Reichweitenzahl erkennbar Geschäftsgrundlage des Sponsorings war. | Sponsor: Anpassung/Rücktritt. |
| **§ 263 StGB** (Betrug) | **Setzt Vorsatz voraus — hier ersichtlich nicht gegeben.** Ich nenne die Norm nur, um die Außengrenze zu markieren: Der Unterschied zwischen „Fehler" und „Straftat" ist **allein der Vorsatz**. Wer eine als falsch erkannte Zahl stehen lässt, überschreitet diese Grenze. | — |

**Meine Einschätzung zum realen Risiko [ANNAHME]:** Ein UWG-Verfahren war nie realistisch —
es gibt keine Mitbewerber, die abmahnen würden. Der reale Schaden wäre **nicht juristisch**
gewesen, sondern der, den Ronja beschreibt und den Nele im Konzept zitiert: **wer eine
aufgeblasene Zahl entdeckt, glaubt anschließend auch der kleinen, ehrlichen nicht mehr.**
Bei **einem** Sponsoren-Kandidaten aus dem persönlichen Umfeld (**[BELEGT]** `ZIELGRUPPEN.md`
Z5) ist das **irreversibel und nicht einklagbar** — also schlimmer als ein Rechtsrisiko, nicht
milder.

## 3.3 🔎 Zwei Funde, die noch offen sind

### Fund 1 — zwei Zahlen tragen das Fehlermuster weiter

**[BELEGT]** `app/api/analytics/public-report/route.js` Z. 104–105 gibt weiterhin
`platform.matches` und `platform.leagues.total` **ungefiltert** aus.
**[BELEGT]** `components/admin/SponsorReportView.js` Z. 168–170 trägt dazu einen eigenen
Code-Kommentar: *„ACHTUNG, noch nicht sauber"* — für Spiele gebe es keine gefilterte
Entsprechung, „Ligen" sei der Katalog von 57 statt der Ligen mit echten Teams.

**Anerkennung, die dazugehört:** Die **Beschriftung wurde ehrlich nachgezogen** —
Z. 179–180 lauten jetzt „**Ligen im Katalog**" und „**Spiele inkl. Beispieldaten**".
Das ist genau die richtige Zwischenlösung und **kein Verstoß**: Eine korrekt beschriftete
Zahl ist keine irreführende Angabe. **[ANNAHME]** § 5 UWG greift bei zutreffender
Kennzeichnung nicht.

**Aber:** Es bleibt ein Dokument, das das Haus verlässt und in dem eine „57" steht, wo die
tragende Aussage „3 Ligen mit echten Teams" wäre. Ein Leser, der die Beschriftung überliest —
und im Gespräch überliest man Beschriftungen — nimmt die falsche Zahl mit. Das ist kein
Rechtsverstoß, aber es ist derselbe Vertrauensmechanismus.

### Fund 2 — der Report übermittelt Klarnamen echter Spieler an Sponsoren

**[BELEGT]** `lib/analyticsSummary.js` Z. 327/331–333: `topPlayers` enthält
`${firstName} ${lastName}` echter Spieler. **[BELEGT]** `public-report/route.js` Z. 95 gibt
das an den Sponsor weiter; **[BELEGT]** `components/admin/SponsorReportView.js` Z. 147 zeigt
es unter „Spielerprofile".

Das ist keine aggregierte Kennzahl — **das sind personenbezogene Daten, die an einen Dritten
übermittelt werden**. Drei Konsequenzen:

- **[ANNAHME]** Es braucht eine eigene Rechtsgrundlage nach Art. 6 Abs. 1 DSGVO. Der
  Passwortschutz macht die Übermittlung nicht zu einer internen Verarbeitung.
- **[BELEGT]** Die Datenschutzerklärung nennt sie nicht: Abschnitt 9 (`app/datenschutz/page.js`
  Z. 78 ff.) listet **Auftragsverarbeiter** auf — ein Sponsor ist kein Auftragsverarbeiter,
  sondern ein **Dritter mit eigenem Zweck**.
- **Verbindung zu Frage 1:** Steht ein **minderjähriger** Spieler unter den meistaufgerufenen
  Profilen, steht sein Klarname in einem Sponsorendokument. Das ist derselbe Personenkreis
  wie in Frage 1 — nur ohne dass irgendjemand einen Knopf gedrückt hat.

**Der Kommentarkopf im Endpunkt hat genau diese Sorte Fehler vorhergesagt** (Z. 7–16: „Beim
Kürzen ist jedes künftig ergänzte Feld automatisch öffentlich"). Die Positivliste hat
funktioniert — sie hat `topPlayers` aber **bewusst aufgenommen**, ohne die
Personenbezugs-Frage zu stellen. Das ist der Unterschied zwischen einer technischen und einer
rechtlichen Prüfung, und er ist der Grund, warum es mich gibt.

## 3.4 Sorgfaltspflicht künftig — was Patrick allein festlegen kann

Das ist **Prozess, nicht Recht** — hier darf ich konkret werden. Vorschlag als Regel für jede
Zahl, die das Haus verlässt (Report, Deck, Flyer, Gespräch):

1. **Herkunftspflicht.** Jede Außen-Zahl trägt intern eine benannte Herkunft: Feld/Query +
   Filter + Stichtag. Keine Zahl ohne Herkunft.
2. **Filterpflicht.** Jede Bestandszahl wird **echtheitsgefiltert** (`isDemo`, `isInternal`)
   oder **ehrlich beschriftet** — wie jetzt bei „Spiele inkl. Beispieldaten". Beides ist
   zulässig, das Weglassen von beidem nicht.
3. **Positivliste statt Negativliste.** Bereits umgesetzt und im Code begründet
   (`public-report/route.js` Z. 7–45). **Das ist vorbildlich und sollte als verbindliches
   Muster für jede künftige Außenfläche festgeschrieben werden** — nicht nur für diesen einen
   Endpunkt.
4. **Personenbezugs-Prüfung** als eigener Schritt der Positivliste: Bei jedem Feld die Frage
   „ist das eine Kennzahl oder ein Mensch?". Fund 2 wäre daran hängengeblieben.
5. **Zwei-Augen vor Außenkontakt.** Wer die Zahl erzeugt, gibt sie nicht selbst frei. Bei
   Sponsorenmaterial: Nele oder ich lesen gegen, bevor der Link herausgeht.
6. **Untergrenzen sagen, nicht Obergrenzen.** Neles Regel aus Konzept 4.5 („die gemessene Zahl
   ist systematisch eine Untergrenze") ist die richtige Haltung für **jede** Zahl gegenüber Z5.

**Warum das mehr ist als Hygiene:** Der Unterschied zwischen einem Fehler und einer Täuschung
ist der Vorsatz (3.2). **Ein dokumentierter Prozess ist der Beleg dafür, dass es ein Fehler
war.** Wer keinen hat, muss das im Zweifel behaupten. Das ist der eigentliche Grund für Punkt 1
bis 6.

## 3.5 Was zum Anwalt geht

Der **Vorfall selbst braucht keinen Anwalt** — kein Dritter hat die Zahlen gesehen, es gibt
keinen Geschädigten, keinen Vertrag, keine Forderung. **Kein Schadensfall, keine Meldepflicht.**

Mit auf den Zettel für das ohnehin nötige Datenschutz-Gespräch (Frage 1) gehört nur:

> **F3-a** Auf welcher Rechtsgrundlage dürfen **Klarnamen einzelner Spieler** samt
> Aufrufzahlen an einen Sponsor übermittelt werden (Fund 2)? Genügt Anonymisierung
> („Top-Profile: 340 Aufrufe" ohne Namen), und muss die Datenschutzerklärung eine
> Übermittlung an Dritte ausweisen?

## 3.6 Dringlichkeit — belegt

| Sachverhalt | Severity | Likelihood | Score | Stufe |
|---|---|---|---|---|
| Vorfall der Nacht (nicht gezeigt, korrigiert) | 1 | 1 | **1** | 🟢 erledigt |
| Fund 1 (`matches`/`leagues` ungefiltert, aber ehrlich beschriftet) | 2 | 3 | **6** | 🟡 |
| **Fund 2 (Klarnamen an Sponsoren)** | 3 | 3 | **9** | 🟡 obere Kante |

**Belegte Dringlichkeit für Fund 2:** Der Endpunkt ist **live und teilbar**
(**[BELEGT]** `app/sponsor-report/[token]`). Ob heute ein aktiver Share-Token existiert,
habe ich **[UNGEPRÜFT]** gelassen (`hoops_prod` nicht angefasst) — **das zu prüfen ist eine
Ein-Minuten-Abfrage auf `ReportShare` und entscheidet, ob Fund 2 auf 🟡 bleibt oder heute
gehandelt werden muss.** Falls kein aktiver Token existiert: kein akuter Handlungsbedarf,
aber vor dem ersten Sponsorengespräch zu lösen.

---

# 4. Neles übrige Fragen — kurze Einordnung, damit nichts liegen bleibt

Nele hat mir **sechs** Punkte übergeben (Konzept Abschnitt 6). Drei waren beauftragt, drei
nicht — sie liegen trotzdem auf meinem Tisch und Patrick soll nicht glauben, sie seien
erledigt.

| Neles Punkt | Meine Einordnung — **[ANNAHME]** | Ampel |
|---|---|---|
| **2 — Gegnerdaten** (Vereinsname + Spielstand des Gegners) | Ein **Verein ist eine juristische Person** — kein Personenbezug, DSGVO greift insoweit nicht. Der Spielstand ist eine Tatsache aus einem öffentlichen Wettbewerb. Dass unser Logo darauf steht, ändert daran nach meinem Verständnis **nichts** — es macht die Karte zu unserer Äußerung, aber die Äußerung ist wahr. **Grenze:** Sobald ein gegnerischer **Spieler** namentlich auftaucht, ist es ein Personendatum. Neles Regel („die Karte nennt nur ihr eigenes Subjekt") deckt das ab und sollte **verbindlich** bleiben. | 🟢 |
| **4 — Der Beleg-Satz** („Ergebnis von beiden Teams bestätigt") | Die Präzision aus Konzept Abschnitt 0 ist **rechtlich der springende Punkt**, nicht nur handwerklich: Eine Tatsachenbehauptung, die zutrifft, ist unproblematisch — eine, die den Beleg optisch auf die persönliche Zahl schiebt, wäre **[ANNAHME]** eine irreführende Angabe (§ 5 UWG). Neles Zusatz „ERGEBNIS" davor ist damit kein Stilmittel, sondern die **rechtlich tragende Änderung**. Sie muss so bleiben. **Vorwarnung bestätigt:** „die einzige Plattform mit bestätigten Zahlen" wäre **§ 6 UWG** (vergleichende Werbung) und geht vorher an mich. | 🟢 bei exakt diesem Wortlaut |
| **5 — Die Summenprobe** | Neles Frage ist die richtige. **Meine Einschätzung:** „Summe der Spielerwerte = 78 · passt zum Ergebnis" ist eine **Rechenaussage** und sagt sprachlich nicht „bestätigt". Ob ein durchschnittlicher Betrachter das trennt, ist **keine Rechts-, sondern eine Verständnisfrage** — und die beantwortet man durch **Nachfragen bei echten Lesern**, nicht durch eine Rechtsmeinung. **Empfehlung: an Ronja**, sobald ein Entwurf existiert. Rechtlich sehe ich sie als unbedenklich, **solange nirgends das Wort „bestätigt" oder „geprüft" in ihrer Nähe steht**. | 🟢 mit Auflage |
| **6 — Profilfoto** | Kippt die Bewertung **erheblich**: Dann ist es ein Bildnis, § 22 KUG greift, und bei Minderjährigen kommt die Einwilligung der Sorgeberechtigten hinzu. **Empfehlung: nicht aufmachen**, solange Frage 1 offen ist. Wenn Patrick es später will: **eigener Auftrag an mich, vor der Umsetzung.** | 🔴 falls aufgemacht |

---

# 5. Beifang — was mir beim Prüfen aufgefallen ist, ohne dass es beauftragt war

Kurz, weil es nicht mein Auftrag ist, aber es wäre unredlich, es nicht zu nennen:

1. **`/signup` verlinkt die Datenschutzerklärung nicht** und enthält keinen Hinweis nach
   **Art. 13 DSGVO**. **[BELEGT]** Grep = 0 Treffer in `app/signup/page.js` und
   `components/layout/AuthShell.js`. Das ist **unabhängig von der Karte**, betrifft jede
   Registrierung und ist die vermutlich **billigste** Verbesserung im ganzen Dokument.
   **Zuständig für die Fläche: Lina** — sie ändert Erklär-Flächen nie ohne Freigabe, das
   bleibt so. Ich liefere den Befund, nicht den Text.
2. **Die Datenschutzerklärung hat keinen Abschnitt zu Minderjährigen.** Falls Patrick den
   Anwalt ohnehin beauftragt, gehört das in denselben Auftrag — **von einem Anwalt formuliert,
   nicht von mir.** Ich liefere hier ausdrücklich **keine Textvorlage**; die Eskalationsregel
   der `update-onboarding-surfaces`-Skill bleibt unberührt.
3. **`dec-datenschutz` (Abschnitt 10, YouTube/OG-Embeds, offen seit 02.07.)** ist derselbe
   Anwalt, dasselbe Gespräch. **Bündeln spart Geld** — das ist der Ines-Punkt: Ein Mandat mit
   fünf Fragen kostet weniger als drei Mandate mit je zwei.

---

# 6. Kollegen — einbezogen und bewusst nicht

- **Nele (marketing-manager):** Auftraggeberin dieser Prüfung. Ihre sechs Punkte sind
  beantwortet oder eingeordnet (Abschnitte 1–4). **Rückmeldung an sie:** Ihre Trennung
  Ergebnis/Box-Score aus Konzept Abschnitt 0 ist nicht nur handwerklich, sondern die
  **rechtlich tragende** Entscheidung des ganzen Konzepts — der Zusatz „ERGEBNIS" darf im
  Entwurf nicht wegfallen. Ihre Neigung „dauerhaft kein Sponsorenlogo" trage ich mit, aus
  einem stärkeren Grund als dem rechtlichen (2.3). **Neu für sie:** Karte B nennt einen
  Dritten (1.3) — das gehört in ihr Konzept nachgetragen.
- **Vivien (design-spezialistin):** **Nicht blockiert.** Ampel 1b ist grün — Entwurf, Formate,
  Typografie sind rechtlich folgenlos. Das sollte ihr ausdrücklich gesagt werden, sonst wartet
  sie auf eine Freigabe, die sie nicht braucht.
- **Lina (update-onboarding-surfaces):** Empfängerin von Beifang 1 und 2 — **Befund, kein
  Auftrag**. Sie ändert Erklär-Flächen nicht ohne Patricks Freigabe, und Rechtstexte formuliert
  ohnehin keine von uns.
- **Ronja (retention-analystin):** Adressatin von Neles Punkt 5 (Summenprobe) — die Frage
  „versteht ein Leser den Unterschied?" ist ihre, nicht meine.
- **Ines (budgetverwalter):** Kostenpunkte ehrlich ausgewiesen: Anwalts-Erstberatung
  (Frage 1, gebündelt mit `dec-datenschutz`), Gewerbeanmeldung + ggf. Steuerberater vor
  Monetarisierung. **Ich empfehle an keiner Stelle, den Anwalt zu sparen** — ich empfehle,
  ihn mit acht fertigen Fragen billig zu machen.
- **Kai (test-automatisierung):** Falls gebaut, gehören Neles drei Regeln plus die
  Jugend-Sperre in seine Suite — Bruch dieser Regeln wirkt nach außen.
- **Hanna (hr-koordinator):** kann diesen Beitrag im Roster nachtragen.
- **Till (anbau-experte) und Nele zu §7 HGH:** **nicht berührt** — anderes Projekt, andere
  Norm.
- **Bewusst nicht einbezogen:** Mats (keine Bedarfsfrage), Milo (kein Bildmaterial),
  Jonatan (berührt erst, wenn Sponsoren real werden), Tobias und Ben (nichts zu prüfen,
  nichts gebaut).

---

# 7. Wo meine Einordnung an ihre Grenze kommt — ehrlich

1. **Ich bin keine Anwältin, und der wichtigste Teil dieser Prüfung ist genau der, den ich
   nicht leisten kann.** Ob die Karte gebaut werden darf, hängt an Art. 6 und Art. 8 DSGVO.
   Ich kann sagen, dass die Frage sich stellt, und ich kann sie so stellen, dass sie schnell
   beantwortbar ist. Ich kann sie nicht beantworten.
2. **Bei zwei Punkten ist meine Unsicherheit besonders hoch, und ich benenne sie statt sie zu
   glätten:**
   - **Die Altersschwelle nach Art. 8 DSGVO in Deutschland (16 Jahre?).** Ich habe sie als
     Annahme markiert und **nicht extern verifiziert** — ich habe keine Rechtsquelle abgerufen,
     sondern aus meinem Kenntnisstand gearbeitet. **Das ist die erste Frage, die der Anwalt in
     zehn Sekunden beantwortet, und sie trägt einen Teil meiner Argumentation.**
   - **Das Verhältnis von §§ 107, 108 BGB zu Art. 8 DSGVO.** Hier ist meines Wissens die
     Rechtslage selbst nicht eindeutig — meine „niedrige Sicherheit" ist deshalb keine
     Wissenslücke, sondern eine Abbildung des Streitstands. Aber ich kann nicht ausschließen,
     dass sich das seit meinem Kenntnisstand geklärt hat.
3. **Ich habe `hoops_prod` nicht angefasst.** Damit ist **[UNGEPRÜFT]**: ob minderjährige
   Nutzer registriert sind, ob Jugendliga-Teams existieren, und ob ein aktiver
   Sponsor-Report-Token existiert. **Alle drei sind reine Leseabfragen und würden meine
   Dringlichkeitseinstufungen von „strukturell möglich" auf „belegt" heben.** Das ist die
   größte einzelne Lücke dieses Dokuments — und die am leichtesten zu schließende.
4. **Ob Jugendliche im WBV-Spielbetrieb regelmäßig in Seniorenmannschaften eingesetzt werden,
   weiß ich nicht.** Diese Tatsache entscheidet, wie groß Lücke 1 in Abschnitt 1.4 ist.
   **Patrick und Jonatan können sie aus eigener Anschauung beantworten** — ich habe sie
   bewusst nicht geschätzt.
5. **Meine Normzuordnungen sind Orientierung, nicht Subsumtion.** Ich habe die Normen aus
   meinem Kenntnisstand genannt und **keine Gesetzestexte, Kommentare oder Urteile abgerufen**.
   Insbesondere die genaue Fassung von § 5a Abs. 4 UWG und der Übergang TMG → DDG können sich
   anders darstellen, als ich sie wiedergebe. **Keine Norm in diesem Dokument sollte ohne
   anwaltliche Gegenprüfung zitiert werden** — und ich habe bewusst keine erfunden: Wo ich
   unsicher war, steht es dabei.
6. **Ich habe die Severity×Likelihood-Werte selbst gesetzt.** Sie sind eine begründete
   Einschätzung, keine Messung. Die Systematik stammt aus einer US-Vorlage; die Zuordnung
   „Score 10–15 → externe Prüfung" ist deren Konvention, nicht deutsches Recht.
7. **Ich habe keinen Rechtstext formuliert und keine Vorlage geliefert** — weder für die
   Datenschutzerklärung noch für eine Einwilligung. Das war keine Auslassung, sondern meine
   Grenze.

---

*Nora · 13.08.2026 · Vorprüfung, keine Rechtsberatung. Nichts gebaut, nichts committet,
`hoops_prod` nicht berührt. Entscheidung: Patrick.*
