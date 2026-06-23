import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema(
  {
    eventType: String,
    path: String,
    sessionId: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.analyticsevents ||
  mongoose.model("analyticsevents", analyticsEventSchema);
