"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaCommentDots } from "react-icons/fa";

// Schwebender Feedback-Button (Testphase) – auf allen Seiten sichtbar,
// ausgenommen die Feedback-Seite selbst und der interne Admin-Bereich.
export default function FeedbackButton() {
  const pathname = usePathname();
  if (!pathname || pathname.startsWith("/feedback") || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <Link
      href="/feedback"
      aria-label="Feedback geben"
      title="Feedback geben"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/30 px-4 py-3 text-sm font-semibold transition-colors"
    >
      <FaCommentDots className="text-base" />
      <span className="hidden sm:inline">Feedback</span>
    </Link>
  );
}
