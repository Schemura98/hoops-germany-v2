# Hoops Germany v2 – Deployment-Runbook (Hostinger VPS)

**Ziel:** v2 auf `hoopsgermany.de` ausrollen – **rollback-sicher** (Blue-Green: alte Seite bleibt
laufbereit, Umschaltung nur per Nginx). Stand: 26.06.2026.

> ⚠️ **Vor jedem Schritt Ausgabe an Claude geben** – wir gehen das gemeinsam durch und prüfen jede Phase,
> bevor es weitergeht. Nichts überstürzen.

**Architektur-Entscheidung (mit User abgestimmt):**
- v2 ersetzt die alte Seite **direkt auf `hoopsgermany.de`** (kein Subdomain-Test-Env).
- **Sicherheit:** alte Seite (`/root/sports/`, DB `test`) bleibt unberührt + gesichert; v2 läuft auf
  **eigenem Port + eigenem Verzeichnis + eigener DB**. Cutover = Nginx-Switch. Rollback = Nginx zurück.
- v2-DB = **neue Atlas-DB `hoops_prod`** (NIEMALS `test` oder die lokale Dev-DB `hoopsgermany`!), mit Demo-Daten geseedet.

---

## Phase 0 – Bestandsaufnahme & Backup (NICHTS verändern)

```bash
ssh root@<VPS-IP>

# Was läuft aktuell?
pm2 list                      # Name + Port des alten Prozesses notieren
node -v && npm -v             # Node >= 18 nötig (Next 14)
nginx -v
ls -la /root/sports/          # altes Projekt
cat /etc/nginx/sites-enabled/* | grep -A30 hoopsgermany   # alte Nginx-Config ansehen
```

**Backup (Pflicht, bevor irgendwas passiert):**
```bash
# 1) Alten Code sichern
tar czf /root/backup-sports-$(date +%F).tar.gz /root/sports

# 2) Alte Nginx-Config sichern
cp -r /etc/nginx/sites-available /root/backup-nginx-$(date +%F)

# 3) Alte DB "test" sichern (mongodump; Atlas-URI der ALTEN Seite verwenden)
#    URI steht in /root/sports/.env als MONGODB_URI
mongodump --uri="<ALTE_MONGODB_URI_zur_DB_test>" --out=/root/backup-db-test-$(date +%F)
```
➡️ **Ausgabe von `pm2 list`, `node -v`, der Nginx-Config und den Backup-Befehlen an Claude geben.**

---

## Phase 1 – v2-Code auf den VPS holen

Repo ist **privat** → Deploy-Key anlegen:
```bash
ssh-keygen -t ed25519 -C "vps-deploy" -f ~/.ssh/hoops_v2 -N ""
cat ~/.ssh/hoops_v2.pub
```
➡️ Den **Public Key** bei GitHub eintragen: Repo `hoops-germany-v2` → Settings → Deploy keys → Add
(read-only genügt). Dann:
```bash
cat >> ~/.ssh/config <<'EOF'
Host github-hoops
  HostName github.com
  User git
  IdentityFile ~/.ssh/hoops_v2
EOF

git clone github-hoops:Schemura98/hoops-germany-v2.git /root/hoops-v2
cd /root/hoops-v2
git checkout redesign        # aktueller Produktions-Stand
git log --oneline -3
```
➡️ **Ausgabe an Claude.**

---

## Phase 2 – `.env` auf dem VPS (echte Werte)

```bash
cd /root/hoops-v2
cp .env.example .env
nano .env
```
Folgendes ausfüllen (Werte hat der User / aus altem `.env` übernehmen, **aber DB-Name ändern**):
```
MONGODB_URI=mongodb+srv://<user>:<pass>@hoops.tbhsg.mongodb.net/hoops_prod?retryWrites=true&w=majority
SECRET_KEY=<langer Zufallswert – kann vom alten .env übernommen oder neu erzeugt werden>
SMTP_USER=info@hoopsgermany.de
SMTP_PASS=<Hostinger-Webmail-Passwort>
GOOGLE_CLIENT_ID=<aus Google Cloud Console>
GOOGLE_CLIENT_SECRET=<aus Google Cloud Console>
CRON_SECRET=<langer Zufallswert>
NEXTAUTH_URL=https://hoopsgermany.de
```
> ⚠️ **`/hoops_prod`** im URI ist entscheidend – so bleibt die alte DB `test` und die lokale Dev-DB
> `hoopsgermany` unberührt.
> Google-Redirect-URI in der Google Cloud Console muss `https://hoopsgermany.de/api/auth/google/callback` sein.

