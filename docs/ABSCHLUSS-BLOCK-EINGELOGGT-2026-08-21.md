# Der Abschluss-Block für angemeldete Nutzer — Entscheidung

> **Nele (marketing-manager), 21.08.2026.** Auftrag Patrick über Vivien:
> Die Scroll-Erzählung endet damit, dass der Ball in den Korb geht — dort, wo
> die Handlungsaufforderung steht. Für Ausgeloggte ist das entschieden
> (`docs/HERO-AKTION-ENTSCHEIDUNG-2026-08-19.md`). Offen war Patricks letzter
> Satz: *„Bei eingeloggten usern wird man zum Feedback oder zum Newsfeed oder so
> geschickt."*
>
> **Ich habe nichts gebaut.** Dieses Dokument ist die Vorgabe für Vivien.
> Gelesen: `docs/ZIELGRUPPEN.md`, `docs/BEDARFSANALYSE-2026-08-09.md`,
> `docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md`,
> `docs/HERO-AKTION-ENTSCHEIDUNG-2026-08-19.md`. Quelltext gegengelesen:
> `components/landing/LandingCTA.js`, `LandingHowItWorks.js`,
> `LandingOnboarding.js`, `app/page.js`, `components/layout/FeedbackLink.js`,
> `app/api/feedback/route.js`. Kennzeichnung **[BELEGT] / [INDIZ] / [HYPOTHESE]**.

---

## 0. Kurzfassung für Patrick

