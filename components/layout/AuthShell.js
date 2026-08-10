import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

// Geteiltes Split-Screen-Layout für alle Auth-Seiten (Login, Signup, Reset,
// Team-Login/Register). Links das Formular, rechts ein Vollbild-Motiv.
// Präsentational, hält die Auth-Seiten schlank und konsistent.
export default function AuthShell({
  image = "/images/login image.jpg",
  imageAlt = "Basketball",
  title,
  subtitle,
  children,
  footer,
}) {
  return (
    <div className="relative min-h-screen lg:flex">
      <Link
        href="/"
        className="absolute top-5 left-5 z-10 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 shadow-sm text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-400 hover:shadow-md transition-all"
      >
        <FaArrowLeft className="text-xs" />
        <span className="hidden sm:inline">Zur Startseite</span>
      </Link>

      <div className="lg:w-1/2 w-full flex items-center justify-center px-6 py-10 sm:py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-5 sm:mb-8">
            <Link href="/">
              <img
                src="/images/logo-hoops.svg"
                alt="Hoops Germany"
                className="w-40 sm:w-56 h-auto mx-auto mb-6"
              />
            </Link>
            {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>

          {children}

          {footer && <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>}
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative">
        <img src={image} alt={imageAlt} className="absolute inset-0 w-full h-full object-cover" />
      </div>
    </div>
  );
}
