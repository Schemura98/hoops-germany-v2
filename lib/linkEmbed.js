// Erste URL im Text als Embed erkennen (beim Erstellen aufgerufen, Ergebnis wird
// denormalisiert am Post gespeichert → kein Fetch/populate im Render).

const URL_RE = /(https?:\/\/[^\s<]+)/i;

function youtubeId(url) {
  let m;
  if ((m = url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/))) return m[1];
  if ((m = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/))) return m[1];
  if ((m = url.match(/youtube\.com\/(?:embed|shorts)\/([A-Za-z0-9_-]{6,})/))) return m[1];
  return null;
}

// Rückgabe: { type:"youtube", videoId, url } | { type:"link", url, domain } | null
export function detectEmbed(content) {
  const match = String(content || "").match(URL_RE);
  if (!match) return null;
  // Häufige Satzzeichen am Ende der URL entfernen.
  const url = match[1].replace(/[).,!?;:]+$/, "");

  if (/(?:youtube\.com|youtu\.be)/i.test(url)) {
    const id = youtubeId(url);
    if (id) return { type: "youtube", videoId: id, url };
  }

  let domain = "";
  try {
    domain = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
  return { type: "link", url, domain };
}
