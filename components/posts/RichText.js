import Link from "next/link";

// Rendert Beitragstext mit klickbaren URLs, #Hashtags und @Mentions.
// mentions: [{ token, slug }] – nur aufgelöste @-Tokens werden verlinkt.
// URL-Alternative steht zuerst, damit URLs nicht an #/@ zerschnitten werden.
const TOKEN_RE = /(https?:\/\/[^\s<]+|[#@][A-Za-z0-9_äöüÄÖÜß]+)/g;

export default function RichText({ text, mentions = [] }) {
  if (!text) return null;

  const mentionMap = new Map();
  for (const m of mentions || []) {
    if (m?.token && m?.slug) mentionMap.set(m.token.toLowerCase(), m.slug);
  }

  const parts = String(text).split(TOKEN_RE);

  return (
    <>
      {parts.map((part, i) => {
        if (/^https?:\/\//i.test(part)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:underline break-all"
            >
              {part}
            </a>
          );
        }
        if (part.length > 1 && part[0] === "#") {
          const tag = part.slice(1).toLowerCase();
          return (
            <Link
              key={i}
              href={`/feed/tag/${encodeURIComponent(tag)}`}
              className="text-brand-400 hover:underline"
            >
              {part}
            </Link>
          );
        }
        if (part.length > 1 && part[0] === "@") {
          const slug = mentionMap.get(part.slice(1).toLowerCase());
          if (slug) {
            return (
              <Link
                key={i}
                href={`/player/view-player/${slug}`}
                className="text-brand-400 font-medium hover:underline"
              >
                {part}
              </Link>
            );
          }
          return part;
        }
        return part;
      })}
    </>
  );
}
