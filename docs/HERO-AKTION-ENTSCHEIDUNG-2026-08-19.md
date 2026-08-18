# Die eine Handlung im Hero — Entscheidung

> **Nele (marketing-manager), 19.08.2026.** Auftrag Patrick über Vivien:
> Der Hero der Startseite wird auf **Überschrift + EINE primäre Handlung + die
> Zeichnung** reduziert (Vivien, `docs/HERO-DUNK-KONZEPT-2026-08-19.md`,
> Abschnitt 8: „Was den Apple-Eindruck heute am meisten beschädigt, ist nicht
> der Ball — es ist die Dichte"). Welche Handlung die eine ist, ist Strategie
> und liegt bei mir.
>
> **Ich habe nichts gebaut.** Dieses Dokument ist die Vorgabe für Vivien.
> Kennzeichnung durchgängig **[BELEGT] / [INDIZ] / [HYPOTHESE]**.
> Pflicht-Startpunkte gelesen: `docs/ZIELGRUPPEN.md`,
> `docs/BEDARFSANALYSE-2026-08-09.md`, `docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md`,
> `docs/LANDING-COPY-2026-08-11.md`, `docs/RECHT-HERO-CLAIM-2026-08-11.md`,
> Kernpositionierung in `CLAUDE.md`. Quelltext gegengelesen, nicht nur zitiert.

---

## 0. Kurzfassung für Patrick

| Frage | Entscheidung |
|---|---|
| Primäre Handlung | **Registrierung als Spieler** → `/signup?src=home-hero` |
| Wortlaut | **„Kostenloses Profil anlegen"** (26 Zeichen) |
| „Team gründen" | **raus aus dem Hero**, als *eine Textzeile* in den Abschluss-Block `LandingCTA.js` |
| „Teams entdecken" | **ersatzlos raus** — steht schon in der Navigationsleiste, über dem Falz |
| Abzeichen (Eyebrow) | **raus** — es sagt dasselbe wie die Überschrift |
| Überschrift | **bleibt wörtlich.** Alternativen unten, aber alle mit Nora-Vorbehalt |
| Absatz Fließtext | **raus** — ersetzt durch **eine** Kleinzeile UNTER der Taste: „Ab 16 Jahren" |

**Damit stehen im Hero noch vier Dinge statt sechs**, und nur eines davon
fordert etwas: Überschrift · Taste · Kleinzeile · Zeichnung.

**Der unangenehme Teil vorweg, damit er nicht untergeht:** Der Hero hat nach
dieser Reduktion genau **einen Ausgang**, und dieser Ausgang ist `/signup`.
`/signup` liefert ohne JavaScript eine **leere Seite** — 0 Formularfelder, 0
Rechtsverweise (`docs/SIGNUP-OHNE-JS-2026-08-17.md`, Roadmap 22) [BELEGT].
Bisher war das „kein Blocker", weil daneben zwei andere Tasten standen. Ab
diesem Umbau ist es die einzige Tür. Das hebt Roadmap 22 in der Dringlichkeit,
unabhängig von diesem Entwurf.

---

## 1. Wer landet überhaupt auf der Startseite?

Das ist die Frage, die die Entscheidung trägt — und die Antwort ist eine andere,
als man erwartet.

**Der geplante Hauptkanal geht an der Startseite vorbei.** Der Flyer-QR-Code
führt **direkt** auf `/signup?src=…`, nicht auf `/`
(`app/signup/page.js`, `app/api/player/playerregister/route.js`: `?src=`,
`[a-z0-9-_]`, max. 40 Zeichen) [BELEGT]. Der 24-jährige Bezirksliga-Spieler, für
den `docs/ZIELGRUPPEN.md` alles ausgelegt hat, sieht diese Seite also **im
Regelfall gar nicht** — er landet im Formular.

Wer die Startseite sieht, ist demnach jemand, der die Adresse **eingetippt oder
zugeschickt bekommen** hat: der Spieler, der den Flyer erst abends wieder
findet; ein WhatsApp-Empfänger; ein Verein oder ein Sponsor, dem jemand den Link
schickt; Maschinen. [HYPOTHESE — es gibt keinen Quell-Parameter am Erstkontakt,
`docs/ZIELGRUPPEN.md` Abschnitt 0.]

**Und wer sie sieht, sieht sie einmal.** 490 Besucher in 30 Tagen, davon **423
mit genau einem Seitenaufruf**, 4 wiederkehrend (Messung Patrick, 19.08.2026)
[INDIZ — ungefiltert, keine Bot-Erkennung, Ø 4 s Sitzungsdauer deutet auf
erheblichen Maschinenverkehr; **Größenordnung verwertbar, Nachkommastelle
nicht**].

Zwei Folgerungen, und beide zeigen in dieselbe Richtung:

1. Die Seite bekommt **einen** Versuch. Es gibt keine zweite Sitzung, in der
   nachgeholt wird, was beim ersten Mal nicht passiert ist.
2. Der Besucher ist **nicht** vorgewärmt. Er hatte kein Gespräch mit Johnny in
   der Halle. Er weiß nicht, was Hoops ist.

---

## 2. Die primäre Handlung: Registrierung als Spieler

### Was entschieden ist

> **Eine Taste. Beschriftung „Kostenloses Profil anlegen". Ziel
> `/signup?src=home-hero`.**

### Warum diese

**Erstens: Alles andere widerspricht der eigenen kanonischen Priorisierung.**
`docs/ZIELGRUPPEN.md` legt fest: **Z1 → Z2 → Z3**, mit dem Satz „Genau **eine**
Zielgruppe wird aktiv beworben (Z1)" und der Begründung „Z1 ist der Motor —
Spieler bringen Team-Admins mit, nicht umgekehrt" [BELEGT, eigene Festlegung
vom 12.08.2026, geändert nur mit Patrick]. Eine primäre Hero-Handlung für Z2
(„Team gründen") würde diese Reihenfolge auf der reichweitenstärksten Fläche
der Plattform umdrehen — und zwar ohne dass sich die Beleglage seit dem 12.08.
geändert hätte.

**Zweitens: Sie ist die einzige der drei, die ihr Versprechen heute einlöst.**
Das ist kein Geschmacksurteil, das ist gemessen:

| Heutige Taste | Wohin sie führt | Was der Erstbesucher dort vorfindet |
|---|---|---|
| Als Spieler registrieren | `/signup` | Ein Formular. Funktioniert. |
| Team gründen | `/team/register` → Weiterleitung → **`/login?next=/team/create`** | **Ein Anmeldeformular** — für jemanden, der kein Konto hat. |
| Teams entdecken | `/teams` | 66 Vereine, davon **6 echt** — der Rest trägt das Abzeichen „Beispieldaten". |

Beides belegt: `app/team/register/page.js` Z. 13
(`router.replace(getPlayerToken() ? "/team/create" : "/login?next=/team/create")`)
und `app/teams/page.js` Z. 200 (`{t.isDemo && <DemoBadge …>}`), Bestandszahlen
aus `CLAUDE.md` und Patricks Messung vom 19.08. [BELEGT].

„Teams entdecken" ist damit die schlechteste Wahl, die überhaupt zur Debatte
stand: Sie liefert einem Menschen, der **einmal** kommt, in einem Klick genau
das, was `docs/ZIELGRUPPEN.md` unter Z1 als Abschreckungsgrund Nummer eins
führt — „eine Plattform, auf der nichts los ist". Der Beweis der Leere vor der
Registrierung, mit unserer eigenen Taste angeboten.

**Drittens: Sie ist die einzige, die auf einen Meilenstein einzahlt.** Der
Trichter lautet mehr Tester → aktive Community → Sponsoren. Der Engpass ist
nachweislich **Liquidität, nicht Funktionsumfang** (Mats, Bedarf 3: „Der Bedarf
ist Liquidität … nicht mehr Features"; Empfehlung 3: „Matching-Liquidität statt
Matching-Features") [BELEGT]. Registrierte Spieler sind die Einheit, in der
dieser Engpass gemessen wird.

### Was dagegen spricht (die Gegenposition, ernst genommen)

Ein Fremder soll in drei Sekunden ein Konto anlegen, **bevor** er einen Beweis
gesehen hat — und ausgerechnet dieses Produkt verkauft Belegbarkeit. Das ist der
klassische Konversionsfehler: fordern, bevor man geliefert hat.

Ich halte das trotzdem für richtig, aus einem Grund, der unangenehm ist:
**Der Beweis, den wir vorziehen könnten, ist heute ein Beweis der Leere.** 57
offizielle NRW-Ligen im Katalog, 3 mit echten Teams [BELEGT, `docs/ZIELGRUPPEN.md`];
6 echte Vereine von 66; 31 echte Spielerprofile [BELEGT, Messung 19.08.]. Wer
„erst zeigen, dann fragen" sagt, muss sagen, **was** gezeigt wird. Solange die
Antwort „Beispieldaten" lautet, ist die Reihenfolge „erst fragen, dann im
Scrollverlauf zeigen, was daraus wird" die ehrlichere — und der Scrollverlauf
zeigt es tatsächlich: die sechs Szenen darunter führen Verhalten vor, nicht
Bestand.

**Nachhalten:** Sobald die echten WBV-Kreisliga-Daten stehen (Roadmap 5) oder
eine Region echte Dichte hat, ist diese Entscheidung **neu zu prüfen** — dann
kann ein „Deine Liga ansehen" die stärkere erste Handlung sein. Das ist keine
Floskel, das ist der Auslöser: **echte Teams in mindestens einer Liga zweistellig.**

### Warum dieser Wortlaut

Heute steht dort **„Als Spieler registrieren"** (24 Zeichen). Drei Einwände:

1. **„Als Spieler" grenzt gegen etwas ab, das es nicht mehr gibt.** Die
   Formulierung stammt aus der Zeit, als es Team-Konten gab. Teams sind
   spieler-geführt, `/team/register` ist nur noch eine Weiterleitung [BELEGT,
   `CLAUDE.md` + `app/team/register/page.js`]. Es gibt keine zweite Kontoart, von
   der man sich abgrenzen müsste.
2. **„registrieren" benennt den Preis, nicht den Gewinn.** Es ist Behördenton für
   „du gibst uns jetzt Daten".
3. **„kostenlos" fehlt** — und das ist die stärkste belegte Tatsache, die wir
   besitzen. Der Status quo der Zielgruppe ist **kostenpflichtig und schlecht
   bewertet**: DBB.Scores 3,99 €/Woche bis 34,99 €/Jahr, 3,1 ★ bei 880
   Bewertungen, und der WBV verschenkt Gold-Abos an Mannschaftsverantwortliche
   [BELEGT, Mats, Abrufdatum 09.08.2026]. Zwei Wörter, die gegen den einzigen
   ernsthaften Wettbewerber arbeiten.

**Empfohlenes Paar (Vivien, mit Zeichenzahl):**

| Element | Wortlaut | Zeichen |
|---|---|---|
| Taste | **Kostenloses Profil anlegen** | 26 |
| Kleinzeile darunter | **Ab 16 Jahren** | 12 |

**Alternatives Paar**, falls 26 Zeichen die Taste auf 360 px zweizeilig machen:

| Element | Wortlaut | Zeichen |
|---|---|---|
| Taste | **Profil anlegen** | 14 |
| Kleinzeile darunter | **Kostenlos · ab 16 Jahren** | 24 |

Zum Vergleich: die heutige Beschriftung hat **24** Zeichen und trägt auf 360 px
einzeilig. 26 sollte tragen, ist aber zu messen, nicht zu glauben.

⚠️ **Für Nora, nicht von mir gesetzt:** „kostenlos" ist eine Preisangabe im
geschäftlichen Verkehr. Als Aussage über den **heutigen** Zustand halte ich sie
für unproblematisch (sie ist wahr, sie vergleicht nicht, sie nennt keinen
Wettbewerber). Zwei Punkte gehören trotzdem geprüft: (a) ob die geplante
Werbe-/Sponsorenfinanzierung (Roadmap 3) später eine Einschränkung nötig macht,
und (b) dass **nirgends „dauerhaft" oder „für immer kostenlos" daraus wird** —
das wäre ein Zukunftsversprechen, kein Faktum.

---

## 3. Was mit den anderen beiden passiert

### „Teams entdecken" — ersatzlos aus dem Hero

Kein Ersatz, kein Textlink, keine tiefere Ebene. Begründung:

- Es ist **keine Handlung**, es ist Stöbern.
- Das Ziel ist zu 90 % Beispieldaten (s. o.).
- **Es geht nichts verloren:** `/teams` steht in der Navigationsleiste
  (`components/layout/Navbar.js`, Gruppe „Wer spielt" → `/teams`, `/spieler`; `PUBLIC_LINKS`, also auch ausgeloggt),
  und die ist über dem Falz sichtbar [BELEGT].

### „Team gründen" — eine Textzeile im Abschluss-Block, nicht im Hero

**Konkret für Vivien:** In `components/landing/LandingCTA.js`, **unter** den
beiden bestehenden Tasten („Jetzt registrieren" / „Bereits registriert?
Anmelden"), **eine** Zeile in `text-mist-400`, kein dritter Knopf:

> **Du organisierst dein Team? → Team gründen**

Warum dort und nicht im Hero:

- **Der Ort ist inhaltlich richtig.** Wer bis zum Abschluss-Block gescrollt hat,
  hat die sechs Szenen gesehen, darunter „Kader füllt sich". Genau dieser Leser
  ist Z2. Ein Team-Admin, der ganz oben gefragt wird, weiß noch nicht, wofür.
- **Z2 wird laut eigener Festlegung über Z1 erreicht**, nicht direkt
  [BELEGT, `docs/ZIELGRUPPEN.md`].
- Ein dritter Knopf im Abschluss-Block würde die Dichte nur nach unten
  verschieben statt sie aufzulösen.

⚠️ **Aber vorher ist ein Defekt zu beheben, sonst verlagern wir ihn nur:** Der
Verweis führt heute für ausgeloggte Besucher auf `/login?next=/team/create` —
ein **Anmeldeformular für jemanden ohne Konto**. Richtig wäre
`/signup?next=/team/create` (oder die Weiterleitung in
`app/team/register/page.js` entsprechend umstellen). **Das ist kein
Gestaltungspunkt, das ist eine Sackgasse** — gehört zu **Lina** (Erstkontakt)
und zu dem, der die Zeile baut.

### Der ehrliche Preis dieser Reduktion

Ein Team-Admin, der kalt auf der Startseite landet, muss ab jetzt **an sechs
Szenen vorbeiscrollen**, bevor er seine Handlung findet. Das ist ein realer
Verlust, und ich beschönige ihn nicht. Ich nehme ihn in Kauf, weil er die
kanonische Priorisierung abbildet und weil seine Handlung heute ohnehin in ein
Anmeldeformular läuft. **Wenn Patrick das anders gewichtet, ist das eine
Zielgruppen-Änderung — und die geht nur über ihn.**

---

## 4. Die Überschrift

### ⚠️ Zuerst eine Richtigstellung zum Auftrag

Im Auftrag steht, die Hero-Überschrift laute „EINE SAISON, SECHS SPIELZÜGE" und
sei auf Patricks Telefon abgeschnitten gewesen. **Das sind zwei verschiedene
Überschriften** [BELEGT, Quelltext]:

- **Die Hero-Überschrift** ist **„Deine Basketball-Community in NRW"**
  (`components/landing/LandingHero.js`, 33 Zeichen, mit dem Umklapp-Effekt auf
  dem einen Wort „Community").
- **„Eine Saison, sechs Spielzüge"** ist die Überschrift der **Feature-Strecke**
  darunter (`components/landing/LandingFeatures.js` Z. 181). Sie war die
  abgeschnittene („auf 360 px blieb ‚SAISON, SECHS SPIELZ'") und ist von Vivien
  am 18.08.2026 behoben worden — Untergrenze von 3 rem auf 2 rem.

**Folge:** Die Zeile, die gekürzt werden sollte, ist bereits repariert — und sie
darf nicht angefasst werden. Im Quelltext steht dazu eine ausdrückliche Auflage
an mich: *„Diese Überschrift kann nicht mehr umformuliert werden, ohne die
Geometrie neu zu messen"*, bewacht durch
`tests/e2e/landing-ueberschrift.spec.mjs` [BELEGT]. **Sie bleibt wörtlich.**

### Entscheidung zur Hero-Überschrift: sie bleibt — aber das Abzeichen geht

**Das Abzeichen (Eyebrow) trägt „Amateur-Basketball in NRW", die Überschrift
darunter „Deine Basketball-Community in NRW".** Von den sechs Dingen im Hero
sagen also **zwei dasselbe** [BELEGT, beide Zeichenketten in `LandingHero.js`].
Das ist die billigste Kürzung, die es hier gibt: ein Element weniger, keine
Information verloren, kein neuer Anspruch. **Das Abzeichen entfällt.**

⚠️ Technischer Hinweis für Vivien: `[data-hero-eyebrow]` ist heute der Anker der
mobilen Ball-Ruhelage. Laut Dunk-Konzept (Abschnitt 6) entfällt diese
Verankerung mit dem Ball ohnehin — **aber die Reihenfolge zählt**: Wer das
Abzeichen entfernt, bevor die Ball-Mechanik draußen ist, nimmt der Ruhelage
ihren Bezugspunkt.

**Die Überschrift selbst bleibt wörtlich**, und zwar aus einem Grund, den ich
lieber ausspreche als verstecke:

> **Jede Überschrift, die statt der Kategorie den Nutzen benennt, behauptet
> heute etwas, das wir für die meisten Besucher nicht einlösen.**

„Deine Liga ist drin" ist bei 3 von 57 bespielten Ligen eine Behauptung ohne
Beweis (das habe ich selbst schon einmal so festgehalten, `EMPFEHLUNG.md` §1,
zitiert in Mats' Bedarf 2) [BELEGT]. Und „deine Zahlen, bestätigt" ist **exakt
Fall 5** aus `docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md` — doppelt bestätigt
ist **das Ergebnis**, den Box-Score trägt **ein** Team-Admin ein. Dieser Fall
stammt aus einer Vorgabe von mir; ich baue ihn nicht ein zweites Mal in die
reichweitenstärkste Zeile der Plattform.

Dazu kommt Noras Präzedenzfall: Die Hero-Überschrift ist in ihrer Fundstellen-
Tabelle Nummer 2 von 7, „Startseite, jeder ausgeloggte Besucher — höchste
Reichweite", und die aktuelle Fassung ist das **Ergebnis** ihrer Korrektur
(vorher „in Deutschland") [BELEGT, `docs/RECHT-HERO-CLAIM-2026-08-11.md`].
Eine Umformulierung ist damit nicht Textpflege, sondern das Aufmachen einer
abgeschlossenen Prüfung.

### Alternativen, falls Patrick doch kürzen will

Nicht empfohlen für diesen Bau. Jede mit ihrem Preis, alle mit Zeichenzahl für
Viviens Messung:

| Vorschlag | Zeichen | Was sie kostet |
|---|---|---|
| **Deine Basketball-Community in NRW** (heute) | 33 | — · **meine Empfehlung** |
| **Amateur-Basketball in NRW** | 25 | Wortgleich mit dem gestrichenen Abzeichen, also von Nora bereits geprüft und ohne neuen Anspruch. Aber: ein **Etikett**, keine Aussage — liest sich wie ein Kategorie-Titel. |
| **Deine Saison, festgehalten** | 26 | Benennt endlich einen Nutzen. Trägt aber verdeckt eine Abdeckungs-Zusage: festgehalten wird nichts, wenn seine Liga leer ist. **Nur mit Nora.** |
| **Amateur-Basketball in NRW, ohne Abo** | 36 | Stärkste Aussage, weil sie den belegten Schmerz trifft. Nähert sich aber der vergleichenden Werbung (§ 6 UWG), weil das Publikum weiß, wer das Abo verlangt. **Nur mit Nora.** |

⚠️ **Zum Umklapp-Effekt auf „Community":** Er kann bleiben, aber er ist ab jetzt
das **zweite** bewegte Element in demselben Bild — neben der Zeichnung. Das ist
dieselbe Dichte-Frage wie bei den sechs Elementen, nur auf der Zeitachse.
Aus Marketing-Sicht geht nichts verloren, wenn er entfällt: Das Wort
„Community" gewinnt durch das Umklappen keine Bedeutung. **Die Entscheidung ist
Viviens.**

---

## 5. Der Absatz Fließtext

**Er entfällt in dieser Form.** Heute steht dort (137 Zeichen, zwei Sätze):

> „Finde Spieler, tritt Vereinen bei und verfolge Ligen in deiner Region. Die
> Plattform für Amateur-Basketball – von Spielern, für Spieler."

Das ist eine **Aufzählung von drei Funktionen** — also genau das, was die
Feature-Strecke darunter seit dem 11.08. ordentlich macht, in sechs Szenen mit
Bewegung statt in einem Nebensatz. Er wandert nicht nach unten, er wird dort
bereits erzählt. Ersatzlos streichen.

**Was NICHT verloren gehen darf**, ist eine Tatsache, die im Absatz gar nicht
steht: dass es **kostenlos** ist. Sie ist unser stärkstes belegtes Argument
(Abschnitt 2) und sitzt ab jetzt in der Taste selbst.

**An ihre Stelle tritt EINE Kleinzeile — unter der Taste, nicht darüber.**
Wortlaut: **„Ab 16 Jahren"** (12 Zeichen), in `text-mist-400`, klein.

Zwei Gründe:

1. **Leserichtung.** Überschrift → Angebot → Bedingung. Eine Bedingung über dem
   Angebot ist eine Hürde; unter dem Angebot ist sie eine Fußnote.
2. **Sie schließt eine gemessene Lücke.** Lina hat am 14.08. festgehalten: Die
   Altersgrenze wird auf der Startseite **nirgends** genannt, und ein
   14-Jähriger erfährt sie erst nach fünf ausgefüllten Feldern
   (`docs/ENTDECKBARKEIT-BEFUND-2026-08-14.md`, P2-3) [BELEGT]. Auf `/signup`
   ist das behoben (Roadmap 14), auf der Startseite nicht. Zwölf Zeichen
   erledigen es.

---

## 6. Trägt eine Handlung fünf Zielgruppen? — Nein, und das ist kein Kompromiss

Die ehrliche Antwort ist: **Eine Handlung trägt fünf Zielgruppen nicht.** Sie
muss es aber auch nicht, weil vier der fünf hier gar nicht bedient werden
sollen — und das steht so bereits in meiner eigenen kanonischen Festlegung, ist
also keine Notlösung für diesen Umbau:

| | Zielgruppe | Im Hero? | Warum |
|---|---|---|---|
| Z1 | Aktive Liga-Spieler NRW | **Ja — die Taste ist ihre** | Kanonisch die einzige aktiv beworbene Gruppe [BELEGT] |
| Z2 | Team-Admins, Ehrenamt | Nein — Textzeile im Abschluss-Block | „Wird über Z1 erreicht" [BELEGT] |
| Z3 | Vereinslose, Wiedereinsteiger | Nein | Entschieden 12.08.: kein eigener Kanal, kein eigenes Material, Bedienung im Produkt [BELEGT] |
| Z4 | Vereinsverantwortliche | Nein | Entschieden: „nicht aktiv bewerben, bis Z1/Z2 Substanz haben" [BELEGT] |
| Z5 | Lokale Sponsoren | Nein | „Eine Gesprächs-Zielgruppe, **kein Kanal**" — kommt über ein persönliches Gespräch, nicht über `/` [BELEGT] |

**Der ehrlichste Kompromiss lautet deshalb nicht „zwei Tasten", sondern:**

> **Der Hero gehört einer Zielgruppe. Die Seite gehört mehreren.**

Die Startseite bleibt vielstimmig — sie hat nach dem Hero sechs Szenen, „So
funktioniert's", News und den Abschluss-Block. Was sich ändert, ist nur, dass
die **erste Fläche** nicht mehr versucht, drei Gruppen gleichzeitig anzusprechen,
und dabei keine erreicht.

⚠️ **Die eine Gruppe, die dabei etwas verliert, ist Z2** (Abschnitt 3, „Der
ehrliche Preis"). Das ist die Stelle, an der Patrick widersprechen kann.

---

## 7. Perspektiv-Check aus der Zielgruppe — ungeschönt

**Der Referenzfall (`docs/ZIELGRUPPEN.md`, Z1): 24 Jahre, Bezirksliga, Handy,
drei Sekunden.** Nur sieht er diese Seite anders als den Flyer — er hat kein
Gespräch mit Johnny im Rücken (Abschnitt 1).

Er sieht: **„Deine Basketball-Community in NRW" · [Kostenloses Profil anlegen] ·
„Ab 16 Jahren" · eine Linienzeichnung eines Dunks.**

- **Versteht er in 3 Sekunden, was Hoops ist?** *Teilweise.* Er versteht:
  Basketball, NRW, für ihn, kostenlos. Er versteht **nicht**, dass hier seine
  Zahlen und seine Liga stehen — „Community" ist das schwächste Wort im Satz und
  könnte auch eine Facebook-Gruppe meinen. **Das ist die reale Schwäche dieses
  Entwurfs, und sie ist bewusst in Kauf genommen** (Abschnitt 4): Jede stärkere
  Zeile behauptet mehr, als wir bei 3 von 57 bespielten Ligen halten können.
- **Hat er einen Grund zu tippen?** *Einen schwachen, aber einen echten:*
  kostenlos, kein Abo, drei Wörter Aufwand. Gegen DBB.Scores' 34,99 €/Jahr ist
  das ein Argument [BELEGT]. Es ist kein starkes Versprechen — es ist ein
  niedriger Preis für einen Versuch.
- **Was ihn abschreckt:** Nichts im Hero mehr. Vorher war es „Teams entdecken",
  das ihn in einen Katalog aus Beispieldaten geführt hätte.

**Der Team-Admin (Z2), gleiche Lage:** Er findet oben nichts für sich und muss
scrollen. Wenn er scrollt, findet er es. Wenn nicht, ist er weg. **Das ist der
Preis, benannt und nicht weggerechnet.**

**Der Sponsor (Z5), falls ihm doch jemand den Link schickt:** Er sieht eine
aufgeräumte Seite ohne Reichweiten-Behauptung. Das ist besser als vorher — sein
Abschreckungsgrund Nummer eins ist laut `ZIELGRUPPEN.md` „erfundene oder
aufgeblasene Reichweite", und die steht hier nirgends.

---

## 8. Messbarkeit — was geht und was nicht

**Was heute NICHT geht, und das muss dastehen:** Hero-Tastenklicks sind
**nicht instrumentiert**. Es existieren nur Seitenaufrufe und Onboarding-
Ereignisse (Ronja hat das am 12.08. im Quelltext geprüft,
`docs/RONJA-LANDING-2026-08-12.md`) [BELEGT]. Wir wissen also **nicht**, welche
der drei Tasten heute geklickt wird — diese Entscheidung ist aus Prinzipien
abgeleitet, nicht aus Verhalten. Wer etwas anderes behauptet, hat keine Daten.

**Was ohne eine Zeile neuen Code geht:** Die Taste verlinkt auf
**`/signup?src=home-hero`**. Das nutzt die bereits produktive Kampagnen-Quelle
(gültiges Muster `[a-z0-9-_]`, max. 40 Zeichen — „home-hero" passt) [BELEGT].
Ab dann ist trennbar, wie viele Registrierungen aus dem Hero kommen und wie
viele aus dem Flyer-QR.

⚠️ **Grenze, die dazugehört:** `?src=` wird bei der **Registrierung** gespeichert,
nicht beim Klick. Es misst Abschlüsse, nicht Interesse. Wie viele den Hero sehen
und nichts tun, bleibt unbekannt — **das ist die eigentlich interessante Zahl.**

**Für Ben (Analytics), ein Vorschlag, keine Anweisung:** ein `trackEvent` auf der
einen Hero-Taste. Bei genau einer Taste ist das billig und eindeutig — es war
mit drei Tasten deutlich teurer. Ohne das bleibt die Wirkung dieses Umbaus
unbelegbar, und dann sagen wir das lieber, als sie zu behaupten.

---

## 9. Was Vivien konkret bekommt

1. Abzeichen (Eyebrow) **entfernen** — nach der Ball-Mechanik, nicht davor.
2. Überschrift **unverändert** lassen; Umklapp-Effekt nach eigenem Urteil.
3. Absatz **entfernen**.
4. **Eine** Taste: „Kostenloses Profil anlegen" (26 Z.) → `/signup?src=home-hero`.
   Rückfall bei Zweizeiligkeit auf 360 px: „Profil anlegen" (14 Z.).
5. **Eine** Kleinzeile darunter: „Ab 16 Jahren" (12 Z.) — bzw. „Kostenlos · ab
   16 Jahren" (24 Z.) bei der Rückfall-Variante.
6. Die zwei anderen Tasten **entfernen**; in `LandingCTA.js` eine Textzeile
   „Du organisierst dein Team? → Team gründen" ergänzen.
7. Die Feature-Überschrift „Eine Saison, sechs Spielzüge" **nicht anfassen**.

**Nach dem Bau sehe ich es mir aus Zielgruppensicht noch einmal an** — das
gefinishte Stück, nicht den Entwurf.

---

## 10. Wen ich einbezogen habe

- **Vivien (design-spezialistin)** — Empfängerin. Sie hat die Frage gestellt und
  ausdrücklich **keine** Strategie erfunden; dieses Dokument ist die Antwort.
  Sie baut, ich prüfe danach die Botschaft.
- **Lina (onboarding-referentin)** — **Pflicht, zwei Punkte.** (a) Der Hero hat
  jetzt genau einen Ausgang, und der ist `/signup`; sie verantwortet diese
  Erstkontakt-Fläche. (b) Die Sackgasse „Team gründen" → Anmeldeformular für
  Kontolose ist ihr Gebiet, nicht meines.
- **Nora (recht-vorpruefung)** — **Pflicht, aber klein:** die Preisangabe
  „kostenlos" (Abschnitt 2) und **jede** der Überschrift-Alternativen aus
  Abschnitt 4. Die empfohlene Fassung ändert an ihrer Prüfung von 11.08. nichts.
- **Ben (Analytics)** — Vorschlag zur Messbarkeit (Abschnitt 8), keine
  Anweisung.
- **Mats & Ronja** — zur Kenntnis: Dies ändert den ersten Schritt des Trichters.
  Ronjas Befund „Hero-CTAs nicht instrumentiert" ist die Grundlage von
  Abschnitt 8. Für Mats ist relevant, dass die Entscheidung auf seinem
  Liquiditäts-Argument steht.
- **Jonatan (Partnerschaften)** — **bewusst nicht.** Der Hero macht keine
  Sponsoren-Aussage; Z5 kommt nicht über diese Seite. Berührt wäre er erst,
  wenn eine Reichweitenzahl in den Hero soll — die soll sie nicht.
- **Tobias / Kai** — nicht von mir beauftragt; sie hängen an Viviens Bau, nicht
  an diesem Text.

---

## 11. Was an diesem Dokument NICHT belegt ist

- Wer heute tatsächlich auf `/` landet, ist **[HYPOTHESE]**. Es gibt keinen
  Quell-Parameter am Erstkontakt.
- Die Besucherzahlen sind ungefiltert **[INDIZ]**, Größenordnung ja,
  Nachkommastelle nein.
- Dass „Kostenloses Profil anlegen" besser konvertiert als „Als Spieler
  registrieren", ist **[HYPOTHESE]** — begründet, aber ungemessen, und mangels
  Klick-Erfassung heute auch nicht messbar (Abschnitt 8).
- Ob 26 Zeichen auf 360 px einzeilig tragen, ist **nicht gemessen**, sondern aus
  der heutigen 24-Zeichen-Fassung geschlossen. Vivien misst.
- Ob der Flyer neben dem QR-Code auch die nackte Adresse trägt (und damit doch
  Hallen-Publikum auf die Startseite bringt), habe ich **nicht geprüft** — die
  Druckvorlagen liegen nicht in diesem Projektordner.
