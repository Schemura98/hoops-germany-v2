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

      {/* Hero */}
      <LandingHero />

      {/* Onboarding-Checklist (nur eingeloggt, blendet sich selbst aus) */}
      <LandingOnboarding />

      {/* Features */}
      <LandingFeatures />

      {/* So funktionierts / Nächste Schritte – je nach Login-Status */}
      <LandingHowItWorks />

      {/* Basketball-News */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <NewsWidget />
        </div>
      </section>

      {/* CTA – nur für ausgeloggte Besucher */}
      <LandingCTA />

      <Footer />
    </div>
  );
}
