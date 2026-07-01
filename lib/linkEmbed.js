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

// Verhindert simple SSRF: nur http(s), keine localhost/privaten Adressen.
// (Literale IPs + localhost; kein DNS-Rebinding-Schutz – für diesen Umfang ok.)
function isSafePublicUrl(u) {
  let parsed;
  try {
    parsed = new URL(u);
  } catch {
    return false;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
  const host = parsed.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local")) return false;
  if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host)) return false;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return false;
  if (host === "::1" || host === "[::1]" || host.startsWith("fe80")) return false;
  return true;
}

function decodeEntities(s) {
  return String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#x2F;/gi, "/")
    .trim();
}

// Meta-Tag-Inhalt zu einer Property/Name aus dem HTML ziehen (Attribut-Reihenfolge egal).
function metaContent(html, key) {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)\\s*=\\s*["']${key}["'][^>]*>`,
    "i"
  );
  const tag = html.match(re);
  if (!tag) return "";
  const c = tag[0].match(/content\s*=\s*["']([^"']*)["']/i);
  return c ? decodeEntities(c[1]) : "";
}

// Open-Graph-Metadaten der Ziel-Seite laden (Titel/Beschreibung/Bild).
// Wird EINMAL beim Erstellen aufgerufen; Ergebnis wird am Embed gespeichert.
// Vollständig fehlertolerant → {} bei jedem Problem (Timeout/kein HTML/Fehler).
async function fetchOgMeta(url) {
  if (!isSafePublicUrl(url)) return {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        // Manche Seiten liefern OG-Tags nur an „echte" Clients.
        "User-Agent":
          "Mozilla/5.0 (compatible; HoopsGermanyBot/1.0; +https://hoopsgermany.de)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    const ctype = res.headers.get("content-type") || "";
    if (!res.ok || !ctype.includes("text/html")) return {};

    // Nur den <head>-Bereich lesen (max. ~256 KB) – OG-Tags stehen oben.
    const reader = res.body?.getReader();
    if (!reader) return {};
    const decoder = new TextDecoder();
    let html = "";
    while (html.length < 262144) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
      if (/<\/head>/i.test(html)) break;
    }
    try {
      await reader.cancel();
    } catch {
      /* egal */
    }

    const title =
      metaContent(html, "og:title") ||
      metaContent(html, "twitter:title") ||
      decodeEntities((html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || "");
    const description =
      metaContent(html, "og:description") ||
      metaContent(html, "twitter:description") ||
      "";
    let image = metaContent(html, "og:image") || metaContent(html, "twitter:image") || "";
    if (image) {
      try {
        image = new URL(image, res.url || url).href; // relative → absolut
      } catch {
        image = "";
      }
      if (!isSafePublicUrl(image)) image = "";
    }

    const out = {};
    if (title) out.title = title.slice(0, 200);
    if (description) out.description = description.slice(0, 300);
    if (image) out.image = image;
    return out;
  } catch {
    return {};
  } finally {
    clearTimeout(timer);
  }
}

// Ein Link-Embed um OG-Metadaten anreichern (YouTube braucht nichts).
// Gibt das (ggf. angereicherte) Embed zurück; null bleibt null.
export async function enrichEmbed(embed) {
  if (!embed || embed.type !== "link" || !embed.url) return embed;
  const og = await fetchOgMeta(embed.url);
  return { ...embed, ...og };
}