| Frage | Entscheidung |
|---|---|
| Gibt es einen Abschluss-Block für Angemeldete? | **Ja** — heute gibt es **keinen** (der Block verschwindet komplett) [BELEGT] |
| Wohin führt er? | **Feedback** → `/feedback` |
| Überschrift | **Was fehlt?** |
| Text darunter | **Hoops ist in der Testphase. Was hier fehlt, wissen wir nur, wenn es jemand sagt.** |
| Taste | **Feedback geben** |
| Kleinzeile darunter | **Ein Satz reicht** |
| Zweite Taste („Zum Newsfeed") | **Nein** — begründet in Abschnitt 3 |
| „Du organisierst dein Team?" | **Wandert nicht mit** — nur im ausgeloggten Zweig |

**Ehrlich vorweg, damit es nicht untergeht:** Ja, das ist eine **Bitte um
Arbeit**, und ich verkleide sie nicht als Geschenk. Abschnitt 6 sagt, warum ich
sie trotzdem für richtig halte — und wo die Grenze liegt.

---

## 1. Wer ist dieser Mensch überhaupt?

Ein Angemeldeter, der auf `/` landet **und bis ganz unten scrollt**, ist selten.
Er hat einen eigenen Bereich, und die Startseite ist eine Verkaufsfläche für
jemanden, der schon gekauft hat.

Wer trotzdem dort unten ankommt, ist mit hoher Wahrscheinlichkeit einer von
zwei Typen [HYPOTHESE — es gibt keine Messung, die das trennt]:

1. **Jemand, der die Seite selbst ansieht** — Tester, Johnny, Jonatan, ein
   Neugieriger nach einem Umbau.
2. **Jemand, der die Adresse aus Gewohnheit tippt** und dann liest, weil sich
   etwas verändert hat.

Beide eint eine Eigenschaft, und die ist der Kern dieser Entscheidung:
**Er hat gerade die vollständige Selbstdarstellung des Produkts konsumiert.**
Er ist damit der einzige Mensch auf der Plattform, der in diesem Moment
**Versprechen und Erfahrung nebeneinander** hat. Das kann keine andere Fläche
einsammeln — wer im Newsfeed Feedback gibt, spricht über den Newsfeed.

**Zahlen dazu:** 490 Besucher in 30 Tagen, davon 423 mit genau einem
Seitenaufruf, 4 wiederkehrend [INDIZ — ungefiltert, keine Bot-Erkennung,
Ø 4 s Sitzungsdauer; **Größenordnung ja, Nachkommastelle nein**]. Auf der
Plattform: 6 echte Vereine, 31 echte Spielerprofile [BELEGT]. Die Menge der
Angemeldeten, die hier unten ankommen, liegt also **im einstelligen Bereich pro
Monat** [HYPOTHESE, aber die einzige Größenordnung, die zu diesen Zahlen passt].

⚠️ **Was das für die Gewichtung heißt:** Diese Fläche wird kaum jemanden
erreichen. Sie darf deshalb **nichts kosten** — keinen zweiten Knopf, keine
Sonderlogik, keine neue Datenerhebung. Eine seltene Fläche, die teuer ist,
ist die schlechteste Sorte Arbeit.

---

## 2. Warum es den Block überhaupt geben muss — und der Grund ist nicht Marketing

Heute steht in `components/landing/LandingCTA.js` Zeile 21:
`if (!checked || loggedIn) return null;` — für Angemeldete **entfällt der
gesamte Abschnitt**, samt Korb-Zeichnung [BELEGT].

Solange der Abschluss-Block nur zwei Tasten trug, war das richtig. **Mit der
Scroll-Erzählung ist es ein Defekt:** Der Ball reist über die ganze Seite und
soll in den Korb fallen. Fällt der Korb für Angemeldete weg, endet die Reise
**im Nichts** — der Ball müsste sich auflösen oder auf dem Footer landen.

> **Der Block ist ab jetzt nicht die Handlungsaufforderung, sondern der
> Zielpunkt einer Bewegung. Was drinsteht, ist verhandelbar; dass er da ist,
> nicht mehr.**

Das ist die eigentliche Antwort auf Frage 3 des Auftrags: **Ja, es braucht
einen** — aber aus Gründen der Erzählung, nicht weil ein Angemeldeter etwas
bräuchte.

---

## 3. Warum Feedback und nicht Newsfeed

### Gegen den Newsfeed — und das Argument ist hart

Direkt **über** diesem Block steht für Angemeldete bereits
**„Deine nächsten Schritte"** mit drei personalisierten Karten: Profil
vervollständigen · Dein Team verwalten/ansehen/gründen · Ligen & Topscorer
[BELEGT, `LandingHowItWorks.js` Z. 41–90]. Und der Newsfeed ist der **erste
Eintrag der Spieler-Navigationsleiste** (`START = { href: "/player/newsfeed",
label: "Newsfeed" }`), die während **100 % der Scrollzeit** sichtbar ist
[BELEGT, `PlayerNav.js` Z. 60].

Eine Taste „Zum Newsfeed" wäre damit **die vierte Wegbeschreibung in zwei
Bildschirmhöhen**, und sie zeigt auf den Ort, den der Nutzer ohnehin am besten
kennt. Das ist die klassische Fülltaste: Sie erfüllt die Form eines
Abschluss-Blocks, ohne etwas zu bewirken.

### Für Feedback — mit dem Einwand, der dagegen spricht

**Der Einwand zuerst, weil er ehrlich derselbe ist:** Auch `/feedback` hängt
schon in der Leiste — als markenfarbenes Symbol neben Suche und Glocke, im
Mobil-Menü als Zeile „Feedback geben" unter der Gruppe „Testphase"
[BELEGT, `FeedbackLink.js`].

**Der Unterschied ist trotzdem real:** Ein Symbol macht etwas **möglich**, ein
Abschluss-Block **fragt danach**. Und dass Möglichkeit hier nicht genügt, ist
belegt, nicht vermutet:

> **31 echte Spielerprofile — und insgesamt eine substanzielle schriftliche
> Rückmeldung** (25.06.2026) plus fünf WhatsApp-Punkte von Jonatan
> [BELEGT, `docs/ZIELGRUPPEN.md` Abschnitt 0].

Der Feedback-Zugang ist seit dem 13.08. auf jeder Seite sichtbar und wird
faktisch nicht benutzt. Beim Newsfeed ist Verfügbarkeit genug — der Nutzer will
dorthin. Bei Feedback ist sie nachweislich nicht genug.

Dazu kommt der Punkt aus Abschnitt 1: Dieser Leser hat gerade das
**Selbstbild** der Plattform gelesen. Die Frage „passt das zu dem, was du
erlebst?" ist an genau dieser Stelle beantwortbar und nirgendwo sonst.

### Die Alternative, die ich geprüft und verworfen habe

**„Hol jemanden dazu" / Teilen.** Funnel-logisch das stärkste Argument: Der
Engpass ist **Liquidität, nicht Funktionsumfang** (Mats, Bedarf 3) [BELEGT],
Z2 wird über Z1 erreicht [BELEGT], und WhatsApp-Team-Chats sind ein belegter
Kanal. Wer gerade den Pitch gelesen hat, ist der beste denkbare Weiterleiter.

**Verworfen, aus drei Gründen:** Es gibt keinen gebauten Teilen-Weg (ich müsste
ein Feature erfinden, nicht einen Text schreiben) · es ist eine **größere**
Bitte als Feedback, weil sie sozialen Kredit kostet · und es ist heute nicht
messbar, also auch nicht bewertbar.

⚠️ **Auslöser für eine Neubewertung, konkret statt floskelhaft:** Sobald es
einen gebauten Teilen-Weg mit eigenem `?src=` gibt, ist diese Entscheidung neu
zu prüfen. Dann wäre „Hol dein Team dazu" der stärkere Abschluss.

---

## 4. Der Wortlaut

Heute steht dort (für Ausgeloggte) „Bereit loszulegen?" · „Werde Teil der
Community-Plattform für Amateur-Basketball in NRW." · zwei Tasten. Für jemanden
mit Konto ist jedes einzelne Wort davon sinnlos — er ist bereits Teil.

**Der angemeldete Zweig spiegelt die Struktur des Heros** (Überschrift · eine
Taste · eine Kleinzeile). Diese Wiederholung ist Absicht: Die Seite bekommt
Buchstützen, oben wie unten dieselbe Form.

| Element | Wortlaut | Zeichen |
|---|---|---|
| Überschrift (`h2`, Display, Versalien) | **Was fehlt?** | 10 |
| Text | **Hoops ist in der Testphase. Was hier fehlt, wissen wir nur, wenn es jemand sagt.** | 79 |
| Taste | **Feedback geben** | 14 |
| Kleinzeile | **Ein Satz reicht** | 15 |

### Begründung, Zeile für Zeile

**„Was fehlt?"** — Die ganze Seite darüber redet. Der letzte Block dreht sich um
und fragt. Es ist eine Frage an ihn statt einer Aussage über uns, es ist
Hallen-Sprache (kurz, direkt, `docs/ZIELGRUPPEN.md` Z1), und es enthält
**keine Behauptung** — also nichts, was jemand widerlegen kann.

Es ist zugleich ein **Eingeständnis**: Die Formulierung setzt voraus, dass etwas
fehlt. In der Testphase ist das wahr, und die Marke ist auf „echt, direkt, keine
leeren Superlative" gebaut. ⚠️ **Das Risiko ist eingehegt, per Konstruktion:**
Diese Zeile sieht **nur, wer bereits ein Konto hat**. Kein Interessent liest
sie. Der Abschreckungsgrund „eine Plattform, auf der nichts los ist"
(`ZIELGRUPPEN.md` Z1) kann hier also niemanden mehr treffen, der noch zu
gewinnen wäre.

*Nicht empfohlene Varianten, falls Vivien eine Nicht-Frage braucht:*
„Sag, was fehlt" (14) — verliert die Zuwendung. „Was fehlt dir?" (14) —
**abgelehnt**, das ist im Deutschen auch die Arztfrage.

**Der Text.** Er benennt den Grund für die Bitte, statt sie zu schmeicheln
(„dein Feedback ist uns wichtig" ist genau der Ton, den `MARKE.md` verbietet).
Und er verspricht **nichts**. Bewusst steht dort **nicht** „…entscheidet, was
als Nächstes gebaut wird" — das wäre ein Zukunftsversprechen an einen einzelnen
Nutzer, das niemand halten kann. Fall 5 aus
`docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md` stammt aus einer Vorgabe von mir;
ich baue die Fehlerform nicht ein zweites Mal ein.

**„Ein Satz reicht"** — die wichtigste der vier Zeilen, weil sie den Preis der
Bitte senkt und **belegbar wahr** ist: `app/api/feedback/route.js` verlangt
genau **eine** inhaltliche Angabe — Bewertung *oder* Thema *oder* Text
(`if (!rating && !areas.length && !likes && !dislikes && !suggestions &&
!freeMessage) return fail(…)`) [BELEGT].

⚠️ **Bewusst NICHT „dauert zwei Minuten".** Das Formular zeigt sechs Felder
(Bewertung, Themen-Chips, Gefällt, Gefällt nicht, Vorschlag, Freitext). Eine
Zeitzusage, die das nächste Bild sofort widerlegt, ist genau das Muster aus
`MUSTER-ZAHLEN` — im Sinne des Codes richtig, im Sinne des Lesers falsch.
„Ein Satz reicht" hält, was die Route hergibt.

⚠️ **Für Vivien, ein Nebenbefund, den ich nicht selbst löse:** Die Kleinzeile
verspricht Kürze, das Formular sieht lang aus. Wenn diese Kluft stört, gehört
sie auf `/feedback` behoben (sichtbare Pflicht/Kür-Trennung), nicht in der
Kleinzeile weggeschrieben. **Das ist Linas Fläche**, nicht meine.

---

## 5. Was NICHT mitwandert

- **„Du organisierst dein Team? Team gründen"** bleibt **ausschließlich** im
  ausgeloggten Zweig. Für Angemeldete erledigt das die Team-Karte in „Deine
  nächsten Schritte", und die ist besser: Sie kennt den Zustand des Nutzers
  (Admin / im Kader / vereinslos) [BELEGT, `LandingHowItWorks.js` Z. 42–58].
- **Keine zweite Taste.** Der Block hat genau einen Ausgang, wie der Hero.
- **Die Korb-Zeichnung `KorbRuhe` bleibt in beiden Zweigen** — sie ist der
  Zielpunkt des Balls und damit der Grund, warum es den Block gibt.

⚠️ **Wenn Vivien die zwei aufeinanderfolgenden mittigen Blöcke („Deine nächsten
Schritte" → Abschluss) als zu dicht empfindet:** Die Kürzung ist dann **der
Text**, nicht der Block. Überschrift · Taste · Kleinzeile tragen die Aussage
auch allein. Der Block selbst darf nicht fallen, sonst fällt der Korb mit.

---

## 6. Bitte oder Angebot? — die ehrliche Antwort

**Es ist eine Bitte.** Er gibt Arbeit, er bekommt kein Produkt dafür. Jede
Formulierung, die daraus ein Geschenk macht („Gestalte Hoops mit!"), ist eine
Schmeichelei, und die Zielgruppe riecht sie.

**Warum ich sie trotzdem stelle** — die Abwägung offen, damit Patrick sie
umdrehen kann:

- **Die Gegenleistung ist nicht null, sie ist nur unsicher.** Bei 31 echten
  Profilen [BELEGT] hat eine einzelne Rückmeldung tatsächlich Gewicht. Das ist
  eine Tatsache über die Größe, keine Zusage — und genau deshalb steht sie **im
  Text als Grund** („Testphase") und **nicht als Versprechen**.
- **Die Alternative ist keine Zuwendung, sondern Füllmaterial.** „Zum Newsfeed"
  gibt ihm nichts, es tut nur so.
- **Die Bitte ist klein und einmalig sichtbar.** Sie steht am Ende einer Seite,
  die er freiwillig zu Ende gescrollt hat, nicht als Einblendung über seinem
  Feed.

**Die Grenze, die ich ziehe:** Diese Bitte gehört **auf diese eine Fläche**.
Wenn Feedback anfängt, den Nutzer im Produkt zu verfolgen (Aufforderung nach
dem Login, Erinnerung nach drei Besuchen, Einblendung im Feed), ist die Linie
überschritten. Das wäre ein Dark Pattern, und Ronjas Auftrag schließt genau das
aus.

---

## 7. Perspektiv-Check — ungeschönt

**Fall A: Ein Tester, seit vier Wochen dabei, hat ein Team.** Er sieht:
„Deine nächsten Schritte" (drei Karten, alle erledigt oder bekannt) → Korb →
„WAS FEHLT?".
*Versteht er es?* Ja, sofort. *Klickt er?* **Vielleicht — und das ist die
ehrliche Antwort.** Sein Grund zu klicken ist, dass er tatsächlich etwas
vermisst und gerade daran erinnert wurde. Sein Grund es zu lassen: Er hat
Feierabend. **Kein Text der Welt dreht das.** Was der Text leisten kann, ist,
die Hürde auf einen Satz zu senken — und das tut er.

**Fall B: Registriert seit zwei Tagen, Profil halb leer.** Die
Onboarding-Checkliste steht ganz oben auf derselben Seite [BELEGT,
`LandingOnboarding.js`], „Deine nächsten Schritte" darüber sagt ihm, was zu tun
ist. Unten wird er gefragt, was fehlt.
⚠️ **Schwachstelle, benannt:** Ihm fehlt vielleicht noch der Überblick, um die
Frage zu beantworten. **Ich verzweige trotzdem nicht** — erstens kann gerade
er die wertvollste Antwort geben (er ist frisch durch den Einstieg, und der
einzige belegte Testerbefund überhaupt lautete „neue User sind lost"), zweitens
kostet eine zweite Zustandsabfrage mehr, als diese seltene Fläche wert ist
(Abschnitt 1).

**Fall C: Jonatan zeigt die Seite einem Sponsor auf seinem eigenen Handy —
also angemeldet.** Der Sponsor liest „WAS FEHLT?" und „Testphase".
⚠️ **Das ist der unangenehmste Fall, und ich halte ihn trotzdem für den
besseren:** Der Abschreckungsgrund Nummer eins bei Z5 ist laut
`ZIELGRUPPEN.md` „erfundene oder aufgeblasene Reichweite" — nicht Offenheit
über den Stand. Ein Founding-Partner-Gespräch, das mit „wir sind noch im Aufbau"
beginnt, ist ehrlicher als eines, das damit endet, dass er `/teams` aufmacht
und Beispieldaten-Abzeichen zählt.

---

## 8. Messbarkeit — was heute geht und was nicht

**Was NICHT geht, und das muss dastehen:** `/feedback` wertet **keinen
Quell-Parameter** aus, und `app/api/feedback/route.js` speichert **keine
Herkunft** [BELEGT, Quelltext geprüft]. Ein `?src=home-cta` an dieser Taste
würde die Adresse verlängern und **nichts** messen. **Deshalb steht in meiner
Vorgabe ein nackter Link `/feedback`** — eine Messung vorzutäuschen ist
schlimmer als keine.

**Für Ben (Analytics), Vorschlag, keine Anweisung** — zwei Stufen, aufsteigend
nach Aufwand:

1. Ein Herkunftsfeld an `Feedback` (analog `?src=` bei der Registrierung),
   gefüllt aus einem Query-Parameter. Damit wäre beantwortbar, ob diese Fläche
   überhaupt je etwas liefert.
2. Ein `trackEvent` auf der einen Taste — dieselbe Empfehlung wie im Hero
   (`docs/HERO-AKTION-ENTSCHEIDUNG-2026-08-19.md` Abschnitt 8). Hero-Tasten sind
   bis heute nicht instrumentiert [BELEGT, Ronja].

⚠️ **Bis dahin gilt:** Die Wirkung dieser Fläche ist **unbelegbar**. Ich
behaupte sie nicht. Bei einer erwarteten Reichweite im einstelligen Bereich pro
Monat [HYPOTHESE] wäre auch eine Messung statistisch wertlos — die einzige
sinnvolle Auswertung ist die Frage „kam über diesen Weg je etwas?", und dafür
genügt Stufe 1.

---

## 9. Was Vivien konkret bekommt

In `components/landing/LandingCTA.js`: `if (!checked || loggedIn) return null;`
wird zu **zwei Zweigen** statt einem Abbruch. Gemeinsam: Abschnitt, `KorbRuhe`,
Aufbau.

**Ausgeloggt — unverändert** (Entscheidung vom 19.08. gilt weiter):
„Bereit loszulegen?" · „Jetzt registrieren" / „Bereits registriert? Anmelden" ·
Textzeile „Du organisierst dein Team? Team gründen".

**Angemeldet — neu:**

1. `KorbRuhe` **wie im ausgeloggten Zweig** (72 px, ab `md` 88 px — die
   Untergrenze aus `tests/e2e/abschluss-korb.spec.mjs` gilt unverändert).
2. Überschrift `h2`: **„Was fehlt?"** (10 Z.) — deutlich kürzer als „Bereit
   loszulegen?" (17 Z.), Zweizeiligkeit ist auf keiner Breite zu erwarten.
3. Text `text-mist-400`: **„Hoops ist in der Testphase. Was hier fehlt, wissen
   wir nur, wenn es jemand sagt."** (79 Z.)
4. **Eine** Taste, Primärstil (orange Fläche, `text-navy-950`):
   **„Feedback geben"** (14 Z.) → **`/feedback`** (ohne Parameter, s.
   Abschnitt 8).
5. **Eine** Kleinzeile darunter, `text-mist-400`, klein: **„Ein Satz reicht"**
   (15 Z.).
6. **Kein** zweiter Knopf, **keine** „Team gründen"-Zeile.

**Nach dem Bau sehe ich mir das gefinishte Stück aus Zielgruppensicht noch
einmal an** — nicht den Entwurf.

---

## 10. Wen ich einbezogen habe

- **Vivien (design-spezialistin)** — Empfängerin. Sie baut, ich prüfe danach die
  Botschaft. Offen für sie: die Dichte zweier aufeinanderfolgender mittiger
  Blöcke (Abschnitt 5).
- **Lina (onboarding-referentin)** — **Pflicht, ein Punkt:** Die Kleinzeile
  verspricht „ein Satz", das Formular auf `/feedback` zeigt sechs Felder
  (Abschnitt 4). Ob das auf ihrer Fläche behoben wird, entscheidet sie.
- **Ben (Analytics)** — Vorschlag Abschnitt 8, keine Anweisung. Ohne ihn bleibt
  diese Fläche unbelegbar, und dann sagen wir das lieber.
- **Ronja (Retention)** — zur Kenntnis wegen der Grenze in Abschnitt 6: Diese
  Bitte gehört auf diese eine Fläche und nicht ins Produkt.
- **Nora (recht-vorpruefung)** — **bewusst nicht.** Vier Zeilen ohne Preisangabe,
  ohne Vergleich, ohne Superlativ, ohne Zusage; „Testphase" ist bereits
  plattformweit im Einsatz. ⚠️ **Sie wird zuständig, sobald jemand eine Zahl
  ergänzt** („X Rückmeldungen", „schon Y Tester") oder aus dem Text ein
  Versprechen macht („entscheidet, was gebaut wird").
- **Jonatan (Partnerschaften)** — zur Kenntnis wegen Fall C in Abschnitt 7:
  Wenn er die Seite angemeldet vorführt, steht „WAS FEHLT?" darin. Das ist
  gewollt; er soll es vorher wissen.
- **Mats** — zur Kenntnis: Die verworfene Teilen-Variante steht auf seinem
  Liquiditäts-Befund und ist der wahrscheinlichste Nachfolger dieser
  Entscheidung.

---

## 11. Was an diesem Dokument NICHT belegt ist

- **Wer angemeldet auf `/` landet und ganz nach unten scrollt, ist
  [HYPOTHESE].** Es gibt keine Messung, die Angemeldete auf dieser Seite von
  Ausgeloggten trennt.
- **Die Größenordnung „einstellig pro Monat" ist [HYPOTHESE]**, abgeleitet aus
  ungefilterten Besucherzahlen [INDIZ] und 31 echten Profilen [BELEGT].
- **Dass „Was fehlt?" mehr Rückmeldungen erzeugt als „Zum Newsfeed" oder als
  gar kein Block, ist [HYPOTHESE]** — begründet, ungemessen, und mangels
  Herkunftserfassung heute auch nicht messbar (Abschnitt 8).
- **Der Zusammenhang „Feedback-Symbol seit 13.08. sichtbar → wird nicht
  benutzt" ist [INDIZ], nicht [BELEGT]:** Die Rückmeldungszahl stammt aus
  `docs/ZIELGRUPPEN.md` (Stand 12.08.) — ich habe die `Feedback`-Sammlung auf
  `hoops_prod` **nicht** neu gezählt. Wer die Entscheidung härten will, zählt
  dort nach; das ist ein Befehl, keine Recherche.
