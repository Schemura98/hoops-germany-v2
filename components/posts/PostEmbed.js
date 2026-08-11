"use client";

import { useState } from "react";
import { PiGlobeBold, PiArrowSquareOutBold, PiPlayBold, PiImageBold } from "react-icons/pi";

// Rendert das denormalisierte Embed eines Beitrags. Inhalte von Drittanbietern
// (YouTube-Player, externe Vorschaubilder) werden aus Datenschutzgründen NICHT
// automatisch geladen, sondern erst nach aktivem Klick (Consent). Bis dahin
// stellt der Browser keine Verbindung zu den Anbietern her. Das eigentliche Video
// lädt im „erweiterten Datenschutzmodus" (youtube-nocookie.com).
export default function PostEmbed({ embed }) {
  const [ytLoaded, setYtLoaded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!embed) return null;

  // --- YouTube: Platzhalter → Klick lädt den Player (no-cookie) ---
  if (embed.type === "youtube" && embed.videoId) {
    return (
      <div
        className="mt-3 relative w-full overflow-hidden rounded-md bg-ink-900"
        style={{ paddingBottom: "56.25%" }}
      >
        {ytLoaded ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${embed.videoId}?autoplay=1`}
            title="YouTube-Video"
            loading="lazy"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setYtLoaded(true)}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-paper-50/90 transition-colors hover:bg-ink-700"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-ink-950">
              <PiPlayBold className="ml-1" />
            </span>
            <span className="text-sm font-medium">Video von YouTube laden</span>
            <span className="max-w-xs px-6 text-center text-[11px] leading-snug text-paper-50/50">
              Erst beim Klick wird eine Verbindung zu YouTube (Google) hergestellt.
            </span>
          </button>
        )}
      </div>
    );
  }

  // --- Link mit Open-Graph-Daten: reiche Karte; Vorschaubild erst auf Klick ---
  if (embed.type === "link" && embed.url) {
    if (embed.title || embed.image) {
      return (
        <div className="mt-3 overflow-hidden rounded-md border border-ink-600">
          {embed.image &&
            (imgLoaded ? (
              <a href={embed.url} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={embed.image}
                  alt=""
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="h-44 w-full bg-ink-700 object-cover"
                />
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setImgLoaded(true)}
                className="flex h-28 w-full items-center justify-center gap-2 bg-ink-700 text-xs text-mist-400 transition-colors hover:bg-ink-700"
              >
                <PiImageBold /> Vorschaubild laden
              </button>
            ))}
          <a
            href={embed.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 transition-colors hover:bg-ink-700"
          >
            <span className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-mist-400">
              <PiGlobeBold className="text-[10px]" /> {embed.domain}
            </span>
            {embed.title && (
              <span className="mt-1 block text-sm font-semibold text-paper-50 line-clamp-2">
                {embed.title}
              </span>
            )}
            {embed.description && (
              <span className="mt-1 block text-xs text-mist-400 line-clamp-2">
                {embed.description}
              </span>
            )}
          </a>
        </div>
      );
    }

    // Ohne OG-Daten: kompakte Domain-Karte (kein Dritt-Inhalt, kein Nachladen).
    return (
      <a
        href={embed.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center gap-3 rounded-md border border-ink-600 p-3 transition-colors hover:border-brand-300 hover:bg-ink-700"
      >
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm bg-ink-700 text-mist-400">
          <PiGlobeBold />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-paper-50">{embed.domain}</span>
          <span className="block truncate text-xs text-mist-400">{embed.url}</span>
        </span>
        <PiArrowSquareOutBold className="flex-shrink-0 text-xs text-mist-400" />
      </a>
    );
  }

  return null;
}
