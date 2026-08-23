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
        // Ein Super-Admin hat die Vereinszuordnung geändert (/admin/players).
        // Eigener Typ neben `transfer`, weil dort der Spieler selbst gehandelt
        // hat und seine Follower informiert werden – hier hat jemand anderes
        // eine Zuordnung korrigiert, und die Nachricht geht ausschließlich an
        // den Betroffenen. Seit dem 14.08.2026 erzeugt dieser Pfad bewusst
        // keinen öffentlichen Post mehr (`recordTransfer({ still: true })`);
        // ohne diesen Typ wäre der Spieler die einzige Person geblieben, die
        // von der Änderung an seinem eigenen Profil nichts erfährt (Befund Kai).
        "team_assigned",
        "result_mismatch",
        "team_admin_granted",
        // Gegenstück zu `team_admin_granted`: Die Verwaltungsrechte über einen
        // Verein wurden entzogen, weil ein Super-Admin jemand anderen zum
        // Haupt-Admin gemacht hat. Bis zum 14.08.2026 gab es diesen Typ nicht –
        // und den Entzug auch nicht, das war Tobias' Rechte-Befund. Seit er
        // greift, hätte der Betroffene ihn erst gemerkt, wenn /team/admin ihn
        // abweist (Befund Kai). ⚠️ Er bleibt MITGLIED des Vereins; nur die
        // Verwaltungsrechte sind weg.
        "team_admin_revoked",
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

    // Selbstauskunft „mindestens 16 Jahre alt", bestätigt bei der Registrierung
    // (13.08.2026, Entscheidung Patrick: die Plattform ist erst ab 16 gedacht).
    //
    // Bewusst KEIN Geburtsdatum als Pflichtfeld: `birthdate` und `age` sind über
    // die öffentliche Profil-API einsehbar. Ein Pflicht-Geburtsdatum würde also
    // ausgerechnet die Datenmenge vergrößern, die anderswo als Risiko benannt
    // ist (docs/RECHT-LEISTUNGSKARTE-2026-08-13.md). Die Selbstauskunft ist das
    // mildere Mittel und erfüllt Noras Bedingung, dass die Regel an mindestens
    // einer Stelle im Produkt wirkt.
    //
    // Datum statt Boolean, weil nur ein Zeitpunkt belegt, WANN bestätigt wurde.
    // Bestandskonten von vor dem 13.08.2026 haben das Feld nicht — das ist
    // korrekt und darf nicht nachträglich gesetzt werden.
    minAgeConfirmedAt: Date,
    // Onboarding-Checklist im Newsfeed dauerhaft ausgeblendet (Server-Flag, geräteübergreifend).
    onboardingDismissed: { type: Boolean, default: false },
    // Willkommens-Tour nach der Registrierung gesehen (Auto-Start nur einmal).
    welcomeSeen: { type: Boolean, default: false },
    // Team-Admin-Tour auf /team/admin gesehen (Auto-Start nur einmal).
    // Am SPIELER, nicht am Team: Die Tour gehört der Person – Co-Admins
    // (gleiches Feld `teamAdminOf` wie der Haupt-Admin) sollen sie ebenso
    // sehen; ein Team-Feld würde sie nur dem ersten zeigen
    // (docs/TEAMADMIN-TOUR-KONZEPT-2026-08-23.md, Abschnitt 3).
    adminTourSeen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.players ||
  mongoose.model("players", playerSchema);
