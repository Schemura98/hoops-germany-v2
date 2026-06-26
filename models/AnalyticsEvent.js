import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema(
  {
    eventType: String,
    path: String,
    sessionId: String, // persistenter Besucher-Identifier (localStorage)
    // Gerät/Umgebung (serverseitig aus User-Agent abgeleitet, nicht personenbezogen)
    device: String, // "mobile" | "desktop" | "tablet"
    browser: String,
    os: String,
    // Optional: eingeloggter Nutzer (für „aktive Nutzer"); NICHT an Sponsoren ausgegeben
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: "players" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indizes für die zeitfensterbasierten Auswertungen.
analyticsEventSchema.index({ eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ createdAt: -1 });

export default mongoose.models.analyticsevents ||
  mongoose.model("analyticsevents", analyticsEventSchema);
