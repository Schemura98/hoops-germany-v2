import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    message: String,
    type: String,
    createdAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["new", "read"], default: "new" },
  },
  { timestamps: true }
);

export default mongoose.models.feedbacks ||
  mongoose.model("feedbacks", feedbackSchema);
