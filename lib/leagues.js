import League from "@/models/League";
import { LEAGUE_AGE_GROUPS } from "@/lib/constants";

// Maskiert RegExp-Sonderzeichen, damit der Name als Literal verglichen wird.
function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Zentrale Altersklassen-Normalisierung/-Validierung (Produktregel: nur Senioren/U18 – Plattform ab 16 Jahren).
// Trimmt + matcht case-insensitiv auf den kanonischen Wert (z. B. "u18"/" U18 " → "U18").
// Rückgabe: kanonischer Wert (String) ODER null, wenn ungültig/leer/nicht unterstützt.
// Von ALLEN schreibenden Stellen (createleague/updateleague, Seeds/Importe) nutzen.
export function normalizeAgeGroup(raw) {
  if (raw === undefined || raw === null) return null;
  const t = String(raw).trim();
  if (!t) return null;
  return LEAGUE_AGE_GROUPS.find((a) => a.toLowerCase() === t.toLowerCase()) || null;
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
