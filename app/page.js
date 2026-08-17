import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LandingHero from "@/components/landing/LandingHero";
import LandingOnboarding from "@/components/landing/LandingOnboarding";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingHowItWorks from "@/components/landing/LandingHowItWorks";
import LandingCTA from "@/components/landing/LandingCTA";
import NewsWidget from "@/components/NewsWidget";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* `flex-1` sitzt am <main> (nicht mehr an den einzelnen Abschnitten),
          damit der Footer weiterhin unten steht, wenn der Inhalt kürzer als
          der Viewport ist. Der Landepunkt der Sprungmarke aus app/layout.js —
          bis 17.08.2026 hatte ausgerechnet die Startseite gar kein <main>. */}
      <main id="hauptinhalt" tabIndex={-1} className="flex-1">
        {/* Hero */}
        <LandingHero />

        {/* Onboarding-Checklist (nur eingeloggt, blendet sich selbst aus) */}
        <LandingOnboarding />

        {/* Features */}
        <LandingFeatures />

        {/* Basketball-News – steht bewusst VOR "So funktionierts": Für
            Wiederkehrer ist der News-Block der einzige Teil der Seite, der sich
            zwischen zwei Besuchen tatsächlich ändert (echte, datierte Meldungen).
            Ganz unten hat ihn ein scrollmüder Wiederkehrer vermutlich nie
            erreicht (Befund Ronja O4, Entscheid Nele: Sichtbarkeit statt
            Zahlensignal – eine Beteiligungszahl waere in der Testphase entweder
            unehrlich oder entmutigend). */}
        <section className="bg-navy-800 py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <NewsWidget />
          </div>
        </section>

        {/* So funktionierts / Nächste Schritte – je nach Login-Status */}
        <LandingHowItWorks />

        {/* CTA – nur für ausgeloggte Besucher */}
        <LandingCTA />
      </main>

      <Footer />
    </div>
  );
}
