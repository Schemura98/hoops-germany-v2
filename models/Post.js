import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: "players" },
    text: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const postSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: "players" },
    content: String,
    image: String,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "players" }],
    comments: [commentSchema],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.posts || mongoose.model("posts", postSchema);
