// Registriert ALLE Mongoose-Modelle als Seiteneffekt. Wird von lib/db.js
// importiert, damit beim Verbindungsaufbau garantiert jedes Modell registriert
// ist. Verhindert `MissingSchemaError` beim populate() im Production-Build, wo
// eine Route nur ihre explizit importierten Module bündelt (im Dev-Modus fällt
// das nicht auf, weil dort der gesamte Modulgraph geladen wird).
import "./Player";
import "./Team";
import "./Match";
import "./League";
import "./Post";
import "./Tryout";
import "./Admin";
import "./Feedback";
import "./AnalyticsEvent";
import "./TransferEvent";
import "./AuditLog";
import "./TeamSeason";
