"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { PiBasketballBold, PiPrinterBold, PiArrowLeftBold } from "react-icons/pi";
import Link from "next/link";
import SponsorReportView from "@/components/admin/SponsorReportView";
import { getAdminToken } from "@/lib/clientAuth";

function ReportInner() {
  const params = useSearchParams();
  const period = [7, 30, 90, 365].includes(Number(params.get("period"))) ? Number(params.get("period")) : 30;
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState("loading");
  const [generatedAt, setGeneratedAt] = useState("");

  useEffect(() => {
    setGeneratedAt(new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" }));
    (async () => {
      const token = getAdminToken();
      if (!token) {
        setStatus("denied");
        return;
      }
      try {
        const { data } = await axios.post("/api/analytics/summary", { token, period });
        setSummary(data.summary);
        setStatus("ready");
      } catch (err) {
        setStatus(err.response?.status === 401 ? "denied" : "error");
      }
    })();
  }, [period]);

  if (status === "loading")
    return <div className="min-h-screen flex items-center justify-center"><PiBasketballBold className="text-brand-400 text-3xl animate-bounce" /></div>;
  if (status === "denied")
    return <div className="min-h-screen flex items-center justify-center p-8 text-mist-400">Kein Zugriff – bitte als Admin anmelden.</div>;
  if (status === "error" || !summary)
    return <div className="min-h-screen flex items-center justify-center p-8 text-mist-400">Report konnte nicht geladen werden.</div>;

  return (
    <div className="min-h-screen bg-ink-700 print:bg-ink-800 py-8 print:py-0">
      <div className="max-w-3xl mx-auto px-4 mb-4 flex items-center justify-between print:hidden">
        <Link href="/admin/analytics" className="inline-flex items-center gap-1.5 text-sm text-mist-400 hover:text-paper-50">
          <PiArrowLeftBold className="text-xs" /> Zurück
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-ink-950 font-semibold rounded-md px-4 py-2.5 text-sm"
        >
          <PiPrinterBold /> Drucken / als PDF speichern
        </button>
      </div>
      <SponsorReportView summary={summary} period={period} generatedAt={generatedAt} />
    </div>
  );
}

export default function SponsorReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><PiBasketballBold className="text-brand-400 text-3xl animate-bounce" /></div>}>
      <ReportInner />
    </Suspense>
  );
}
