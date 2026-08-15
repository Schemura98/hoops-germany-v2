import mongoose from "mongoose";

const applicantSchema = new mongoose.Schema(
  {
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: "players" },
    appliedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const tryoutSchema = new mongoose.Schema(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "teams" },
    date: Date,
    location: String,
    // Kanonische Namen aus POSITIONS (lib/constants.js), KEINE Kürzel –
    // `tryouts/create` filtert mit `POSITIONS.includes(p)`, ein Kürzel würde
    // also stillschweigend verworfen. Hier stand bis zum 15.08.2026
    // ["PG","SG","SF","PF","C"] (Befund Kai F-5): genau die Sorte Doku, die
    // im Sinne des Codes einmal stimmte und im Sinne des Lesers falsch ist.
    positions: [String],
    description: String,
    status: { type: String, enum: ["active", "closed"], default: "active" },
    applicants: [applicantSchema],
  },
  { timestamps: true }
);

export default mongoose.models.tryouts ||
  mongoose.model("tryouts", tryoutSchema);
