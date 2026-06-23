import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true },
    password: String,
    email: String,
  },
  { timestamps: true }
);

export default mongoose.models.admins || mongoose.model("admins", adminSchema);
