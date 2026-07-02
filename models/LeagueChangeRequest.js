import mongoose from "mongoose";

// Anfrage eines Team-Admins auf eine NEUE offizielle Liga-Zuordnung. Team-Admins dürfen
// `Team.leagueId`/`League.teams` bei official:true-Ligen nicht mehr direkt ändern (betrifft
// Tabelle/Spielplan/Statistiken/Saisonhistorie) – stattdessen Anfrage → Super-Admin-Freigabe.
// Historische TeamSeason-Daten werden von diesem Flow NIE angefasst.
const leagueChangeRequestSchema = new mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: "teams", required: true, index: true },
    // Snapshot der aktuellen Liga zum Anfragezeitpunkt (kann null sein, falls noch keine Liga).
    currentLeagueId: { type: mongoose.Schema.Types.ObjectId, ref: "leagues", default: null },
    requestedLeagueId: { type: mongoose.Schema.Types.ObjectId, ref: "leagues", required: true },
    season: String,
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "players", required: true },
    note: String,
    status: {
      type: String,
      enum: ["ausstehend", "genehmigt", "abgelehnt", "storniert"],
      default: "ausstehend",
      index: true,
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "players", default: null },
    reviewNote: String,
    reviewedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.leaguechangerequests ||
  mongoose.model("leaguechangerequests", leagueChangeRequestSchema);
