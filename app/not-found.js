import { PiBasketballBold } from "react-icons/pi";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";

export const metadata = { title: "Seite nicht gefunden – Hoops Germany" };

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar />

      <PageHeader eyebrow="Fehler 404" title="Seite nicht gefunden" />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-16 text-center">
        <PiBasketballBold className="text-brand-400 text-4xl mx-auto mb-4" />
        <p className="text-mist-400">
          Die Seite, die du suchst, gibt es nicht – oder der Link ist fehlerhaft.
        </p>
        <Button href="/" className="mt-6">
          Zur Startseite
        </Button>
      </main>

      <Footer />
    </div>
  );
}
