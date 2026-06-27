import AuditLog from "@/models/AuditLog";

// Schreibt einen Audit-Eintrag. Fehlertolerant: ein Problem beim Protokollieren
// darf den eigentlichen Vorgang (Ergebnis melden, Stats speichern, …) nie kippen.
export async function recordAudit(entry) {
  try {
    if (!entry?.entityId) return;
    await AuditLog.create(entry);
  } catch (err) {
    console.error("[AUDIT]", err);
  }
}
