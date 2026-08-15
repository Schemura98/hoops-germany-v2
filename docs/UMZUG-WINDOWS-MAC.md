# Umzug Windows → Mac: was an DIESEM Projekt hängt

Angelegt am 15.08.2026, als Patrick die Migration ankündigte. Das General Backoffice hat die
allgemeinen Vorbereitungen getroffen — hier steht nur, was **Hoops Germany v2** betrifft und
was aus dem Repo allein nicht ersichtlich ist.

Stand bei Anlage: **`950f23b`**, Arbeitsbaum sauber, alles gepusht, live ist `164c784`.

---

## 1. Was NICHT im Repo ist und ohne das nichts läuft

| Was | Wo | Ohne das … |
|---|---|---|
| **`.env`** (22 Zeilen) | Projektwurzel, **gitignored** | keine DB-Verbindung, kein JWT-Secret, kein `CRON_SECRET` — die App startet, aber jede Anmeldung und jeder DB-Zugriff scheitert |
| **`~/.ssh/hoops_vps`** | Benutzerverzeichnis | kein Deploy, kein Serverzugriff |

⚠️ **Beides händisch mitnehmen, nicht über Git.** Der SSH-Schlüssel braucht auf dem Mac
`chmod 600` — OpenSSH verweigert sonst den Dienst mit „UNPROTECTED PRIVATE KEY FILE".
Unter Windows sind Dateirechte lockerer, das fällt beim Kopieren nicht auf.

Der Inhalt von `.env` steht als leere Vorlage in `.env.example`; die **Werte** stehen nur in der
Datei selbst und auf dem VPS (`/root/hoops-v2/.env`). Wenn die lokale Datei verloren geht, ist
der Server die Quelle.

---

## 2. Was NICHT mitkopiert werden sollte

- **`node_modules/`** — neu installieren (`npm install`). Kopierte Abhängigkeiten sind eine
  häufige Quelle stiller Fehler. Entwarnung: Das Projekt hat **keine** nativen Module
  (`bcryptjs` ist reines JavaScript, `sharp` ist nicht in den Abhängigkeiten) — ein
  `npm install` genügt, es braucht keinen Rebuild-Schritt.
- **`.next/`** — neu bauen. Der Ordner enthält plattform- und pfadgebundene Artefakte.
- **`.claude/worktrees/`** — dort liegen **4 verwaiste Arbeitsbäume** von Agenten-Läufen
  (`git worktree list` meldet 5 Einträge). Vor dem Umzug aufräumen:
  `git worktree prune` und die Reste löschen; sonst wandern sie als Ballast mit und zeigen
  danach auf Pfade, die es nicht mehr gibt.

Erprobte Fassungen zur Zeit des Umzugs: **node v24.17.0**, **npm 11.13.0**. Next.js ist auf
14.2.35 gepinnt (s. CLAUDE.md) — beim Einrichten nicht versehentlich anheben.

---

## 3. Was auf dem Mac einfacher wird

**Die Port-Falle entfällt.** In CLAUDE.md steht mehrfach die Warnung, `netstat | grep LISTEN`
melde auf **deutschem Windows** einen belegten Port fälschlich als frei, weil dort `ABHÖREN`
statt `LISTENING` steht. Das ist eine reine Windows-Eigenheit.

`scripts/port-frei.sh` **funktioniert auf dem Mac unverändert**: `uname -s` liefert dort
`Darwin`, das Skript fällt in den POSIX-Zweig, findet kein `ss` und nutzt
`lsof -tiTCP:3000 -sTCP:LISTEN`. Das ist genau der richtige Weg für macOS. Weiterhin also:

```bash
sh scripts/port-frei.sh && npm run build
```

⚠️ **Der Grund für die Prüfung bleibt trotzdem bestehen**, und er ist plattformunabhängig:
`preview_stop` beendet den Dev-Server **nicht**, es löst ihn nur aus der Verwaltung. Ein Build
gegen einen laufenden Dev-Server überschreibt dessen `.next` und erzeugt ungestylte Seiten.
Das ist am 15.08. zweimal passiert, einmal davon trotz fünf vorheriger korrekter Prüfungen.

