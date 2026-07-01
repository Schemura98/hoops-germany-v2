// Showcase-Testposts für die Testphase: demonstrieren die Post-Funktionen
// (@Erwähnungen, #Hashtags, YouTube-Einbettung, externe Link-Vorschau).
// ADDITIV + getaggt (meta.showcase:true), idempotent (meta.showcaseKey), purgebar.
//   node scripts/seed-showcase-posts.mjs           → anlegen/aktualisieren
//   node scripts/seed-showcase-posts.mjs --purge   → nur die getaggten Showcase-Posts löschen
//   node scripts/seed-showcase-posts.mjs --dry      → Vorschau ohne Schreiben
import { readFileSync } from "fs";
import mongoose from "mongoose";

function readEnv(key) {
  const txt = readFileSync(new URL("../.env", import.meta.url), "utf8");
  for (const line of txt.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (t.slice(0, i).trim() === key) return t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return "";
}

const PURGE = process.argv.includes("--purge");
const DRY = process.argv.includes("--dry");
// Bevorzugte Autor-Accounts (erster gefundener wird genutzt) – klar als Demo erkennbar.
const AUTHOR_EMAILS = ["demo.coach@nrw-demo.de", "world.coach@demo.de", "max@test.de"];
// Kandidaten für ein einbettbares Basketball-YouTube-Video (werden per oEmbed validiert;
// erster einbettbarer gewinnt). Offizielle/echte Basketball-Clips – KEIN Rickroll-Fallback:
// lieber den YouTube-Post weglassen als etwas Unpassendes posten.
const YT_CANDIDATES = ["umBzUhvS5gE", "bn3MBClrZPk", "DJL_yXpzBWM"];

const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9äöüß]/g, "");

async function resolveMentions(content, Players) {
  const tokens = [...String(content).matchAll(/@([A-Za-z0-9_äöüÄÖÜß]+)/g)].map((m) => m[1]);
  if (!tokens.length) return [];
  const players = await Players.find({ slug: { $exists: true, $ne: null } })
    .project({ firstName: 1, lastName: 1, slug: 1 })
    .limit(5000)
    .toArray();
  const byHandle = new Map(), byFirst = new Map(), coll = new Set();
  for (const p of players) {
    const full = norm((p.firstName || "") + (p.lastName || ""));
    if (full && !byHandle.has(full)) byHandle.set(full, p);
    if (p.slug) byHandle.set(norm(p.slug), p);
    const f = norm(p.firstName);
    if (f) { if (byFirst.has(f)) coll.add(f); else byFirst.set(f, p); }
  }
  const seen = new Set(), out = [];
  for (const tok of tokens) {
    const n = norm(tok);
    let p = byHandle.get(n);
    if (!p && byFirst.has(n) && !coll.has(n)) p = byFirst.get(n);
    if (p && p.slug && !seen.has(String(p._id))) {
      seen.add(String(p._id));
      out.push({ playerId: p._id, slug: p.slug, token: tok });
    }
  }
  return out;
}

function extractHashtags(content) {
  const out = new Set();
  for (const m of String(content).matchAll(/#([A-Za-z0-9_äöüÄÖÜß]+)/g)) out.add(m[1].toLowerCase());
  return [...out].slice(0, 20);
}

function youtubeId(url) {
  let m;
  if ((m = url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/))) return m[1];
  if ((m = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/))) return m[1];
  if ((m = url.match(/youtube\.com\/(?:embed|shorts)\/([A-Za-z0-9_-]{6,})/))) return m[1];
  return null;
}

function metaContent(html, key) {
  const tag = html.match(new RegExp(`<meta[^>]+(?:property|name)\\s*=\\s*["']${key}["'][^>]*>`, "i"));
  if (!tag) return "";
  const c = tag[0].match(/content\s*=\s*["']([^"']*)["']/i);
  return c ? c[1] : "";
}

async function detectAndEnrich(content) {
  const match = String(content).match(/(https?:\/\/[^\s<]+)/i);
  if (!match) return null;
  const url = match[1].replace(/[).,!?;:]+$/, "");
  if (/(?:youtube\.com|youtu\.be)/i.test(url)) {
    const id = youtubeId(url);
    if (id) return { type: "youtube", videoId: id, url };
  }
  let domain = "";
  try { domain = new URL(url).hostname.replace(/^www\./, ""); } catch { return null; }
  const embed = { type: "link", url, domain };
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (HoopsGermanyBot)" } });
    if (res.ok && (res.headers.get("content-type") || "").includes("text/html")) {
      const html = (await res.text()).slice(0, 262144);
      const title = metaContent(html, "og:title") || (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || "";
      const description = metaContent(html, "og:description") || "";
      let image = metaContent(html, "og:image") || "";
      if (image) { try { image = new URL(image, res.url || url).href; } catch { image = ""; } }
      if (title) embed.title = title.slice(0, 200);
      if (description) embed.description = description.slice(0, 300);
      if (image) embed.image = image;
    }
  } catch { /* Domain-Karte als Fallback */ }
  return embed;
}

