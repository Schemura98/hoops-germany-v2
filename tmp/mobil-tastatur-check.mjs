// Schliesst die drei Luecken aus Tobias' Gate, an denen sein Klick-Werkzeug
// ausgefallen ist: Mobile-Navigation, Enter-Taste, Strg-/Mittelklick.
// Playwright gegen echtes Chromium hat diese Grenzen nicht.
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:3000";
const browser = await chromium.launch();
let ok = 0;
let schlecht = 0;
const melde = (gut, text) => {
  console.log(`${gut ? "ok  " : "FEHL"} ${text}`);
  gut ? ok++ : schlecht++;
};

// --- Mobile 390px: Karten, Menue, Suche, Fusszeile -------------------------
const ctx = await browser.newContext({ viewport: { width: 390, height: 850 } });
const page = await ctx.newPage();
const fehler = [];
page.on("console", (m) => m.type() === "error" && fehler.push(m.text().slice(0, 100)));

await page.goto(BASE + "/teams", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
let vorher = page.url();
await page.locator("a[data-vt]").first().click();
await page.waitForFunction((v) => location.href !== v, vorher, { timeout: 5000 }).catch(() => {});
melde(new URL(page.url()).pathname.startsWith("/team/team-detail/"), `mobil: Team-Karte → ${new URL(page.url()).pathname}`);

await page.goBack();
await page.waitForTimeout(700);
melde(new URL(page.url()).pathname === "/teams", "mobil: Zurück-Schaltfläche");

await page.goto(BASE + "/spieler", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
vorher = page.url();
await page.locator("a[data-vt]").first().click();
await page.waitForFunction((v) => location.href !== v, vorher, { timeout: 5000 }).catch(() => {});
melde(new URL(page.url()).pathname.startsWith("/player/view-player/"), `mobil: Spieler-Karte → ${new URL(page.url()).pathname}`);

// Hamburger-Menue auf/zu
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.getByLabel("Menü öffnen").click();
await page.waitForTimeout(400);
const offen = await page.getByRole("link", { name: "Transfermarkt", exact: false }).first().isVisible();
melde(offen, "mobil: Hamburger-Menü öffnet");
if (offen) {
  vorher = page.url();
  await page.getByRole("link", { name: "Transfermarkt", exact: false }).first().click();
  await page.waitForFunction((v) => location.href !== v, vorher, { timeout: 5000 }).catch(() => {});
  melde(new URL(page.url()).pathname === "/transfermarkt", "mobil: Menüpunkt navigiert und Menü schließt");
}

// Such-Overlay
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.getByLabel("Suche öffnen").click();
await page.waitForTimeout(500);
await page.getByPlaceholder("Spieler oder Team suchen…").fill("Max");
await page.waitForTimeout(900);
const treffer = await page.locator('a[href^="/player/view-player/"]').count();
melde(treffer > 0, `mobil: Suche findet Treffer (${treffer})`);

// Fusszeile
await page.goto(BASE + "/", { waitUntil: "networkidle" });
vorher = page.url();
await page.getByRole("link", { name: "Impressum", exact: false }).first().click();
await page.waitForFunction((v) => location.href !== v, vorher, { timeout: 5000 }).catch(() => {});
melde(new URL(page.url()).pathname === "/impressum", "mobil: Fußzeile → Impressum");

// --- Tastatur: Karte mit Enter oeffnen -------------------------------------
await page.goto(BASE + "/teams", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.locator("a[data-vt]").first().focus();
const fokusSichtbar = await page.evaluate(() => {
  const el = document.activeElement;
  const s = getComputedStyle(el);
  return { tag: el.tagName, vt: el.hasAttribute("data-vt"), outline: s.outlineStyle !== "none" || s.boxShadow !== "none" };
});
vorher = page.url();
await page.keyboard.press("Enter");
await page.waitForFunction((v) => location.href !== v, vorher, { timeout: 5000 }).catch(() => {});
melde(
  fokusSichtbar.vt && new URL(page.url()).pathname.startsWith("/team/team-detail/"),
  `Tastatur: Enter öffnet die Karte (Fokus auf ${fokusSichtbar.tag}, sichtbar: ${fokusSichtbar.outline})`
);

// --- Strg-Klick und Mittelklick -> neuer Tab -------------------------------
await page.goto(BASE + "/teams", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
let tabs = ctx.pages().length;
await page.locator("a[data-vt]").first().click({ modifiers: ["ControlOrMeta"] });
await page.waitForTimeout(1000);
melde(ctx.pages().length > tabs, `Strg-Klick öffnet neuen Tab (${tabs} → ${ctx.pages().length})`);

tabs = ctx.pages().length;
await page.locator("a[data-vt]").first().click({ button: "middle" });
await page.waitForTimeout(1000);
melde(ctx.pages().length > tabs, `Mittelklick öffnet neuen Tab (${tabs} → ${ctx.pages().length})`);

console.log(`\nbestanden: ${ok} · fehlgeschlagen: ${schlecht}`);
console.log("Konsolenfehler:", fehler.length ? fehler.join(" | ") : "keine");
await browser.close();
process.exit(schlecht ? 1 : 0);