---

## 4. Textstellen, die nach dem Umzug nicht mehr stimmen

Der **Code** enthält keinen einzigen fest verdrahteten Windows-Pfad — geprüft über alle
`.js`/`.mjs`/`.json`. Betroffen ist nur Fließtext:

- `CLAUDE.md`: 2 Fundstellen `C:\dev\hoops-germany-v2` (Abschnitt „Projektort")
- `docs/CHRONIK.md` und `docs/ABLAGE-AUDIT-PUBLIC-2026-08-11.md`: historische Nennungen —
  **die gehören NICHT geändert.** Ein Protokoll beschreibt, wie es damals war.

Ebenfalls in CLAUDE.md anzupassen: der Hinweis „NICHT zurück nach OneDrive (OneDrive sperrt
`.next`)". Auf dem Mac ist die Entsprechung iCloud Drive — dasselbe Problem, anderer Name.

---

## 5. Zeilenenden

`core.autocrlf` steht auf **`false`**, eine `.gitattributes` gibt es nicht. Die Dateien liegen
also so im Repo, wie sie geschrieben wurden — beim Wechsel auf den Mac findet **keine**
Umwandlung statt und es entstehen keine Scheinänderungen.

Auf dem Mac ebenfalls `git config core.autocrlf false` setzen (dort ist `input` die Vorgabe),
sonst ändert der erste Commit womöglich Zeilenenden in Dateien, die niemand angefasst hat.

---

## 6. Erste Schritte auf dem Mac, in dieser Reihenfolge

```bash
git clone git@github.com:Schemura98/hoops-germany-v2.git
cd hoops-germany-v2 && git checkout redesign
```

```bash
npm install && npm run build
```

Danach `.env` einlegen, dann prüfen — in dieser Reihenfolge, weil jeder Schritt den nächsten
voraussetzt:

```bash
node scripts/dbcheck.mjs
```

```bash
npx playwright test -c tests/e2e/playwright.config.mjs
```

Die Suite ist die ehrlichste Einrichtungsprüfung, die das Projekt hat: **74 Tests**, sie
verlangt eine funktionierende `.env`, die Dev-DB `hoopsgermany` und die Seed-Konten. Läuft sie
grün durch, stimmt die Umgebung.

⚠️ **Vorher `node scripts/seed-demo.mjs`**, falls die Dev-DB leer ist. Die Suite hängt an
`max@test.de` / `test123` **in der Dev-DB** — diese Konten sind auf `hoops_prod` seit dem
15.08.2026 gesperrt, in der Dev-DB aber bewusst unverändert.

Zuletzt der Serverzugang:

```bash
chmod 600 ~/.ssh/hoops_vps && ssh -i ~/.ssh/hoops_vps root@92.113.25.249 "cd /root/hoops-v2 && git log --oneline -1"
```

Muss `164c784` zeigen (Stand 15.08.2026 abends).

---

## 7. Was beim Wiedereinstieg als Erstes ansteht

Nichts davon ist durch den Umzug betroffen, aber es sollte nicht untergehen:

1. **Das `/admin`-Passwort.** Es steht im **Klartext in zwei versionierten Dateien**, und
   dieses Repo ist auf den Produktionsserver geklont — das Passwort für das Verwaltungspanel
   liegt also auf dem Server, den es schützt. Beide Konten (`patrick`, `jonatan`) haben
   dasselbe. Gehört Patrick, nicht einem Agenten. **Der schwerste offene Punkt.**
2. **48 der 66 Prod-Teams haben einen unerreichbaren Admin** — Folge des Sicherheits-Eingriffs
   vom 15.08. Entscheidung nötig (Roadmap 16a).
3. Roadmap 16 (c)/(d): `teamlogin` entfernen, `email_verified` im Google-Callback auswerten.
4. Der Newsfeed-Umbau ist live, hat aber offene Auflagen: Register 3 („Deine Zahlen") ist unter
   `lg` ausgeblendet — ausgerechnet mobil, dem Hauptfall, ist das Kernversprechen damit nicht
   eingelöst. Beide Gates halten das für änderungsbedürftig; **wie**, entscheidet Vivien.
