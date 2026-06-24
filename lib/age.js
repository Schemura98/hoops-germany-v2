// Alter wird aus dem Geburtsdatum abgeleitet (nicht mehr manuell gepflegt),
// damit es sich automatisch am Geburtstag aktualisiert. Akzeptiert ISO
// (YYYY-MM-DD, aus <input type="date">) und das alte Freitext-Format (TT.MM.JJJJ).

export function parseBirthdate(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const s = String(value).trim();

  // ISO: YYYY-MM-DD (optional mit Zeitanteil)
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return isNaN(d.getTime()) ? null : d;
  }

  // Deutsch: TT.MM.JJJJ
  m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (m) {
    const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

// Aktuelles Alter in Jahren – oder null, wenn nicht sinnvoll ableitbar.
export function ageFromBirthdate(value) {
  const d = parseBirthdate(value);
  if (!d) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const monthDiff = now.getMonth() - d.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d.getDate())) age--;
  if (age < 0 || age > 120) return null;
  return age;
}

// Geburtsdatum für die Anzeige (TT.MM.JJJJ).
export function formatBirthdate(value) {
  const d = parseBirthdate(value);
  if (!d) return value || "";
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Geburtsdatum für ein <input type="date"> (YYYY-MM-DD).
export function toDateInputValue(value) {
  const d = parseBirthdate(value);
  if (!d) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
