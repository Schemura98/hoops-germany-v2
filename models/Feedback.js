import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    type: String, // Lob | Kritik | Idee | Bug
    areas: [String], // betroffene Themen/Bereiche
    rating: Number, // Gesamteindruck 1–5
    likes: String, // was gefällt
    dislikes: String, // was gefällt nicht
    suggestions: String, // was anders / Wunsch
    message: String, // zusammengesetzte Lesefassung (Abwärtskompatibilität)
    createdAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["new", "read"], default: "new" },
  },
  { timestamps: true }
);

export default mongoose.models.feedbacks ||
  mongoose.model("feedbacks", feedbackSchema);
