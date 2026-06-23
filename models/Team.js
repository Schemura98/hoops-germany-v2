import mongoose from "mongoose";

const rosterSlotSchema = new mongoose.Schema(
  {
    name: String,
    position: String,
    number: String,
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "players" },
    claimToken: String,
    status: {
      type: String,
      enum: ["empty", "pending", "confirmed"],
      default: "empty",
    },
  },
  { _id: true }
);

const teamSchema = new mongoose.Schema(
  {
    teamName: { type: String, unique: true, required: true },
    // E-Mail/Passwort optional: Teams sind spieler-geführt (adminPlayerId).
    // Felder bleiben für Altbestände/optionale Team-Accounts erhalten.
    email: { type: String, unique: true, sparse: true },
    password: String,
    about: String,
    region: String,
    bundesland: String,
    logo: String,
    banner: String,
    slug: { type: String, unique: true },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "players" }],
    adminPlayerId: { type: mongoose.Schema.Types.ObjectId, ref: "players" },
    inviteToken: String,
    rosterSlots: [rosterSlotSchema],
  },
  { timestamps: true }
);

export default mongoose.models.teams || mongoose.model("teams", teamSchema);
