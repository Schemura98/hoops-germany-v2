import Player from "@/models/Player";

// Normalisiert einen Namen/Token auf einen Vergleichs-Handle (klein, nur Buchstaben/Ziffern).
function norm(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9äöüß]/g, "");
}

// Hashtags aus dem Text ziehen (klein, eindeutig, gedeckelt).
export function extractHashtags(content) {
  const out = new Set();
  for (const m of String(content || "").matchAll(/#([A-Za-z0-9_äöüÄÖÜß]+)/g)) {
    out.add(m[1].toLowerCase());
  }
  return [...out].slice(0, 20);
}

// @-Tokens gegen Spieler auflösen. Handle = firstName+lastName (z.B. @MaxMustermann)
// oder eindeutiger Vorname (@Max) oder normalisierter Slug. Mehrdeutige Vornamen
// werden übersprungen. Rückgabe: [{ playerId, slug, token }] (token = wie getippt).
export async function resolveMentions(content) {
  const tokens = [
    ...String(content || "").matchAll(/@([A-Za-z0-9_äöüÄÖÜß]+)/g),
  ].map((m) => m[1]);
  if (!tokens.length) return [];

  const players = await Player.find({ slug: { $exists: true, $ne: null } })
    .select("firstName lastName slug")
    .limit(5000);

  const byHandle = new Map();
  const byFirst = new Map();
  const firstCollisions = new Set();
  for (const p of players) {
    const full = norm(`${p.firstName || ""}${p.lastName || ""}`);
    if (full && !byHandle.has(full)) byHandle.set(full, p);
    if (p.slug) byHandle.set(norm(p.slug), p);
    const first = norm(p.firstName);
    if (first) {
      if (byFirst.has(first)) firstCollisions.add(first);
      else byFirst.set(first, p);
    }
  }

  const seen = new Set();
  const out = [];
  for (const tok of tokens) {
    const n = norm(tok);
    let p = byHandle.get(n);
    if (!p && byFirst.has(n) && !firstCollisions.has(n)) p = byFirst.get(n);
    if (p && p.slug && !seen.has(String(p._id))) {
      seen.add(String(p._id));
      out.push({ playerId: p._id, slug: p.slug, token: tok });
    }
  }
  return out;
}
