"use client";

import { FaBasketballBall } from "react-icons/fa";
import { useCurrentAdmin } from "@/lib/useCurrentAdmin";
import AdminNav from "@/components/layout/AdminNav";

// Hülle für Admin-Seiten: Guard + Navigation.
export default function AdminShell({ title, children }) {
  const { status } = useCurrentAdmin();

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <FaBasketballBall className="text-brand-500 text-3xl animate-bounce" />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
        <p className="text-gray-700">Konnte nicht geladen werden.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 font-medium"
        >
          Erneut versuchen
        </button>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {title && <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>}
        {children}
      </main>
    </div>
  );
}
