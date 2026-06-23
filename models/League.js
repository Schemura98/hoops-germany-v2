import mongoose from "mongoose";

const leagueSchema = new mongoose.Schema(
  {
    name: String,
    season: String,
    bundesland: String,
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "teams" }],
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "matches" }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.leagues ||
  mongoose.model("leagues", leagueSchema);
