# Übergabe — Stand 13.08.2026, Nachmittag

Für die nächste Sitzung nach einem Kontext-Neustart. **`CLAUDE.md` Abschnitt 0 bleibt
die kanonische Quelle** — hier steht nur, was gerade in der Luft ist und was ein
frischer Kopf sofort wissen muss.

---

## 1. Wo der Code steht

| | |
|---|---|
| **Live auf hoopsgermany.de** | `3c38959` |
| **Lokal noch nicht deployt** | nichts – der Arbeitsbaum ist sauber |
| **Rollback-Kette** | `5073951` → `560e1e6` → `27a04fe` → `e7a38ce` → `275f124` → `a8e4fd4` (vor der Nachtschicht) → `562c629` (vor dem Redesign) |

Rollback ist immer dieselbe Zeile auf dem VPS:

```
cd /root/hoops-v2 && git checkout <hash> && npm run build && pm2 restart hoops-v2
```

**Alles ist deployt und durch beide Gates gegangen.** Seit dem Stand von gestern Abend
(`a8e4fd4`) sind es rund 70 Commits.

Was heute live ging, in Stichworten: Nachtschicht (Benachrichtigungen „Deine Zahlen
stehen", Liga-Achse, Plattform-Tour, `/tryouts`-Wege, Navigation, Signup-Motiv) ·
Kaderprüfung beim Statistik-Speichern · Feedback-Zugang ins Sticky-Chrome ·
Liga-Suche · Kaderplatz-Freigabe über acht Wechselwege · Newsfeed-Umbau ·
„Plattform ab 16" inklusive Altersnachweis bei der Registrierung.

---

## 2. Was Patrick entscheiden muss — nichts davon ist beantwortet

1. **Leistungskarte: bauen oder nicht?** Vollständige Vorlage in `docs/leistungskarte/`
   (inkl. `ansicht.html`, die die Karte zeigt statt beschreibt). Empfehlung: Noras
   Stufe 0 (Link statt Bilddatei) — sie beantwortet die teuerste offene Frage, bevor
   Geld fließt. Neles härtester Einwand: Mit **einem** externen Verein gibt es kein
   bestätigtes Spiel, über das eine Karte entstehen könnte.
2. **Sponsorenlogo auf der Karte?** Laut Nora ist das Logo der **Auslöser** der
   Gewerbeanmeldung, nicht eine spätere Zutat.
3. **Wortlaut einer Einwilligungserklärung.** Der Altersnachweis ist gebaut und live,
   aber was dort steht, ist eine **Tatsachenangabe des Nutzers**, kein Rechtstext. Ob es
   eine förmliche Einwilligung braucht, gehört Patrick und Nora.
   Dazu: Der **Google-OAuth-Weg ist lokal nicht testbar** (keine Keys) — die
   Cookie-Logik wurde nur im Code geprüft. **Einmal echt auf Prod durchspielen.**
4. **„Mein Profil"** ist aus der waagerechten Navigationsleiste verschwunden (der Avatar
   daneben führt zum selben Ziel). Einzeiler zurück, falls er es vermisst.
5. **Internes Testkonto mit Altersangabe „1"** auf `hoops_prod` — offensichtlicher
   Tippfehler, nicht angetastet.

---

## 3. Was offen liegt und niemandem zugewiesen ist

- **Lina Vogts erster Einsatz.** Sie existiert seit heute als Agent
  (`~/.claude/agents/onboarding-referentin.md`), war in dieser Sitzung aber noch nicht
  registriert. **Auftrag steht bereit:** Prüfen, ob ein Neuling die sieben Funktionen
  der letzten 24 Stunden überhaupt findet (Benachrichtigungen, Liga-Achse, eigene
  Platzierung, `/rangliste`, `/tryouts`-Wege, Liga-Suche, Feedback-Zugang). Für **keine**
  davon wurde die Entdeckbarkeit geprüft.
  ⚠️ Sie soll ausdrücklich auch sagen, ob ihre Rolle von Vivien/Nele/Ronja aufgesogen
  wurde — eine Rolle, die sich nicht rechtfertigen kann, gehört abgeschafft.
- **Hanna** muss im Backoffice nachtragen, dass Lina jetzt auch als Agenten-Definition
  existiert, nicht nur als Skill.
