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
    positions: [String], // ["PG","SG","SF","PF","C"]
    description: String,
    status: { type: String, enum: ["active", "closed"], default: "active" },
    applicants: [applicantSchema],
  },
  { timestamps: true }
);

export default mongoose.models.tryouts ||
  mongoose.model("tryouts", tryoutSchema);
