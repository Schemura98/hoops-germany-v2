import mongoose from "mongoose";

const leagueSchema = new mongoose.Schema(
  {
    name: String,
    season: String,
    bundesland: String,
    // Offizieller Liga-Katalog (Spielklassen-Hierarchie):
    level: String, // Regionalliga | Oberliga | Landesliga | Bezirksliga | Kreisliga | Sonstige
    gender: { type: String, default: "Herren" }, // Herren | Damen | Mixed
    ageGroup: { type: String, default: "Senioren" }, // Senioren | U18 | U16 | …
    region: String, // Bezirk/Kreis (z. B. "Bezirk Niederrhein", "Kreis Köln")
    official: { type: Boolean, default: false }, // true = vom Verband, nicht selbst erstellt
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "teams" }],
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "matches" }],
    active: { type: Boolean, default: true },
    // Saison-Abschluss: finished = Saison vorbei (Tabelle final, Meister gekürt).
    // champion optional: explizit gesetzter Meister (z. B. Playoff-Sieger) überschreibt
    // den Tabellen-Ersten; sonst ist der Meister automatisch Platz 1 der Endtabelle.
    finished: { type: Boolean, default: false },
    champion: { type: mongoose.Schema.Types.ObjectId, ref: "teams" },
  },
  { timestamps: true }
);

export default mongoose.models.leagues ||
  mongoose.model("leagues", leagueSchema);