➡️ **NICHT** den Inhalt der `.env` an Claude schicken (enthält Geheimnisse) – nur bestätigen, dass alle 8 Werte gesetzt sind.

---

## Phase 3 – Installieren & Bauen

```bash
cd /root/hoops-v2
npm ci          # exakte Abhängigkeiten aus package-lock
npm run build   # muss grün durchlaufen (lokal bereits verifiziert)
```
➡️ **Build-Ausgabe (Ende) an Claude.**

---

## Phase 4 – Demo-Daten in die NEUE DB seeden

```bash
cd /root/hoops-v2
node scripts/dbcheck.mjs      # zeigt, mit welcher DB verbunden wird -> MUSS "hoops_prod" sein!
node scripts/seed-demo.mjs    # füllt hoops_prod (Teams/Spieler/Ligen/Spiele/Posts + Super-Admins)
```
> ⚠️ **Erst weiter, wenn `dbcheck` „hoops_prod" zeigt.** Falls dort `test` oder `hoopsgermany` steht → STOP,
> URI korrigieren (sonst Datenverlust!).

➡️ **Ausgabe an Claude.**

---

## Phase 5 – v2 mit PM2 auf eigenem Port starten (alte Seite läuft weiter!)

```bash
cd /root/hoops-v2
# v2 auf Port 3001 (alte Seite behält ihren Port, z.B. 3000)
PORT=3001 pm2 start "npm start" --name hoops-v2
pm2 save
curl -I http://localhost:3001        # sollte 200/307 liefern
```
➡️ **Ausgabe an Claude.** Jetzt läuft v2 parallel, ist aber noch NICHT öffentlich.

---

## Phase 6 – Cutover: Nginx von alt → v2 (der eigentliche Go-Live)

1. Neue Server-Config (oder bestehende anpassen) – Reverse-Proxy auf **3001**:
```bash
nano /etc/nginx/sites-available/hoopsgermany
```
```nginx
server {
    server_name hoopsgermany.de www.hoopsgermany.de;
    location / {
        proxy_pass http://localhost:3001;   # <- v2
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 10M;            # Datei-Uploads (Logos/Bilder)
    }
    # SSL-Zeilen (listen 443 / ssl_certificate ...) aus der alten Config übernehmen
}
```
2. Testen & laden:
```bash
nginx -t && systemctl reload nginx
```
3. **Im Browser prüfen:** https://hoopsgermany.de → v2 erscheint. SSL ok? (Cert deckt die Domain schon ab.)

➡️ **Ausgabe von `nginx -t` + Screenshot/Rückmeldung an Claude.**

---

## Phase 7 – Verifikation (live)

- [ ] Startseite lädt, Navy-Design + Logo korrekt
- [ ] Registrierung → Willkommensmail kommt an (jetzt mit echtem SMTP!)
- [ ] Login, Team-Admin, Ergebnis eintragen
- [ ] Google-Login (falls Keys gesetzt)
- [ ] Passwort-Reset-Mail
- [ ] Mobil testen

---

## 🔙 ROLLBACK (falls etwas schiefgeht)

```bash
# Nginx wieder auf die alte Seite zeigen lassen:
#   proxy_pass zurück auf den ALTEN Port (aus Phase 0 notiert, z.B. 3000)
nano /etc/nginx/sites-available/hoopsgermany    # proxy_pass -> http://localhost:<ALTER_PORT>
nginx -t && systemctl reload nginx
# v2 ggf. stoppen:
pm2 stop hoops-v2
```
Die alte Seite + DB `test` waren nie verändert → sofort wieder live. Notfalls Code aus
`/root/backup-sports-*.tar.gz`, DB aus `/root/backup-db-test-*` wiederherstellen.

---

## Spätere echte Launch-Bereinigung (optional, nach Testphase)
- Demo-Daten aus `hoops_prod` entfernen / frisch seeden, Patrick & Jonatan registrieren neu.
- Alte DB `test` löschen, alten `/root/sports/`-Prozess endgültig entfernen.
