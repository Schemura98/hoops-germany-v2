import mongoose from "mongoose";

// Änderungs-/Audit-Protokoll für sensible Aktionen (v1: Spiel-Ergebnisse & -Statistiken).
// Wird append-only geschrieben; dient als Nachweis, WER WANN WAS an einem bestätigten
// Spiel geändert hat (Team-Admin oder Super-Admin).
const auditSchema = new mongoose.Schema(
  {
    entityType: { type: String, default: "match" }, // aktuell nur "match"
    entityId: { type: mongoose.Schema.Types.ObjectId, index: true },
    action: String, // result_submitted | result_confirmed | result_mismatch | stats_edited | admin_result_set | admin_result_reset | admin_cancelled
    actorPlayerId: { type: mongoose.Schema.Types.ObjectId, ref: "players" },
    actorName: String,
    actorRole: String, // team_admin | super_admin
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "teams" },
    summary: String,
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);
auditSchema.index({ entityId: 1, createdAt: -1 });

export default mongoose.models.auditlogs ||
  mongoose.model("auditlogs", auditSchema);
