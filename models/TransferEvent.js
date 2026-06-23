import mongoose from "mongoose";

// Ein Transfer-Ereignis im Lebenslauf eines Spielers: Beitritt, Wechsel,
// Verlassen oder Team-Gründung. Wird an allen Stellen geschrieben, an denen
// sich die Team-Zugehörigkeit (Player.teamId) ändert.
const transferEventSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: "players", required: true },
    fromTeam: { type: mongoose.Schema.Types.ObjectId, ref: "teams", default: null },
    toTeam: { type: mongoose.Schema.Types.ObjectId, ref: "teams", default: null },
    // join = neu im Team (vorher kein Team), move = Wechsel, leave = Team verlassen,
    // found = Team gegründet
    type: {
      type: String,
      enum: ["join", "move", "leave", "found"],
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

transferEventSchema.index({ player: 1, createdAt: -1 });
transferEventSchema.index({ toTeam: 1, createdAt: -1 });
transferEventSchema.index({ fromTeam: 1, createdAt: -1 });

export default mongoose.models.transferevents ||
  mongoose.model("transferevents", transferEventSchema);
