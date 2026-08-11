"use client";

import { PiBasketballBold } from "react-icons/pi";
import { useCurrentAdmin } from "@/lib/useCurrentAdmin";
import AdminNav from "@/components/layout/AdminNav";

// Hülle für Admin-Seiten: Guard + Navigation.
export default function AdminShell({ title, children }) {
  const { status } = useCurrentAdmin();

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ink-950">
        <PiBasketballBold className="text-brand-400 text-3xl animate-bounce" />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-ink-950 p-8 text-center">
        <p className="text-mist-300">Konnte nicht geladen werden.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-brand-500 hover:bg-brand-400 text-ink-950 rounded-sm px-4 py-2 font-medium"
        >
          Erneut versuchen
        </button>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-ink-950">
      <AdminNav />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {title && <h1 className="font-display uppercase tracking-tight text-2xl font-black text-paper-50 mb-6">{title}</h1>}
        {children}
      </main>
    </div>
  );
}
