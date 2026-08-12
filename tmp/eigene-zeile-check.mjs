// Genau Tobias' Pfad: anmelden und DANN als allererste Seite die Liga-Tabelle
// aufrufen - ohne Zwischenstopp, der den localStorage nebenbei anreichert.
// Zusaetzlich die Gegenprobe: ausgeloggt darf keine Zeile hervorgehoben sein.
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:3000";
const browser = await chromium.launch();

async function hervorgehoben(page, ligaPfad) {
  await page.goto(BASE + ligaPfad, { waitUntil: "networkidle" });
  await page.waitForTimeout(900); // Nachfrage abwarten
  return page.evaluate(() => {
    const zeilen = Array.from(document.querySelectorAll("tbody tr"));
    const treffer = zeilen
      .filter((tr) => getComputedStyle(tr).boxShadow.includes("240, 122, 39"))
      .map((tr) => tr.textContent.trim().slice(0, 24));
    return {
      zeilen: zeilen.map((tr) => tr.textContent.trim().slice(0, 20)),
      treffer,
      gespeichert: !!localStorage.getItem("player"),
    };
  });
}

// Liga-Pfad einmal ermitteln
const vorab = await browser.newContext();
const p0 = await vorab.newPage();
await p0.goto(BASE + "/ligen", { waitUntil: "networkidle" });
// Nicht irgendeine Liga nehmen, sondern die, in der Test Baskets ueberhaupt
// spielt - der erste Anlauf mass die Oberliga 1 und konnte deshalb gar nichts
// finden.
const ligaPfad = await p0.evaluate(async () => {
  const r = await fetch("/api/leagues");
  const d = await r.json();
  const ligen = d.leagues || d.data?.leagues || [];
  for (const l of ligen) {
    const einzeln = await (await fetch(`/api/leagues/${l._id}`)).json();
    const st = einzeln.standings || einzeln.data?.standings || [];
    if (st.some((s) => s.teamName === "Test Baskets")) return `/ligen/${l._id}`;
  }
  return null;
});
await vorab.close();

// A) Ausgeloggt
const ctxA = await browser.newContext({ viewport: { width: 390, height: 850 } });
const pA = await ctxA.newPage();
console.log("ausgeloggt:", JSON.stringify(await hervorgehoben(pA, ligaPfad)));
await ctxA.close();

// B) Angemeldet, Liga-Tabelle als ERSTE Seite danach
const ctxB = await browser.newContext({ viewport: { width: 390, height: 850 } });
const pB = await ctxB.newPage();
await pB.goto(BASE + "/login", { waitUntil: "networkidle" });
// Anmeldung ueber den echten Endpunkt, danach nur den Token setzen - so wird
// kein Zwischenstopp auf /player/newsfeed durchlaufen.
const ok = await pB.evaluate(async () => {
  const r = await fetch("/api/player/playerlogin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "max@test.de", password: "test123" }),
  });
  const d = await r.json();
  const token = d.token || d.data?.token;
  if (!token) return false;
  localStorage.setItem("playerAuthToken", token);
  localStorage.removeItem("player"); // Zwischenspeicher bewusst kalt lassen
  return true;
});
console.log("angemeldet:", ok);
console.log("eingeloggt, Liga zuerst:", JSON.stringify(await hervorgehoben(pB, ligaPfad)));
await ctxB.close();

await browser.close();
