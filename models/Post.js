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
    // Vereins-Beitrag: Team als Autor (kind bleibt "user"). Render-Header zeigt dann
    // den Verein statt eines Spielers. teams[] wird ebenfalls gesetzt → bestehende
    // Feed-/Ranking-Logik (Folge-ich-$or, Boosts) greift ohne Zusatzcode.
    authorTeam: { type: mongoose.Schema.Types.ObjectId, ref: "teams" },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "teams" }],

    // Hashtags (klein, indizierbar) + aufgelöste @Mentions (Render + Benachrichtigung).
    hashtags: { type: [String], index: true },
    mentions: [
      {
        playerId: { type: mongoose.Schema.Types.ObjectId, ref: "players" },
        slug: String,
        token: String,
      },
    ],
    subjectPlayer: { type: mongoose.Schema.Types.ObjectId, ref: "players" },
    eventKey: { type: String, index: true, sparse: true },
    meta: { type: mongoose.Schema.Types.Mixed },
    // Erste erkannte URL als Embed (denormalisiert beim Erstellen → kein Fetch im Render):
    // { type:"youtube", videoId, url } | { type:"link", url, domain }
    embed: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.models.posts || mongoose.model("posts", postSchema);
