"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { PiMegaphoneBold, PiMapPinBold, PiUsersBold } from "react-icons/pi";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { positionLabel } from "@/lib/constants";

// Karten-Skeleton im Format der echten Tryout-Karte (Avatar + Textzeilen + Meta).
function TryoutCardSkeleton() {
  return (
    <div className="bg-navy-800 rounded-md border border-navy-600 p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-3.5 w-1/3 mb-2" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <div className="mt-3 flex gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function TryoutsPage() {
  const [tryouts, setTryouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await axios.get("/api/tryouts");
        if (active) setTryouts(data.tryouts || []);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar />

      <PageHeader
        eyebrow="Probetraining"
        title="Tryouts"
        subtitle="Offene Probetrainings – finde dein nächstes Team."
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <TryoutCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <EmptyState title="Tryouts konnten nicht geladen werden." />
        ) : tryouts.length === 0 ? (
          <EmptyState icon={PiMegaphoneBold} title="Aktuell sind keine Tryouts ausgeschrieben." />
        ) : (
          <div className="space-y-3">
            {tryouts.map((t) => (
              <Link
                key={t._id}
                href={`/tryouts/${t._id}`}
                className="block bg-navy-800 rounded-md border border-navy-600 p-5 hover:border-brand-500/50 transition-[transform,box-shadow,border-color] duration-200 ease-out-strong hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
              >
                <div className="flex items-center gap-3">
                  {t.team?.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.team.logo} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span className="h-10 w-10 rounded-full bg-brand-500/15 text-brand-400 flex items-center justify-center">
                      <PiUsersBold />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-paper-50 truncate">
                      {t.team?.teamName || "Team"}
                    </p>
                    <p className="text-xs text-mist-400">{formatDate(t.date)}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-mist-400">
                  {t.location && (
                    <span className="flex items-center gap-1">
                      <PiMapPinBold /> {t.location}
                    </span>
                  )}
                  <span>{t.applicantCount} Bewerber</span>
                </div>

                {t.positions?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {t.positions.map((p) => (
                      <span
                        key={p}
                        className="text-xs font-medium bg-brand-500/10 text-brand-400 rounded-sm px-2 py-0.5"
                      >
                        {positionLabel(p)}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
