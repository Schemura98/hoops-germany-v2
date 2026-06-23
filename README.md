# Hoops Germany

Community-Plattform für Amateur-Basketball in Deutschland.
Next.js 14 (App Router) · MongoDB/Mongoose · Tailwind CSS · JWT-Auth.

Live: [hoopsgermany.de](https://hoopsgermany.de)

## Setup

```bash
npm install
cp .env.example .env   # Werte eintragen
npm run dev            # http://localhost:3000
```

## Projektstruktur

```
app/                    App-Router-Seiten & API-Routen
  api/                  Route-Handler (POST/GET ...)
  team/  player/  admin/  ...   Feature-Bereiche
components/
  layout/               Navbar, Footer
  ui/                   Wiederverwendbare UI-Bausteine (Button ...)
lib/
  db.js                 Cached Mongoose-Verbindung
  auth.js               JWT signieren/verifizieren (Player & Team)
  mailer.js             Nodemailer (SMTP Hostinger)
  apiResponse.js        Einheitliche ok()/fail()/withErrorHandling()
  constants.js          POSITIONS, Status-Enums, TOKEN_KEYS
  fonts.js              Inter (next/font/google)
models/                 Mongoose-Modelle (Player, Team, Match, ...)
```

## Konventionen

- **API-Pattern**: siehe `app/api/player/playerlogin/route.js` als Referenz —
  `connectDB()` → Eingaben prüfen → Logik → `ok()/fail()`, gewrappt in `withErrorHandling`.
- **Modelle**: immer `mongoose.models.X || mongoose.model("X", schema)` (keine Doppel-Definition).
- **Auth**: zwei Token-Typen in `localStorage` — `playerAuthToken`, `teamAuthToken`.
  Team-Admin-Endpunkte akzeptieren beide.
- **Design**: Primärfarbe Orange (`brand-500` = `#f97316`), Hintergrund `gray-50`,
  Cards weiß, Font Inter. Buttons: `bg-brand-500 hover:bg-brand-600`.

Die meisten Seiten unter `app/` sind aktuell Platzhalter und werden gemäß den
Phasen in `CLAUDE.md` (Abschnitt 11) implementiert.

## Deployment (VPS)

```bash
cd /root/sports && npm run build
pm2 start "npm start" --name sports --cwd /root/sports
```
