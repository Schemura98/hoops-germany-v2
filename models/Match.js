import mongoose from "mongoose";

const playerStatSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: "players" }, // null wenn kein Account
    playerName: String,
    rosterSlotId: mongoose.Schema.Types.ObjectId, // für Slot-Spieler ohne Account
    team: { type: mongoose.Schema.Types.ObjectId, ref: "teams" },
    points: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    rebounds: { type: Number, default: 0 },
    didNotPlay: { type: Boolean, default: false },
  },
  { _id: true }
);

const teamResultSchema = new mongoose.Schema(
  {
    ownPoints: Number,
    opponentPoints: Number,
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "players" },
    submittedAt: Date,
  },
  { _id: false }
);

const matchSchema = new mongoose.Schema(
  {
    teamA: { type: mongoose.Schema.Types.ObjectId, ref: "teams" },
    teamB: { type: mongoose.Schema.Types.ObjectId, ref: "teams" },
    date: Date,
    location: String,
    leagueId: { type: mongoose.Schema.Types.ObjectId, ref: "leagues" },
    // Spielabschnitt: "Hauptrunde" (zählt für die Tabelle) | "Playoffs".
    stage: { type: String, default: "Hauptrunde" },
    playoffRound: String, // nur bei stage="Playoffs" (z. B. "Halbfinale", "Finale")
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    winningTeam: { type: mongoose.Schema.Types.ObjectId, ref: "teams" },
    playerStats: [playerStatSchema],
    winningTeamPoints: Number,
    losingTeamPoints: Number,
    notifiedPendingResult: { type: Boolean, default: false },
    // Wer wurde bereits über seine eigenen Werte im Box-Score informiert
    // (Benachrichtigung "own_stats", lib/statsNotify.js)? Verhindert, dass eine
    // Korrektur der Statistiken eine zweite Nachricht auslöst. Bewusst je Spieler
    // statt als Boolean: wer erst bei der Korrektur dazukommt, bekommt seine erste.
    notifiedStatsPlayers: [{ type: mongoose.Schema.Types.ObjectId, ref: "players" }],
    // Optionale Zusatzinfos (z. B. aus Demo-Daten): MVP, Zuschauerzahl, Spielbericht.
    mvp: { type: mongoose.Schema.Types.ObjectId, ref: "players" },
    attendance: Number,
    report: String,
    teamAResult: teamResultSchema,
    teamBResult: teamResultSchema,
    resultStatus: {
      type: String,
      enum: ["pending", "confirmed", "mismatch"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.matches ||
  mongoose.model("matches", matchSchema);
