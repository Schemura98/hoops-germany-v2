// Relative Zeitangabe auf Deutsch (z.B. "vor 3 Min", "vor 2 Std", "vor 4 Tagen").
export function timeAgo(date) {
  const then = new Date(date).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Math.floor((Date.now() - then) / 1000); // Sekunden

  if (diff < 60) return "gerade eben";
  if (diff < 3600) return `vor ${Math.floor(diff / 60)} Min`;
  if (diff < 86400) return `vor ${Math.floor(diff / 3600)} Std`;
  if (diff < 604800) {
    const d = Math.floor(diff / 86400);
    return `vor ${d} ${d === 1 ? "Tag" : "Tagen"}`;
  }
  return new Date(date).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
