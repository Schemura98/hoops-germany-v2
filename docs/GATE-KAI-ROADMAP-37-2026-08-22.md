# Gate-Bericht Kai — Roadmap 37: Löschen von Beiträgen und Kommentaren
**22.08.2026 · Prüfbasis `e9a8ef3..6f02a9b` ohne Doku · isolierter Worktree, Port 3210**

## Urteil in einem Satz

**Freigabefähig mit einer Auflage.** Die drei gesetzten Sperren halten — jede
einzeln gemessen, jede durch eine Gegenprobe rot gesehen. Es gibt **keinen Weg,
mit dieser Funktion an fremde Daten zu kommen.** Die Auflage betrifft eine
Zeile, die heute niemand erreicht, aber morgen jeder Aufrufer erreichen kann.

---

## Für Patrick, ohne Fachsprache

Es geht um den neuen Papierkorb: Nutzer können ab jetzt eigene Beiträge und
eigene Kommentare selbst wegwerfen. Das ist die **erste Funktion überhaupt, mit
der ein normaler Nutzer etwas endgültig vernichten kann** — bisher konnte das nur
ein Betreiber. Deshalb war die Frage nicht „funktioniert es", sondern „kann
jemand damit etwas kaputtmachen, das ihm nicht gehört".

**Antwort: nein.** Ich habe es mit zwei Konten und zwölf verschiedenen
Trickversuchen probiert. Kein einziger fremder Beitrag, kein einziger fremder
Kommentar ließ sich anfassen. Auch die wichtigste Regel hält: **Spielergebnisse
und Transfers lassen sich nicht löschen** — auch nicht vom eigenen Verein, auch
nicht vom Verfasser. Das ist die Regel, an der die ganze Aussage der Plattform
hängt („bei uns kann man Zahlen nicht schönen").

Drei Dinge sollte man wissen:

1. **Eine Zeile ist eine Falle für später.** Wenn die Oberfläche eines Tages beim
   Löschen einer *Antwort* versehentlich eine leere Angabe schickt, verschwindet
   nicht die Antwort, sondern der **ganze Kommentar mit allen Antworten darunter**
   — und der Nutzer bekommt „Kommentar gelöscht" gemeldet, als sei das gewollt.
   Heute passiert das nicht, weil die Oberfläche immer eine echte Angabe schickt.
   Es ist eine Zeile Arbeit, das dauerhaft auszuschließen. **Ich habe es nicht
   gemacht** — Sicherheitsbefunde melde ich, ich fixe sie nicht eigenmächtig.
2. **Die Ergebnis-Sperre erkennt Ergebnisse an genau einem Merkmal.** Fehlt dieses
   Merkmal, ist die Sperre blind. Ich habe auf der Live-Datenbank nachgezählt:
   **kein einziger** der 310 Live-Beiträge ist davon betroffen. Es ist also heute
   kein Loch, sondern eine Annahme, die man kennen sollte.
3. **Es gibt keine Bremse gegen Massenaufrufe** — aber die gibt es an keiner
   einzigen Stelle der Plattform, und hier ist sie am wenigsten nötig: Wer die
   Funktion flutet, löscht nur seine eigenen Sachen.

---

## Schritt 1 — Sicherheit

### B1 · Eingabe-Einschleusung: die ID wird nie geprüft (mittel, Härtung)

`body.postId` geht **ungeprüft** in `Post.findById`. Gemessen mit zwölf
Nutzlasten, angemeldet als ein fremder Nutzer:

| Nutzlast | Antwort | Bedeutung |
|---|---|---|
| `{"$ne": null}` | **403** | wirft **nicht** — Mongoose baut daraus eine gültige Abfrage und liefert einen **beliebigen** Beitrag |
| `{"$exists": true}` | **403** | dito |
| `["<id>","<id>"]` (Array) | **403** | dito |
| `{"$in": [...]}` | **403** | dito |
| `{"$gt": ""}` · `{"$where": "1==1"}` · `{"$regex": ".*"}` · `true` · `{a:1}` | **500** | CastError schlägt als „Interner Serverfehler" durch |
| `null` · `""` · `0` | 400 | sauber abgefangen |

**Nichts wurde gelöscht — der Bestand war vorher wie nachher identisch.** Aber
der Grund dafür ist nicht, dass die Einschleusung scheitert; sie **erreicht die
Datenbank**. Was sie stoppt, ist allein die Berechtigungsprüfung auf dem
**gefundenen** Dokument. Das ist eine echte Rückfallebene, aber es ist die
**einzige**.

Zwei Folgen, die das über „theoretisch" hinaushebt:

- Ein Aufrufer mit fehlerhafter ID bekommt einen **zufälligen eigenen Beitrag**
  gelöscht statt einer Fehlermeldung. Kein fremder Schaden, aber ein stiller
  Verlust beim eigenen Nutzer.
- Jede künftige Verzweigung *neben* der Berechtigungsprüfung — Super-Admin,
  Moderation, Co-Admin — erbt eine ungeprüfte ID. Der Schutz liegt an einer
  Stelle, an der er beim nächsten Feature nicht mitwächst.

#### ⚠️ Und das ist keine Theorie geblieben — die Mutationsmatrix hat es vorgeführt

Bei Mutation **M2** (Berechtigungsprüfung in `deletepost` entfernt) hat die
Nutzlast `{"$ne": null}` **einen echten Beitrag der Dev-Datenbank gelöscht** —
einen, den der Aufruf nie benannt hat. Nachgezählt: Der Bestand fiel von 14 auf
13, und zwar bei den Alt-Beiträgen ohne `kind`-Feld (8 → 7). Der Wächter hat es
gemeldet (der Einschleusungs-Fall war unter M2 rot), aber der Beitrag war weg.

**Damit ist gemessen, was oben nur als Risiko stand:** Zwischen einem
eingeschleusten Abfrage-Operator und der Vernichtung eines beliebigen fremden
Beitrags steht **genau eine** `if`-Zeile. Nimmt man sie weg, greift die
Einschleusung sofort durch. Eine ID-Prüfung wäre die zweite Zeile — und sie
säße vor der Datenbank statt dahinter.

*(Betroffen war ausschließlich die Dev-DB `hoopsgermany`, ein Beispiel-Beitrag
aus dem Seed-Bestand. Wiederherstellbar mit `node scripts/seed-demo.mjs`.
`hoops_prod` wurde zu keinem Zeitpunkt beschrieben.)*

**Empfehlung (eine Zeile, beide Routen):**
```js
if (!mongoose.isValidObjectId(body.postId)) return fail("Ungültige Beitrags-ID", 400);
```
Das nimmt zugleich die fünf 500er weg. Ein 500 auf eine vom Nutzer wählbare
Eingabe ist Rauschen im Fehlerprotokoll, in dem echte Ausfälle untergehen.

### B2 · Die Ereignis-Sperre hängt an genau einem Zeichenvergleich (niedrig heute)

`post.kind === "auto"` ist der ganze Schutz. Gemessen an eigens angelegten
Beiträgen:

| Beitrag | Antwort |
|---|---|
| `kind:"auto"`, eigener Verfasser | **403**, bleibt |
| `kind:"auto"`, Beitrag des eigenen Vereins | **403**, bleibt |
| `autoType:"match_result"`, **`kind` fehlt** | **200 — gelöscht** |
| `autoType:"match_result"`, `kind: null` | **200 — gelöscht** |
| `kind:"AUTO"` (Großschreibung) | **200 — gelöscht** |

**Auf `hoops_prod` nachgezählt, nur lesend — es ist heute nicht auslösbar:**

| | Prod | Dev |
|---|---|---|
| Beiträge gesamt | 310 | 14 |
| davon `kind:"auto"` | 79 | 6 |
| davon `kind:"user"` | 43 | 0 |
| **davon ohne `kind`-Feld** | **188** | 8 |
| **`autoType` gesetzt, aber `kind ≠ "auto"`** | **0** | 0 |
| `eventKey` gesetzt, aber `kind ≠ "auto"` | **0** | 0 |
| `meta.matchId` gesetzt, aber `kind ≠ "auto"` | **0** | 0 |

Die 188 Beiträge ohne `kind` sind Altbestand aus der Zeit vor dem Feld;
stichprobenhaft gelesen sind es Wortmeldungen („Hartes Training heute"), keine
Ereignisse. Der Erzeuger `lib/autoPost.js` setzt `kind:"auto"` an allen fünf
Stellen, das Schema hat `enum:["user","auto"]`. Und die **Oberfläche prüft
dieselbe Bedingung** (`PostCard.js:424`) — Anzeige und Route sind sich einig.

Es ist also kein Loch, sondern eine **Annahme über künftige Schreiber**: Ein
Seed-Skript, eine Migration oder ein direkter Einfügevorgang, der `kind`
vergisst, macht ein Ergebnis löschbar. Gegen die Erwartung, dass 188 von 310
Live-Beiträgen das Feld gar nicht tragen, ist „`kind` ist immer gesetzt" keine
Eigenschaft der Daten.

**Empfehlung:** `post.kind === "auto" || post.autoType || post.eventKey`.

### B3 · `replyId` mit leerem Wert löscht den ganzen Kommentar (niedrig — AUFLAGE)

Die Route verzweigt über `if (body.replyId)`, also über den **Wahrheitswert**.
Gemessen am **eigenen** Kommentar mit zwei Antworten:

```
{ postId, commentId, replyId: null }  →  200 "Kommentar gelöscht"
                                          Kommentar weg, BEIDE Antworten weg
```

Aus „meine Antwort löschen" wird stillschweigend „mein Kommentar mit allen
Antworten löschen", quittiert mit 200 und der falschen Meldung. Die
Berechtigung bleibt korrekt (an einem **fremden** Kommentar gibt derselbe Aufruf
403) — es ist keine Rechteausweitung, sondern eine **Wirkungsausweitung**.

**Heute nicht erreichbar:** `components/posts/PostCard.js:119` schickt immer
`reply._id`, und die Antwort existiert an dieser Stelle. Der Weg entsteht erst
bei einem künftigen Aufrufer mit `replyId: antwort?._id`.

**Empfehlung:** `if ("replyId" in body)` statt `if (body.replyId)` — dann trifft
ein leerer Wert den Antwort-Zweig und wird sauber mit 404 abgewiesen.

⚠️ **Nicht behoben.** Der Wächter `beitrag-loeschen.spec.mjs` enthält diesen
Fall und ist deshalb **rot**. Das ist Absicht: Ein Befund, den man wegkommentiert,
ist ein Befund, den niemand mehr sieht.

### Entwarnung, gemessen statt geglaubt: der `"null" === "null"`-Fall greift nicht

Kais Vermutung war richtig. `post.authorTeam && player.teamAdminOf && …` prüft
beide Seiten auf Wahrheitswert, bevor verglichen wird. Gemessen mit einem
Beitrag ohne Verfasser und ohne Verein, aufgerufen von einem Nutzer **ohne**
`teamAdminOf`: **403, Beitrag bleibt.**

Der Wächter hat dafür einen eigenen Fall, und die Mutation **M3** (die beiden
Wahrheitsprüfungen entfernt) macht genau ihn rot. Die Zusicherung ist nicht nur
wahr, sie ist auch bewacht.

### Nebenbefund · Die Route prüft `teamAdminOf`, nicht `isTeamAdmin`

`lib/serverAuth.js` verlangt für Dual-Auth **beides** (`isTeamAdmin && teamAdminOf`),
diese Route nur `teamAdminOf`. Gemessen: `setteamadmin` setzt und löscht beide
Felder immer gemeinsam, und auf `hoops_prod` gibt es **54 Spieler mit
`teamAdminOf`, davon 0 ohne `isTeamAdmin`** (Dev: 4 / 0). Heute also keine
Abweichung, und CLAUDE.md führt `teamAdminOf` ausdrücklich als den tragenden
Weg. **Kein Defekt** — aber es ist die zweite Stelle im Projekt, die diese
Frage eigenständig beantwortet.

### Nebenbefund · Oberfläche und Route sind sich beim eigenen Beitrag nicht ganz einig

Die Oberfläche verlangt zusätzlich `!post.authorTeam` (`PostCard.js:445`), die
Route nicht. Ein Beitrag mit **Verfasser und Verein zugleich** wäre über die
API löschbar, trüge aber keinen Knopf. Gemessen: solche Beiträge gibt es
**nicht** — Prod 0, Dev 0 (39 bzw. 1 reine Vereins-Beiträge, alle ohne
Verfasser). Folgenlos, hier nur notiert.

### Drosselung — fehlt, ist hier aber nicht schlimmer als sonst

Gemessen, 30 parallele Aufrufe:

| | Antworten | Dauer |
|---|---|---|
| `deletepost` (eigener Beitrag) | 13× 200, 17× 404 | 304 ms |
| `playerlogin` mit falschem Passwort (Vergleichsmaß) | 30× 401 | 1.779 ms |

**Kein 429, nirgends.** Es gibt im ganzen Projekt keine Drosselung. Hier ist sie
am wenigsten dringend: Der Aufruf verlangt eine Anmeldung und wirkt
ausschließlich auf eigene Daten — wer flutet, schadet sich selbst. Die
unangenehmere ungedrosselte Route bleibt das **unauthentifizierte**
`forgotpassword` (in CLAUDE.md bereits protokolliert).

⚠️ Nebenbeobachtung: **13 von 30** parallelen Löschversuchen desselben Beitrags
antworteten je mit 200. `findByIdAndDelete` läuft ohne Sperre; alle 13 melden
Erfolg für ein und dasselbe Dokument. Harmlos, aber eine Oberfläche, die auf die
Erfolgsmeldung hin herunterzählt, zählt hier dreizehnmal.

---

## Schritt 2 — Der Wächter

**Neu: `tests/e2e/beitrag-loeschen.spec.mjs` — 18 Fälle.**

| Gruppe | Fälle |
|---|---|
| Sperre 1 · Ereignis-Beiträge | 3 (inkl. Gegenrichtung: ein normaler Beitrag muss weggehen) |
| Sperre 2 · nur eigene Beiträge | 6 (fremd · ohne Anmeldung · Müll-Token · fremder Verein · eigener Verein beide Richtungen · Beitrag ohne Autor) |
| Sperre 3 · fremde Kommentare | 6 (inkl. Gegenrichtung und dem roten B3-Fall) |
| Einschleusung | 2 (je 9 Nutzlasten auf `postId` bzw. `commentId`/`replyId`) |
| Oberfläche | 1 (Aussage über **alle** Karten) |

**Ergebnis: 17 grün / 1 rot.** Die eine rote ist B3 — ein Befund, kein Testfehler.

### Der Oberflächen-Fall, und warum er anders gebaut ist

„Der Löschknopf erscheint nur beim eigenen Beitrag" ist eine Aussage über
**jede** Karte im Bild. Der Fall legt 3 eigene, 3 fremde und 2 Ereignis-Beiträge
an, sammelt die **vollständige** Knopfliste (`querySelectorAll`) und beurteilt
jede Karte einzeln — in beide Richtungen: kein fremder und kein Ereignis-Beitrag
darf einen Knopf tragen, **und jeder eigene muss einen haben**. Ohne die zweite
Richtung wäre eine Oberfläche ganz ohne Knöpfe vollständig grün.

⚠️ **Er trägt eine Ehrlichkeitsschranke, und sie hat zweimal zugeschlagen.**
Der „Für dich"-Feed ist **gerankt und liefert 10 Beiträge je Seite**. Im ersten
Lauf standen die drei fremden Beiträge gar nicht im Bild — der Fall hätte „null
fremde Löschknöpfe" gemeldet und wäre grün gewesen, **weil er null fremde Karten
gesehen hat**. Behoben durch: Verfasser aus dem tatsächlichen Feed nehmen (nicht
frei wählen — der Feed zeigt nur, wem man folgt), nachladen bis alle acht Marken
im Bild sind, und ein hartes Rot, wenn danach eine fehlt.

⚠️ **Befund am Bauteil:** Die Beitragskarte hat **keine Kennung**. Der einzige
stabile Griff ist der Vorlese-Text „Beitrag löschen" am Knopf; die Zuordnung
Knopf → Beitrag läuft über den Beitragstext. Ein `data-post-id` an der Karte
würde diesen Test und jeden künftigen erheblich tragfähiger machen. (→ Vivien/Kai)

---

## Schritt 3 — Mutationsmatrix: **8 von 8 gefangen**

Jede Sperre einzeln zurückgebaut, jeweils eigener Lauf, Quelle danach
wiederhergestellt (Arbeitsbaum am Ende sauber).

| # | Zurückgebaut | Ergebnis | Gefangen von |
|---|---|---|---|
| M1 | Ereignis-Sperre entfernt | **3 rot** | beide Sperre-1-Fälle |
| M2 | Berechtigung `deletepost` entfernt | **6 rot** | 4× Sperre 2 + Einschleusung |
| M3 | Vereins-Zweig ohne Wahrheitsprüfung | **2 rot** | „Beitrag ohne Autor" |
| M4 | 401 wird zu 404 | **3 rot** | ohne Anmeldung, Müll-Token |
| M5 | Kommentar-Berechtigung entfernt | **2 rot** | fremder Kommentar |
| M6 | Antwort-Berechtigung entfernt | **2 rot** | fremde Antwort |
| M7 | Oberfläche zeigt Knopf an Ereignissen | **2 rot** | Oberflächen-Fall |
| M8 | Oberfläche zeigt Knopf überall | **2 rot** | Oberflächen-Fall |

(In jeder Zeile ist eine der roten der stehende B3-Fall.)

**Damit ist jede der drei Sperren mindestens einmal rot gesehen worden.**

---

## Zwei Fehler in meinem eigenen Vorgehen — beide gehören hierher

**(1) Meine erste Messreihe hat ihre eigenen Daten zerstört.** Die
Einschleusungs-Schleife enthielt `replyId: null` auf einen Kommentar, der dem
prüfenden Konto gehörte — der Aufruf war berechtigt und löschte den Kommentar,
den die **nächsten drei Fälle** brauchten. Die meldeten danach „404 nicht
gefunden" statt der Berechtigungsantwort, die sie prüfen sollten. Das ist genau
die Lehre, die im Auftrag stand („Gegenproben einzeln fahren"), und ich bin
trotzdem hineingelaufen. Der Wächter legt deshalb **für jeden Fall eigene
frische Daten** an.

**(2) Mein erster Durchlauf der Mutationsmatrix meldete acht saubere Ergebnisse
für acht Läufe, die nie stattgefunden haben.** Auf Port 3210 lief noch mein
eigener, von Hand gestarteter Server mit einem **älteren Build**. Die
`BUILD_ID`-Prüfung aus Roadmap 23 hat ihn erkannt und jeden Lauf **abgebrochen**
— und meine Auswertung las „kein `N failed` in der Ausgabe" als **„0 failed"**.
Ein Auswerter, der Abwesenheit von Messung als bestandene Messung liest.

> Dieselbe Fehlerform wie „eine Messung darf ihren Gegenstand nicht mitmessen",
> nur eine Ebene höher: **eine Auswertung darf das Ausbleiben eines Laufs nicht
> als Ergebnis melden.** Behoben durch eine Schranke, die ohne Summenzeile
> ausdrücklich „nicht gemessen" schreibt.

✅ Und der Nebengewinn: **Die Zombie-Sperre aus Roadmap 23 hat sich an mir selbst
bewährt.** Ohne sie hätte ich eine Mutationsmatrix gegen alten Code gefahren und
als Beleg gemeldet.

---

## Läufe

```
npx playwright test -c tests/e2e/playwright.config.mjs        # E2E_PORT=3210, isolierter Worktree
→ 336 grün / 6 rot / 1 übersprungen   (343 gesamt, 34 Dateien)
```

Vorher (Kais Zählung): 319 grün / 5 rot / 1 übersprungen, 325 in 33 Dateien.
**+18 Fälle**, davon 17 grün. Die 5 vorbestehenden roten sind unverändert
namentlich `analytics-ehrlichkeit` (3×) und `sponsor-report` (2×) — Roadmap 26,
die Speichergrenze der Auswertung; keiner berührt das Löschen. Die sechste ist
B3.

`npm run build` durch (Exit 0, im isolierten Worktree, **nicht** im Hauptbaum —
Port 3000 gehörte Tobias).

**Zustand der Dev-DB nach dem Gate:** 13 Beiträge (vorher 14). Alle
Testdatensätze sind entfernt; der eine fehlende Beitrag ist der oben
beschriebene Verlust aus Mutation M2 — ein Seed-Beispiel, wiederherstellbar mit
`node scripts/seed-demo.mjs`.

**Alle Messungen gegen die Dev-DB `hoopsgermany`.** Auf `hoops_prod` wurde
ausschließlich **gelesen** (Zählungen und Stichproben in den Tabellen oben);
kein Schreibvorgang, kein Testdatensatz.

---

## Wen ich einbezogen habe

- **Tobias (qa-reviewer):** parallel im Browser-Gate auf Port 3000. Ich bin
  bewusst nicht in seinen Baum gefahren und habe im Hauptbaum **nicht gebaut**.
  Meine grüne Suite ersetzt sein Urteil nicht — insbesondere die Frage, ob der
  Bestätigungsdialog auf einem Telefon **versehentlich** auslösbar ist, ist eine
  Augen- und Daumenfrage, keine Testfrage. Der Löschknopf sitzt in einer Liste,
  durch die gewischt wird.
- **Claude (Entwicklung):** B1–B3 sind an ihn adressiert; ich habe sie
  ausdrücklich **nicht** gefixt.
- **Vivien:** die fehlende Kartenkennung (`data-post-id`).
- **Patrick:** die Auflage B3 ist eine Zeile und braucht seine Freigabe.
- **Nora:** nicht eingeschaltet. Sobald die offene Moderationsfrage („darf der
  Verfasser fremde Kommentare unter seinem Beitrag löschen") entschieden wird,
  gehört sie ihr — heute ist die Antwort „nein", und das ist die sichere Seite.

---

## Auflage

**Vor dem Deploy: B3 beheben** (`if ("replyId" in body)`). Eine Zeile. Solange
sie offen ist, steht der zugehörige Wächter rot — das ist der gewollte Zustand,
nicht der Endzustand.

**Empfohlen, aber nicht blockierend:** B1 (ID prüfen) und B2 (Ereignis-Merkmal
verbreitern). Beide sind Härtung gegen morgen, kein Loch von heute.
