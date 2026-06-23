import { ok, withErrorHandling } from "@/lib/apiResponse";

// Quelle: Google-News-RSS-Suche nach deutschem Basketball.
const FEED_URL =
  "https://news.google.com/rss/search?q=basketball%20deutschland&hl=de&gl=DE&ceid=DE:de";

// 30 Minuten serverseitig cachen.
export const revalidate = 1800;

function stripTags(s) {
  return s.replace(/<[^>]+>/g, "").trim();
}

function unwrapCdata(s) {
  const m = /<!\[CDATA\[([\s\S]*?)\]\]>/.exec(s);
  return (m ? m[1] : s).trim();
}

function pick(block, tag) {
  const r = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`).exec(block);
  return r ? unwrapCdata(r[1]) : "";
}

// GET /api/news/rss – Basketball-News (geparst aus RSS).
async function handler() {
  try {
    const res = await fetch(FEED_URL, {
      headers: { "User-Agent": "HoopsGermany/1.0" },
      next: { revalidate },
    });
    if (!res.ok) return ok({ news: [] });

    const xml = await res.text();
    const news = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .slice(0, 12)
      .map((m) => {
        const block = m[1];
        return {
          title: stripTags(pick(block, "title")),
          link: pick(block, "link"),
          pubDate: pick(block, "pubDate"),
          source: stripTags(pick(block, "source")),
        };
      })
      .filter((n) => n.title && n.link);

    return ok({ news });
  } catch {
    // News sind optional – bei Fehlern leere Liste zurückgeben.
    return ok({ news: [] });
  }
}

export const GET = withErrorHandling(handler);
