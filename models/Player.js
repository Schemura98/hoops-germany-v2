import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "follow",
        "join_request",
        "join_approved",
        "member_joined",
        "team_invite",
        "pending_result",
        "match_result",
        // Eigene Werte aus einem Box-Score sind eingetragen (lib/statsNotify.js)
        "own_stats",
        "transfer",
        "result_mismatch",
        "team_admin_granted",
        "team_pending",
        "team_approved",
        "post_like",
        "post_comment",
        "comment_reply",
        "mention",
        "league_change_request",
        "league_change_approved",
        "league_change_rejected",
      ],
    },
    fromPlayerId: { type: mongoose.Schema.Types.ObjectId, ref: "players" },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "teams" },
    teamName: String,
    teamSlug: String,
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: "matches" },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "posts" },
    // Bündelung gleichartiger Ereignisse (z.B. mehrere Likes auf denselben Beitrag).
    count: { type: Number, default: 1 },
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
    country: String, // @deprecated 26.06.2026 – nicht mehr erfasst/angezeigt (DE-only); Feld bleibt für Altdaten
    hometown: String,
    bundesland: String,
    fibaLink: String,
    position: String,
    number: String, // optionale Rückennummer (z.B. "7", "00")
    nationality: String,
    aboutPlayer: String,

    resetPasswordToken: String,
    resetPasswordExpiry: Date,

    // Maschinenlesbare Demo-Kennzeichnung (additiv, analog Team.isDemo/League.isDemo).
    // true = fiktives Seed-Profil der Testphase – NIE als echter Spieler behandeln.
    isDemo: { type: Boolean, default: false },
    // Interner Testaccount (real angelegt, aber von uns selbst) – s. Team.isInternal.
    isInternal: { type: Boolean, default: false },

    transferStatus: {
      type: String,
      enum: ["verfuegbar", "nicht_verfuegbar"],
      default: "nicht_verfuegbar",
    },
    preferredLeague: String,
    transferNote: String,

    isTeamAdmin: { type: Boolean, default: false },
    teamAdminOf: { type: mongoose.Schema.Types.ObjectId, ref: "teams" },
    // Mail-Einstellung: „Ergebnis eintragen"-Erinnerung an Team-Admins (Standard an).
    emailPendingResult: { type: Boolean, default: true },
    isSuperAdmin: { type: Boolean, default: false },
    teamJoinRequest: { type: mongoose.Schema.Types.ObjectId, ref: "teams" },
    followingTeams: [{ type: mongoose.Schema.Types.ObjectId, ref: "teams" }],
    instagram: String,
    // Kampagnen-Quellen-Tracking (?src= bei /signup, z.B. Flyer-QR-Codes), serverseitig
    // gesäubert auf [a-z0-9-_], max. 40 Zeichen. Optional – nur gesetzt, wenn beim
    // Registrieren ein src-Parameter mitkam.
    signupSource: String,
    // Onboarding-Checklist im Newsfeed dauerhaft ausgeblendet (Server-Flag, geräteübergreifend).
    onboardingDismissed: { type: Boolean, default: false },
    // Willkommens-Tour nach der Registrierung gesehen (Auto-Start nur einmal).
    welcomeSeen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.players ||
  mongoose.model("players", playerSchema);
