import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import League from "@/models/League";

// Server-seitige Metadata für die (client-gerenderte) Liga-Detailseite.
// Demo-Ligen (isDemo:true) erhalten ausdrücklich robots noindex/nofollow, damit
// Beispieldaten nicht indexiert werden. Reale Ligen bleiben indexierbar (kein Override).
export async function generateMetadata({ params }) {
  try {
    if (!mongoose.isValidObjectId(params.id)) return {};
    await connectDB();
    const league = await League.findById(params.id).select("name isDemo");
    if (!league) return {};
    const base = { title: `${league.name} – Hoops Germany` };
    if (league.isDemo) {
      return { ...base, robots: { index: false, follow: false } };
    }
    return base;
  } catch {
    return {};
  }
}

export default function LigaDetailLayout({ children }) {
  return children;
}
