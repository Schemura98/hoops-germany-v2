import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Gemeinsame Hülle für Inhalts-/Rechtsseiten.
export default function LegalShell({ title, children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4 text-sm text-gray-600 leading-relaxed">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Wiederverwendbare Abschnitts-Überschrift innerhalb der Hülle.
export function LegalHeading({ children }) {
  return <h2 className="text-base font-semibold text-gray-900 pt-2">{children}</h2>;
}
