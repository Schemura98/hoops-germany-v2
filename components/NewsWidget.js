"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FaNewspaper, FaExternalLinkAlt } from "react-icons/fa";

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

export default function NewsWidget() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await axios.get("/api/news/rss");
        if (active) setNews((data.news || []).slice(0, 6));
      } catch {
        /* ignorieren */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!loading && news.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
        <FaNewspaper className="text-brand-500" /> Basketball-News
      </h2>

      {loading ? (
        <p className="text-sm text-gray-400">Lädt…</p>
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
              <div className="mt-auto pt-3 flex items-center justify-between text-xs text-gray-400">
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
