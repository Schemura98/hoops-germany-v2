import mongoose from "mongoose";

// Teilbarer, passwortgeschützter Sponsor-Report-Link.
// token = unrätselbarer URL-Teil; password = bcrypt-Hash (vom Admin gesetzt).
const reportShareSchema = new mongoose.Schema(
  {
    token: { type: String, unique: true, required: true },
    password: { type: String, required: true }, // bcrypt-Hash
    label: String, // z.B. Sponsor-Name / Anlass
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.reportshares ||
  mongoose.model("reportshares", reportShareSchema);
