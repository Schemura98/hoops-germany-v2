import { FaGlobe, FaExternalLinkAlt } from "react-icons/fa";

// Rendert das denormalisierte Embed eines Beitrags: YouTube-iframe (16:9, lazy)
// oder eine kompakte Link-Vorschau-Karte (Domain + URL).
export default function PostEmbed({ embed }) {
  if (!embed) return null;

  if (embed.type === "youtube" && embed.videoId) {
    return (
      <div
        className="mt-3 relative w-full overflow-hidden rounded-xl bg-black"
        style={{ paddingBottom: "56.25%" }}
      >
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube.com/embed/${embed.videoId}`}
          title="YouTube-Video"
          loading="lazy"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  if (embed.type === "link" && embed.url) {
    return (
      <a
        href={embed.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center gap-3 rounded-xl border border-gray-200 p-3 transition-colors hover:border-brand-300 hover:bg-gray-50"
      >
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
          <FaGlobe />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-gray-900">{embed.domain}</span>
          <span className="block truncate text-xs text-gray-400">{embed.url}</span>
        </span>
        <FaExternalLinkAlt className="flex-shrink-0 text-xs text-gray-400" />
      </a>
    );
  }

  return null;
}
