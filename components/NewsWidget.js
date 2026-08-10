"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FaNewspaper, FaExternalLinkAlt } from "react-icons/fa";
import { Skeleton } from "@/components/ui/Skeleton";

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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
          <FaNewspaper className="text-brand-500" /> Basketball-News
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
                  <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2 group-hover:text-brand-600">
                    {n.title}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-500">
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
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
        <FaNewspaper className="text-brand-500" /> Basketball-News
      </h2>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
              <Skeleton className="h-3.5 w-full mb-2" />
              <Skeleton className="h-3.5 w-2/3 mb-4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((n, i) => (
            <a
              key={i}
              href={n.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-brand-200 transition-all flex flex-col"
            >
              <p className="font-medium text-gray-900 text-sm leading-snug line-clamp-3">
                {n.title}
              </p>
              <div className="mt-auto pt-3 flex items-center justify-between text-xs text-gray-500">
                <span className="truncate">{n.source || "News"}</span>
                <span className="flex items-center gap-1 flex-shrink-0">
                  {formatDate(n.pubDate)} <FaExternalLinkAlt />
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
