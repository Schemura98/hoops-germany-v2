import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: "players" },
    text: String,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "players" }],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const commentSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: "players" },
    text: String,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "players" }],
    replies: [replySchema],
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

    // Automatische Ereignis-Beiträge (Spielergebnis, Transfer, Tryout …).
    // kind="user" = normaler Beitrag (Default). Render-Daten sind in content/meta
    // denormalisiert (kein populate nötig); teams/subjectPlayer dienen nur dem
    // Feed-Filter ("Folge ich"). eventKey macht Auto-Posts idempotent.
    kind: { type: String, enum: ["user", "auto"], default: "user" },
    autoType: String, // match_result | transfer | team_founded | tryout
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "teams" }],
    subjectPlayer: { type: mongoose.Schema.Types.ObjectId, ref: "players" },
    eventKey: { type: String, index: true, sparse: true },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.models.posts || mongoose.model("posts", postSchema);
