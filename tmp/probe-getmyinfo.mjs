// Was liefert getmyinfo wirklich? Nachsehen statt annehmen.
import { chromium } from "playwright";
const BASE = "http://localhost:3000";
const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
await p.goto(BASE + "/login", { waitUntil: "networkidle" });
const r = await p.evaluate(async () => {
  const a = await fetch("/api/player/playerlogin", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "max@test.de", password: "test123" }),
  });
  const d = await a.json();
  const token = d.token || d.data?.token;
  const m = await fetch("/api/player/getmyinfo", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  const j = await m.json();
  const pl = j.player || j.data?.player;
  return { schluessel: Object.keys(j), teamId: pl?.teamId, team: pl?.team?._id };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
