"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { PiNewspaperBold, PiArrowSquareOutBold } from "react-icons/pi";
import { Skeleton } from "@/components/ui/Skeleton";
import Reveal from "@/components/ui/Reveal";

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function NewsWidget({ compact = false }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await axios.get("/api/news/rss");
        if (active) setNews((data.news || []).slice(0, compact ? 5 : 6));
      } catch {
        /* ignorieren */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [compact]);

  if (!loading && news.length === 0) return null;

  // Kompakte Variante für die Feed-Seitenleiste (vertikale Liste in einer Karte).
  if (compact) {
    return (
      <div className="bg-ink-800 rounded-md border border-ink-600 p-4">
        <h3 className="text-sm font-bold text-paper-50 flex items-center gap-2 mb-3">
          <PiNewspaperBold className="text-brand-400" /> Basketball-News
        </h3>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3.5 w-full mb-1.5" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-3 max-h-80 overflow-y-auto -mr-1 pr-1">
            {news.map((n, i) => (
              <li key={i}>
                <a
                  href={n.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <p className="text-sm font-medium text-paper-50 leading-snug line-clamp-2 group-hover:text-brand-400">
                    {n.title}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-mist-400">
                    <span className="truncate">{n.source || "News"}</span>
                    <span className="flex-shrink-0">· {formatDate(n.pubDate)}</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <h2 className="text-xl font-bold text-paper-50 flex items-center gap-2 mb-6">
        <PiNewspaperBold className="text-brand-400" /> Basketball-News
      </h2>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-ink-800 rounded-md border border-ink-600 p-5">
              <Skeleton className="h-3.5 w-full mb-2" />
              <Skeleton className="h-3.5 w-2/3 mb-4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((n, i) => (
            <Reveal key={i} delay={i * 60} className="h-full">
            <a
              href={n.link}
              target="_blank"
              rel="noopener noreferrer"
              className="h-full bg-ink-800 rounded-md border border-ink-600 p-5 hover:border-brand-500/50 transition-all flex flex-col"
            >
              <p className="font-medium text-paper-50 text-sm leading-snug line-clamp-3">
                {n.title}
              </p>
              <div className="mt-auto pt-3 flex items-center justify-between text-xs text-mist-400">
                <span className="truncate">{n.source || "News"}</span>
                <span className="flex items-center gap-1 flex-shrink-0">
                  {formatDate(n.pubDate)} <PiArrowSquareOutBold />
                </span>
              </div>
            </a>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
