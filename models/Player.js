import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "follow",
        "join_request",
        "join_approved",
        "pending_result",
        "match_result",
      ],
    },
    fromPlayerId: { type: mongoose.Schema.Types.ObjectId, ref: "players" },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "teams" },
    teamName: String,
    teamSlug: String,
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: "matches" },
    message: String,
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const playerSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, unique: true, required: true },
    slug: { type: String, unique: true, sparse: true },
    password: { type: String, default: null },
    googleId: { type: String, default: null },
    status: { type: String, enum: ["pending", "active"], default: "pending" },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "teams" },
    profileImage: String,

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "players" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "players" }],
    notifications: [notificationSchema],

    height: String,
    age: Number,
    weight: String,
    birthdate: String,
    country: String,
    hometown: String,
    bundesland: String,
    fibaLink: String,
    position: String,
    nationality: String,
    aboutPlayer: String,

    resetPasswordToken: String,
    resetPasswordExpiry: Date,

    transferStatus: {
      type: String,
      enum: ["verfuegbar", "nicht_verfuegbar"],
      default: "nicht_verfuegbar",
    },
    preferredLeague: String,
    transferNote: String,

    isTeamAdmin: { type: Boolean, default: false },
    teamAdminOf: { type: mongoose.Schema.Types.ObjectId, ref: "teams" },
    isSuperAdmin: { type: Boolean, default: false },
    teamJoinRequest: { type: mongoose.Schema.Types.ObjectId, ref: "teams" },
    followingTeams: [{ type: mongoose.Schema.Types.ObjectId, ref: "teams" }],
    instagram: String,
  },
  { timestamps: true }
);

export default mongoose.models.players ||
  mongoose.model("players", playerSchema);
