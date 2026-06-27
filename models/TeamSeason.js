import mongoose from "mongoose";

// Saison-Teilnahme eines Teams an EINER Liga-Saison. Trennt die langlebige Liga
// (per-Saison-Dokument) von der konkreten Team-Teilnahme: ein Team kann pro Saison
// in einer anderen Liga stehen. Wird beim Saisonabschluss „eingefroren" (Endstand
// als Snapshot), damit alte Saisons NIE durch eine neue überschrieben werden.
const teamSeasonSchema = new mongoose.Schema(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "teams", index: true },
    leagueId: { type: mongoose.Schema.Types.ObjectId, ref: "leagues" },
    season: String,
    // aktiv | zurueckgezogen | ausser_konkurrenz | disqualifiziert
    status: { type: String, default: "aktiv" },
    placement: Number,
    games: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    pointsFor: { type: Number, default: 0 },
    pointsAgainst: { type: Number, default: 0 },
    diff: { type: Number, default: 0 },
    champion: { type: Boolean, default: false },
    // Eingefroren = Endstand der abgeschlossenen Saison (Snapshot, unveränderlich
    // gegenüber späteren Saisons).
    finalized: { type: Boolean, default: false },
    finalizedAt: Date,
  },
  { timestamps: true }
);
// Eine Teilnahme je Team+Liga+Saison.
teamSeasonSchema.index({ teamId: 1, leagueId: 1, season: 1 }, { unique: true });

export default mongoose.models.teamseasons ||
  mongoose.model("teamseasons", teamSeasonSchema);
