// Leichtgewichtiger User-Agent-Parser (ohne Dependency) für Analytics:
// liefert Gerätetyp, Browser und Betriebssystem grob. Bewusst einfach gehalten –
// für aggregierte Sponsoren-Statistiken ausreichend (keine personenbezogene Auswertung).

export function parseUserAgent(ua = "") {
  const s = String(ua || "");
  const lower = s.toLowerCase();

  // Gerätetyp
  let device = "desktop";
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(s)) device = "tablet";
  else if (/mobi|iphone|ipod|android.*mobile|windows phone|blackberry|bb10/i.test(lower))
    device = "mobile";

  // Browser (Reihenfolge wichtig: spezifische vor generischen)
  let browser = "Andere";
  if (/edg\//i.test(s)) browser = "Edge";
  else if (/opr\/|opera/i.test(s)) browser = "Opera";
  else if (/samsungbrowser/i.test(s)) browser = "Samsung Internet";
  else if (/firefox|fxios/i.test(s)) browser = "Firefox";
  else if (/chrome|crios/i.test(s)) browser = "Chrome";
  else if (/safari/i.test(s)) browser = "Safari";

  // Betriebssystem
  let os = "Andere";
  if (/windows/i.test(s)) os = "Windows";
  else if (/iphone|ipad|ipod|ios/i.test(s)) os = "iOS";
  else if (/mac os x|macintosh/i.test(s)) os = "macOS";
  else if (/android/i.test(s)) os = "Android";
  else if (/linux/i.test(s)) os = "Linux";

  return { device, browser, os };
}
