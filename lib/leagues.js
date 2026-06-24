import League from "@/models/League";

// Maskiert RegExp-Sonderzeichen, damit der Name als Literal verglichen wird.
function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Sucht eine bestehende Liga mit gleichem Namen (case-insensitive) + Saison.
// connectDB() muss vorher aufgerufen sein. `excludeId` schließt die eigene Liga aus
// (z. B. beim Umbenennen). Gibt die gefundene Liga zurück oder null.
export async function findDuplicateLeague(name, season, excludeId = null) {
  const query = {
    name: { $regex: `^${escapeRegex(String(name).trim())}$`, $options: "i" },
    season: String(season || "").trim(),
  };
  if (excludeId) query._id = { $ne: excludeId };
  return League.findOne(query);
}
