"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { PiNewspaperBold, PiArrowSquareOutBold } from "react-icons/pi";
import { Skeleton } from "@/components/ui/Skeleton";
import Reveal from "@/components/ui/Reveal";
import { staffel } from "@/lib/ui";

// ⚠️ `grid-cols-1` IST HIER KEINE KOSMETIK, SONDERN DIE FEHLENDE ANSAGE.
// (Befund Kai, live auf hoopsgermany.de gemessen; behoben Vivien, 20.08.2026.)
//
// Hier stand `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` — Tablet und Desktop
// sagten also, wie viele Spalten sie haben, und ausgerechnet MOBIL sagte es
// niemand. Das ist keine Auslassung ohne Folgen: Ohne Ansage legt CSS eine
// Spalte vom Typ `auto` an, und eine `auto`-Spalte richtet sich nach ihrem
// INHALT statt nach dem Bildschirm.
//
// Was daraus wurde, auf 360 px nachgemessen: Eine der sechs Meldungen kam von
// „GT/ET Göttinger Tageblatt - Eichsfelder Tageblatt". Dieser Quellenname steht
// in einer Zeile, die nicht umbrechen darf (`truncate`), seine schmalste
// mögliche Breite ist deshalb seine GANZE Breite: 266,6 px. Dazu das Datum
// (78 px, darf nie schrumpfen), dazu Innenabstand und Rahmen — macht 386,2 px.
// Auf diese 386,2 px stellte sich die Spalte, obwohl der Platz 280 px betrug.
// Alle SECHS Karten wurden dadurch zu breit, denn sie teilen sich eine Spalte.
// Der Leser verlor rechts 45 px jeder Nachricht.
//
// ⚠️ Die Verkürzung mit „…" war die ganze Zeit da und konnte nie greifen.
// `truncate` ist ein Angebot: „Ich mache mich kleiner, WENN mir jemand eine
// Breite vorgibt." Genau das tat niemand — die Spalte fragte die Karte, wie
// breit sie sein will, und die Karte antwortete mit der Breite ihres Textes.
//
// `grid-cols-1` beendet das, und zwar an der Wurzel: Tailwind schreibt dafür
// `repeat(1, minmax(0, 1fr))`. Die Untergrenze der Spalte ist damit die feste
// Zahl 0 statt `auto` — und nur bei `auto` darf sich ein Element auf seine
// Inhaltsbreite versteifen (CSS Grid, „Automatic Minimum Size of Grid Items").
// Die Spalte misst jetzt 280 px, die Karte 280 px, und der Quellenname kürzt
// sich zu „GT/ET Göttinger Tage…" — das Versprechen wird eingelöst.
//
// ⚠️ Wer die Klasse wieder entfernt, bekommt den Fehler zurück, sobald EINE
// Nachricht aus einer Quelle mit langem Namen kommt. Die Quellen liefert ein
// fremder Feed; wir bestimmen sie nicht.
const KARTEN_GITTER = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

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

// `nackt`: ohne eigene Karte UND ohne eigene Ueberschrift - fuer die Schiene
// des Newsfeeds, die den Titel selbst setzt. Ohne das stand "Basketball-News"
// dort zweimal untereinander (beim Umbau am 15.08.2026 im Browser gemessen).
export default function NewsWidget({ compact = false, nackt = false }) {
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
      <div className={nackt ? "" : "bg-navy-800 rounded-md border border-navy-600 p-4"}>
        {!nackt && (
          <h3 className="text-sm font-bold text-paper-50 flex items-center gap-2 mb-3">
            <PiNewspaperBold className="text-brand-400" /> Basketball-News
          </h3>
        )}
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
        <div className={KARTEN_GITTER}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-navy-800 rounded-md border border-navy-600 p-5">
              <Skeleton className="h-3.5 w-full mb-2" />
              <Skeleton className="h-3.5 w-2/3 mb-4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className={KARTEN_GITTER}>
          {news.map((n, i) => (
            <Reveal key={i} delay={staffel(i)} className="h-full">
            <a
              href={n.link}
              target="_blank"
              rel="noopener noreferrer"
              className="h-full bg-navy-800 rounded-md border border-navy-600 p-5 hover:border-brand-500/50 transition-all flex flex-col"
            >
              <p className="font-medium text-paper-50 text-sm leading-snug line-clamp-3">
                {n.title}
              </p>
              {/* ⚠️ `gap-3` ist der zweite Teil derselben Sache (Vivien, 20.08.2026).
                  Sobald der Quellenname nachgibt, füllt er den Platz bis auf den
                  letzten Pixel — gemessen lagen Kürzungspunkte und Datum auf
                  EINER Kante, Abstand 0,00 px, auf allen vier geprüften Breiten.
                  Dann liest sich „Göttinger Tageblatt - …18.08.2026" wie ein
                  einziger Ausdruck, und die drei Punkte verlieren ihre Aussage:
                  Sie sollen sagen „hier steht mehr", nicht das Datum anfassen.
                  ⚠️ Auf Tablet und Desktop war dieser Kontakt schon VOR dem
                  Spalten-Fix da — dort wurde ohnehin gekürzt. Er fällt nur
                  zusammen mit ihm auf, weil er jetzt auch mobil eintritt. */}
              <div className="mt-auto pt-3 flex items-center justify-between gap-3 text-xs text-mist-400">
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
