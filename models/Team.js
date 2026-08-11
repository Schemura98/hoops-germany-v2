import mongoose from "mongoose";

const rosterSlotSchema = new mongoose.Schema(
  {
    name: String,
    position: String,
    number: String,
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "players" },
    claimToken: String,
    status: {
      type: String,
      enum: ["empty", "pending", "confirmed"],
      default: "empty",
    },
  },
  { _id: true }
);

const teamSchema = new mongoose.Schema(
  {
    teamName: { type: String, unique: true, required: true },
    // E-Mail/Passwort optional: Teams sind spieler-geführt (adminPlayerId).
    // Felder bleiben für Altbestände/optionale Team-Accounts erhalten.
    email: { type: String, unique: true, sparse: true },
    password: String,
    about: String,
    region: String,
    bundesland: String,
    // Liga, an der das Team teilnimmt (offizieller Katalog).
    leagueId: { type: mongoose.Schema.Types.ObjectId, ref: "leagues" },
    logo: String,
    banner: String,
    slug: { type: String, unique: true },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "players" }],
    adminPlayerId: { type: mongoose.Schema.Types.ObjectId, ref: "players" },
    // Moderation: neue (spieler-gegründete) Teams müssen von Super-Admins
    // freigegeben werden, bevor sie öffentlich erscheinen. Default true, damit
    // Bestand/Seeds sichtbar bleiben; /api/team/create setzt explizit false.
    approved: { type: Boolean, default: true },
    // Maschinenlesbare Demo-Kennzeichnung (additiv, analog League.isDemo). true = fiktives
    // Test-Team einer Demo-Fixture (z. B. Kreisliga-Showcase) – NIE als echter Verein behandeln.
    isDemo: { type: Boolean, default: false },
    // Interner Testaccount: ECHT angelegt (kein Seed), aber von uns selbst zum
    // Testen – z. B. „Test Baskets". Unterschied zu isDemo: Demo-Daten sind
    // erfundene Fixtures, interne Konten sind reale Konten ohne echten Verein
    // dahinter. Beides muss aus Beteiligungszahlen heraus, sonst zaehlen wir uns
    // selbst mit (Voraussetzung fuer Neles Schwelle, docs/LANDING-COPY-2026-08-11.md §7).
    isInternal: { type: Boolean, default: false },
    inviteToken: String,
    rosterSlots: [rosterSlotSchema],
    // Scouting / Transfermarkt (Team-Seite): Verein sucht Verstärkung.
    recruiting: { type: Boolean, default: false },
    recruitingPositions: [String], // gesuchte Positionen/Rollen (ALL_ROLES)
    recruitingNote: String,
    // Bei Beitritten/Anfragen: alle Team-Admins benachrichtigen (statt nur Haupt-Admin).
    notifyAllAdmins: { type: Boolean, default: false },
    // Direkt eingeladene bestehende Accounts (warten auf Annahme/Ablehnung).
    invitedPlayers: [{ type: mongoose.Schema.Types.ObjectId, ref: "players" }],
    // Teilrechte je Co-Admin (Capability-Keys aus lib/teamPermissions). KEIN Eintrag
    // = Vollzugriff (Rückwärtskompatibilität für Bestands-Co-Admins). Haupt-Admin
    // (adminPlayerId) hat IMMER alle Rechte und steht hier nicht.
    adminPermissions: [
      {
        player: { type: mongoose.Schema.Types.ObjectId, ref: "players" },
        perms: [String],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.teams || mongoose.model("teams", teamSchema);
