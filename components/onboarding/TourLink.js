"use client";

// Footer-Link, der die Willkommens-Tour erneut öffnet (Event wird von WelcomeTour
// im Root-Layout abgefangen).
export default function TourLink({ className = "" }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("hg:open-tour"))}
      className={className || "text-sm text-mist-400 hover:text-brand-400"}
    >
      Plattform-Tour
    </button>
  );
}
