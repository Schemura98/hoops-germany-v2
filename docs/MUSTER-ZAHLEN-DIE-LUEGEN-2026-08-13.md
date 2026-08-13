# Sieben Funde, ein Muster — die Nacht vom 13.08.2026

In einer Nacht sind sieben Fehler derselben Sorte aufgetaucht, gefunden von sechs
verschiedenen Beteiligten, in sechs verschiedenen Teilen der Anwendung. Einzeln
sind es Kleinigkeiten. Zusammen sind sie ein Systemfehler, und zwar ausgerechnet
an der Stelle, an der dieses Produkt sein ganzes Gewicht trägt.

> Der Zähler stand zwischenzeitlich auf fünf und dann auf sechs. Er wurde
> nachgeführt, statt die Überschrift stehenzulassen — in einem Dokument über
> Zahlen, die nicht mehr stimmen, wäre alles andere komisch.

## Das Muster

> **Eine Zahl oder eine Aussage, die im Sinne des Codes stimmt und im Sinne des
> Lesers falsch ist.**

Der Code sagt nie die Unwahrheit. `countDocuments({})` zählt korrekt alle
Dokumente. `resultStatus: "confirmed"` bedeutet korrekt „bestätigt". Ein
Analytics-Ereignis mit `playerId` ist korrekt ein Ereignis mit einer Spieler-Id.

Falsch wird es erst in dem Moment, in dem ein Mensch die Zahl liest, der ihre
Definition nicht kennt — und das ist immer genau der Mensch, auf den es ankommt:
der Sponsor, der Verein, der Spieler.

## Die fünf Fälle

| # | Was dastand | Was es wirklich war | Gefunden von |
|---|---|---|---|
| 1 | Sponsoren-Report: „70 Teams, 410 registrierte Nutzer" | `countDocuments({})` ohne Echtheitsfilter. Echt: **1 externes Team, 9 externe Nutzer.** Faktor ~70 bzw. ~45 | Ronja |
| 2 | Derselbe Report über den teilbaren Link | Der Endpunkt schickte das **komplette interne Summary**; gefiltert wurde erst im Browser. Wer den Link hatte, las die Netzwerkantwort | Vivien |
| 3 | Benachrichtigung: „von beiden Teams bestätigt" | Hing an `resultStatus === "confirmed"`. Das setzt auch `/admin/update-match`, wo **eine Person beide Punktzahlen tippt** | Benachrichtigungs-Agent, selbst |
| 4 | „Aktive Nutzer (7T/30T)" — laut Ronja die belastbarste Zahl im Report | Ein serverseitiges Ereignis hätte jeden **Empfänger** einer Benachrichtigung als aktiv gezählt, ohne dass er etwas tut. Gemessen: **88 statt 82** | Benachrichtigungs-Agent, selbst |
| 5 | Konzeptvorgabe: Karte mit „24 Punkte, von beiden Teams bestätigt" | Doppelt bestätigt ist **das Ergebnis**, nicht der Box-Score. Die Spielerwerte trägt *ein* Team-Admin ein | Nele |
| 6 | Sponsoren-Report: Abschnitt „Spielerprofile" | `topPlayers` wird aus `firstName lastName` **echter Personen** gebaut und ging an den Sponsor. Die Datenschutzerklärung nennt nur Auftragsverarbeiter; ein Sponsor ist keiner. Der Liga-Katalog enthält U18/U16 | Nora |
| 7 | Leerzustand `/tryouts`: Überschrift „ZUERST AUS SACHSEN" | Darunter standen Hamburg, München, Köln und Berlin. Eine Überschrift, die ihr eigener Inhalt widerlegt | Tryouts-Strang, selbst im Belegbild |

Fall 5 stammt aus einer Vorgabe von mir. Das Muster verschont niemanden.

Fall 6 ist der einzige, der nicht nur irreführend, sondern datenschutzrechtlich
relevant ist — und der einzige, bei dem eine **Person** statt einer Zahl
betroffen war.

Fall 7 zeigt das Gegenmittel in Reinform: Der Fehler war im Code nicht sichtbar
(die Vorsortierung nach Bundesland funktionierte korrekt), sondern erst im
**Bild**. Wer nur den Code liest, findet ihn nie.

## Warum es hier teurer ist als anderswo

Die Positionierung lautet „wie LinkedIn, nur nachweisbar". Das ganze Produkt
verkauft **Belegbarkeit**. Ein Portal, dessen Alleinstellungsmerkmal
Nachprüfbarkeit ist, verliert bei einer einzigen nachprüfbar falschen Zahl nicht
diese Zahl — es verliert das Argument.

Fall 1 wäre an einen Sponsor gegangen, der sich `/teams` selbst ansehen und die
„BEISPIELDATEN"-Abzeichen zählen kann. Fall 3 hätte einem Spieler eine
Bestätigung zugesichert, die es nicht gab.

## Was die Nacht gut gemacht hat

Vier der fünf Fälle wurden gefunden, **bevor** sie jemanden erreicht haben. Zwei
davon von denselben Agenten, die sie gebaut hatten — beim eigenen Nachprüfen.
Der Sponsoren-Report ist nachweislich niemandem gezeigt worden (von Patrick
bestätigt).

Das funktionierende Gegenmittel war jedes Mal dasselbe: **jemand hat die Zahl
gelesen wie ein Fremder**, statt zu prüfen, ob der Code tut, was dasteht.

## Vorschlag: eine stehende Regel

Zur Entscheidung durch Patrick — nicht von mir gesetzt.

> **Jede Zahl und jede Belegaussage, die einen Menschen außerhalb des Projekts
> erreichen kann, braucht einen Satz, der ihre Definition in der Sprache dieses
> Menschen ausspricht.** Steht dieser Satz nicht daneben, gilt die Zahl als nicht
> veröffentlichungsfähig.

Zwei Ableitungen, die sich heute Nacht bereits bewährt haben:

1. **Erlauben statt verbieten.** Der Endpunkt des Sponsoren-Reports baut sein
   Ergebnis jetzt aus ausdrücklich benannten Feldern neu, statt das interne
   Summary zu kürzen. Beim Kürzen ist jedes künftig ergänzte Feld automatisch
   öffentlich, bis jemand daran denkt. Bei der Positivliste ist es automatisch
   nicht öffentlich. Dasselbe Prinzip gehört überall dorthin, wo Internes und
   Externes aus derselben Quelle kommen.
2. **Belegaussagen hängen an dem, was sie behaupten** — nicht an einem Status,
   der zufällig danebensteht. „Von beiden Teams bestätigt" hängt an beidseitigem
   `submittedBy`, nicht an `resultStatus`.

## Offen

- `platform.matches` enthält sehr wahrscheinlich Demo-Spiele; es gibt keine
  gefilterte Entsprechung. Im Report vorerst nur ehrlich benannt
  („Spiele inkl. Beispieldaten"), nicht gelöst.
- „Besucher" sind dauerhafte localStorage-Kennungen, also Browser-Profile statt
  Menschen. „Ø Sitzungsdauer" zählt eine Ein-Seiten-Sitzung als 0 Sekunden.
  Interner Verkehr wird nirgends ausgeschlossen — bei neun externen Nutzern
  dominiert vermutlich das eigene Team jede Reichweitenzahl.
- Vollständige Liste: `docs/RETENTION-BEFUND-2026-08-13.md`, Abschnitt 3.