// oEmbed-Check: existiert das Video und ist es einbettbar?
async function validYouTube(id) {
  try {
    const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
    if (!r.ok) return null;
    const j = await r.json();
    return j?.title || "Video";
  } catch { return null; }
}

const uri = readEnv("MONGODB_URI");
if (!uri) { console.error("❌ MONGODB_URI fehlt"); process.exit(1); }
await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
const db = mongoose.connection;
console.log("⏳ Verbunden mit", db.name, PURGE ? "(PURGE)" : DRY ? "(DRY)" : "");
const Posts = db.collection("posts");
const Players = db.collection("players");

if (PURGE) {
  const r = DRY
    ? { deletedCount: await Posts.countDocuments({ "meta.showcase": true }) }
    : await Posts.deleteMany({ "meta.showcase": true });
  console.log(`🧹 ${DRY ? "(dry) " : ""}${r.deletedCount} Showcase-Post(s) entfernt.`);
  await mongoose.disconnect();
  process.exit(0);
}

// Autor finden
let author = null;
for (const email of AUTHOR_EMAILS) {
  author = await Players.findOne({ email }, { projection: { firstName: 1, lastName: 1 } });
  if (author) break;
}
if (!author) {
  console.error("❌ Kein Demo-Autor gefunden (" + AUTHOR_EMAILS.join(", ") + "). Abbruch – KEINE Posts als echter Nutzer.");
  await mongoose.disconnect();
  process.exit(1);
}
console.log("✍️  Autor:", author.firstName, author.lastName, `(${author._id})`);

// Zwei echte Spieler (nicht der Autor) für die Erwähnungen
const targets = await Players.find({ _id: { $ne: author._id }, firstName: { $exists: true }, lastName: { $exists: true }, slug: { $exists: true, $ne: null } })
  .project({ firstName: 1, lastName: 1 })
  .limit(2)
  .toArray();
const handle = (p) => "@" + `${p.firstName}${p.lastName}`.replace(/[^\p{L}\p{N}]/gu, "");
const mentionA = targets[0] ? handle(targets[0]) : "@Team";
const mentionB = targets[1] ? handle(targets[1]) : "";

// YouTube-Video validieren
let ytUrl = null, ytTitle = "";
for (const id of YT_CANDIDATES) {
  const title = await validYouTube(id);
  if (title) { ytUrl = `https://www.youtube.com/watch?v=${id}`; ytTitle = title; break; }
}

const posts = [
  {
    key: "mentions",
    content: `Was für ein Spiel! 🏀🔥 Riesen Props an ${mentionA}${mentionB ? ` und ${mentionB}` : ""} – ihr habt das Ding gedreht. #Gameday #TeamHoops`,
  },
  ...(ytUrl
    ? [{ key: "youtube", content: `Beispiel: So sieht ein eingebettetes Video im Feed aus 🎥 Einfach einen YouTube-Link in den Beitrag setzen. #Skills\n${ytUrl}` }]
    : []),
  {
    key: "link",
    content: `Beispiel: Teile einen Link und wir bauen automatisch eine Vorschau. Basketball-Grundlagen zum Nachlesen 👇 #Basketball #News\nhttps://de.wikipedia.org/wiki/Basketball`,
  },
];

let created = 0, updated = 0;
const now = Date.now();
for (let i = 0; i < posts.length; i++) {
  const { key, content } = posts[i];
  const mentions = await resolveMentions(content, Players);
  const hashtags = extractHashtags(content);
  const embed = await detectAndEnrich(content);
  const doc = {
    player: author._id,
    content,
    image: "",
    likes: [],
    comments: [],
    kind: "user",
    hashtags,
    mentions,
    embed,
    meta: { showcase: true, showcaseKey: key },
    createdAt: new Date(now - i * 60000),
    updatedAt: new Date(now - i * 60000),
  };
  const existing = await Posts.findOne({ "meta.showcaseKey": key, "meta.showcase": true });
  console.log(`  • ${key}: mentions=${mentions.length} hashtags=${hashtags.length} embed=${embed?.type || "–"}${embed?.title ? ` ("${embed.title.slice(0, 40)}")` : ""}`);
  if (DRY) continue;
  if (existing) { await Posts.updateOne({ _id: existing._id }, { $set: { ...doc, createdAt: existing.createdAt } }); updated++; }
  else { await Posts.insertOne(doc); created++; }
}

console.log(`✅ ${DRY ? "(dry) " : ""}Fertig: ${created} neu, ${updated} aktualisiert${ytUrl ? `; YouTube: "${ytTitle}"` : "; YouTube übersprungen (kein einbettbares Video validiert)"}.`);
await mongoose.disconnect();
