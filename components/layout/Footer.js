import Link from "next/link";
import TourLink from "@/components/onboarding/TourLink";

const legal = [
  { href: "/installieren", label: "App installieren" },
  { href: "/about", label: "Über uns" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/feedback", label: "Feedback" },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Hoops Germany. Alle Rechte vorbehalten.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          {legal.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-gray-500 hover:text-brand-600"
            >
              {l.label}
            </Link>
          ))}
          <TourLink />
        </div>
      </div>
    </footer>
  );
}
