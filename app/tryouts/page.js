"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaBasketballBall, FaBullhorn, FaMapMarkerAlt, FaUsers } from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import { positionLabel } from "@/lib/constants";

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <PageHeader
        eyebrow="Probetraining"
        title="Tryouts"
        subtitle="Offene Probetrainings – finde dein nächstes Team."
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">

        {loading ? (
          <Loading />
        ) : error ? (
          <EmptyState title="Tryouts konnten nicht geladen werden." />
        ) : tryouts.length === 0 ? (
          <EmptyState icon={FaBullhorn} title="Aktuell sind keine Tryouts ausgeschrieben." />
        ) : (
          <div className="space-y-3">
            {tryouts.map((t) => (
              <Link
                key={t._id}
                href={`/tryouts/${t._id}`}
                className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-brand-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  {t.team?.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.team.logo} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span className="h-10 w-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
                      <FaUsers />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {t.team?.teamName || "Team"}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(t.date)}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  {t.location && (
                    <span className="flex items-center gap-1">
                      <FaMapMarkerAlt /> {t.location}
                    </span>
                  )}
                  <span>{t.applicantCount} Bewerber</span>
                </div>

                {t.positions?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {t.positions.map((p) => (
                      <span
                        key={p}
                        className="text-xs font-medium bg-brand-50 text-brand-700 rounded-full px-2 py-0.5"
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