- **Nele:** Tour-Texte gegenlesen (sie hatte darum gebeten).
- **Kleinigkeiten aus den Gates:** Klickfläche des Feedback-Symbols 20×20 px (unter dem
  24er-Minimum); Suchfenster schließt nicht mit Escape; `deletePlayer` könnte auf
  `slotsFreigeben` umgestellt werden; `admin/setteamadmin` protokolliert keinen Transfer.

---

## 4. Fallen, die heute Zeit gekostet haben

**Diese Liste ist der eigentliche Wert dieser Datei.**

1. **`npm run build` zerstört ein laufendes `next dev`/`next start` und umgekehrt.**
   Steht in CLAUDE.md, ist heute trotzdem dreimal passiert. Vor jedem Build:
   `curl http://localhost:3000`. Nicht `netstat | grep LISTEN` — Windows ist hier
   **deutsch** und schreibt `ABHÖREN`.
2. **Playwright startet seinen eigenen Dev-Server und überschreibt `.next`.** Reihenfolge
   ist deshalb: **Playwright → Build → `npm start`**. Andersherum findet `npm start`
   keinen Production-Build.
3. **`TaskStop` beendet die npm-Hülle, nicht den Node-Prozess darunter.** Der alte
   Server hält Port 3000 weiter und beantwortet Anfragen mit dem **alten** Build — man
   prüft dann minutenlang eine Änderung, die gar nicht ausgeliefert wird. Sauber
   beenden über `Get-NetTCPConnection -LocalPort 3000 | Stop-Process`.
4. **Mehrere Agenten in einem Arbeitsbaum: nie `git add` ohne `git commit` im selben
   Befehl.** Heute sind dadurch Dateien eines Strangs im Commit eines anderen gelandet.
5. **Agenten-Befunde nachprüfen.** Vivien meldete, `AuthShell` verlinke die Rechtstexte
   mit Backslash — Quelle und Live-Seite tragen beide `/datenschutz`. Der Befund war
   falsch. Umgekehrt hat Kai dreimal hintereinander etwas gefunden, das ich für
   vollständig hielt.

---

## 5. Das eine Dokument, das vor jeder nutzersichtbaren Zahl zu lesen ist

**`docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md`** — acht Fälle derselben Sorte in 24
Stunden: *eine Zahl oder Aussage, die im Sinne des Codes stimmt und im Sinne des Lesers
falsch ist.* Zwei davon entstanden in Code, der **nach** dem Dokument geschrieben wurde,
einer davon von mir.

Die zwei Regeln, die sich bewährt haben:

- **Erlauben statt verbieten.** Wo Internes und Externes aus derselben Quelle kommen,
  wird die Antwort aus benannten Feldern neu gebaut — nie das interne Objekt gekürzt.
- **Belegaussagen hängen an dem, was sie behaupten**, nicht an einem Status, der zufällig
  danebensteht. „Von beiden Teams bestätigt" hängt an beidseitigem `submittedBy`, nicht
  an `resultStatus` (das setzt auch `/admin/update-match`, wo **eine** Person beide
  Punktzahlen tippt).

---

## 6. Wichtige Dokumente von heute

| Datei | Was drinsteht |
|---|---|
| `docs/RETENTION-BEFUND-2026-08-13.md` | Ronja: keine fehlende Funktion, überall fehlende Verbindungen. Grundlage der Nachtschicht |
| `docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md` | die acht Fälle + die zwei Regeln |
| `docs/leistungskarte/` | Entscheidungsvorlage für Patrick, mit Ansicht |
| `docs/RECHT-LEISTUNGSKARTE-2026-08-13.md` + `-NACHTRAG-` | Nora: Ampeln, Stufen 0/1/2, Neubewertung mit „ab 16" |
| `docs/NEWSFEED-UMBAU-2026-08-13.md` | Vivien: was sie bewusst **nicht** gemacht hat |
| `docs/TOUR-UMBAU-2026-08-13.md` | Tour: vier von fünf Schritten mit echter Handlung |

---

## 7. Laufende Verabredung

Patrick ist für einige Stunden weg, der Rechner bleibt an, **alle Freigaben erteilt** —
Deploy ausdrücklich eingeschlossen. Die drei Grenzen, die trotzdem gelten und die ich
ihm genannt habe:

- **Kein Deploy an den Gates vorbei** (Build, Playwright, Production-Runtime, Kai, Tobias).
- **Produktivdatenbank nur gezielt und abgestimmt.** Heute zweimal genutzt: die
  U16-Bereinigung (von ihm angewiesen) und zwei rein lesende Prüfungen.
- **Nichts nach außen** — keine Mails, keine Zahlen an Dritte.
