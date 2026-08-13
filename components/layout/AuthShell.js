import Link from "next/link";
import { PiArrowLeftBold } from "react-icons/pi";

// Geteiltes Split-Screen-Layout für alle Auth-Seiten (Login, Signup, Reset,
// Team-Login/Register). Links das Formular, rechts ein Vollbild-Motiv.
// Präsentational, hält die Auth-Seiten schlank und konsistent.

// Moderne Varianten der Auth-Motive (Milo, 11.08.2026, `docs/HERO-ASSETS-2026-08-11.md`):
// native Auflösung, also identische Schärfe bei deutlich kleinerem Gewicht
// (signupImage 277 KB → 135 KB AVIF). Unbekannte Pfade fallen still auf das JPEG zurück.
const MODERN_SOURCES = {
  "/images/login image.jpg": {
    avif: "/images/login-image-1000.avif",
    webp: "/images/login-image-1000.webp",
  },
  // Ersetzt am 13.08.2026 das alte Arena-Motiv (`signupImage.jpg`): Das zeigte
  // eine ausverkaufte Profi-Arena mit sichtbarer Nike-Bandenwerbung — auf der
  // Registrierungsseite eines Portals fuer Bezirks- und Kreisliga in NRW das
  // Versprechen einer Welt, die es hier nicht gibt. Das neue Motiv ist eine
  // europaeische Vereinshalle mit Sprossenwaenden; die orangen Leibchen im
  // Hintergrund treffen zufaellig die Markenfarbe.
  // Herkunft: Pexels, Drago Rapovac — Nachweis in
  // Hoops-Marketing\_werkzeuge\stock-kandidaten\auswahl\HERKUNFT-AUSWAHL.json
  "/images/signup-halle-1880.jpg": {
    avif: "/images/signup-halle-1880.avif",
    webp: "/images/signup-halle-1880.webp",
  },
};

// Das Motiv wird erst ab `lg` (1024px) angezeigt – unterhalb soll gar nichts geladen werden.
const DESKTOP_ONLY = "(min-width: 1024px)";
// 1x1-Transparenz als Fallback für <lg: kostet keine Netzwerkanfrage.
const BLANK_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

export default function AuthShell({
  image = "/images/login image.jpg",
  imageAlt = "Basketball",
  // Das Motiv steht in einem hohen, schmalen Halbbild; `object-cover` schneidet
  // deshalb links und rechts weg. Bei einem Querformat mit auszerhalb der Mitte
  // liegendem Motiv faellt genau das Wesentliche heraus. Deshalb je Seite
  // ausrichtbar statt fest mittig.
  imagePosition = "center",
  title,
  subtitle,
  children,
  footer,
}) {
  const modern = MODERN_SOURCES[image];

  return (
    <div className="relative min-h-screen lg:flex">
      <Link
        href="/"
        className="absolute top-5 left-5 z-10 inline-flex items-center gap-2 px-3 py-2 rounded-md bg-navy-800 border border-navy-600 text-sm font-medium text-mist-400 hover:text-paper-50 hover:border-navy-500 transition-all"
      >
        <PiArrowLeftBold className="text-xs" />
        <span className="hidden sm:inline">Zur Startseite</span>
      </Link>

      <div className="lg:w-1/2 w-full flex items-center justify-center px-6 py-10 sm:py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-5 sm:mb-8">
            <Link href="/">
              <img
                src="/images/logo.svg"
                alt="Hoops Germany"
                className="w-40 sm:w-56 h-auto mx-auto mb-6"
              />
            </Link>
            {title && <h1 className="font-display uppercase tracking-tight text-2xl font-black text-paper-50">{title}</h1>}
            {subtitle && <p className="mt-1 text-sm text-mist-400">{subtitle}</p>}
          </div>

          {children}

          {footer && <div className="mt-6 text-center text-sm text-mist-400">{footer}</div>}

          {/* Hinweis auf die Datenschutzerklärung, 13.08.2026 (Fund von Nora,
              docs/RECHT-LEISTUNGSKARTE-2026-08-13.md): Auf /signup wurde sie
              bisher NIRGENDS verlinkt — weder auf der Seite noch hier. Das
              betrifft Art. 13 DSGVO und ist unabhängig von allem anderen die
              billigste Verbesserung.

              Bewusst ein reiner VERWEIS, keine Einwilligungserklärung. Der
              Wortlaut einer Zustimmung („mit der Registrierung willigst du
              ein…") ist ein Rechtstext und gehört zu Nora bzw. einem Anwalt,
              nicht zu einem Bauteil. Hier steht nur, wo die Information liegt.

              In AuthShell statt in /signup, damit Login, Registrierung und
              Passwort-Zurücksetzen ihn gemeinsam tragen. */}
          <p className="mt-6 text-center text-xs text-mist-600">
            <Link href="/datenschutz" className="hover:text-mist-400 underline underline-offset-2">
              Datenschutz
            </Link>
            <span className="mx-2" aria-hidden="true">·</span>
            <Link href="/impressum" className="hover:text-mist-400 underline underline-offset-2">
              Impressum
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative">
        {/* Das Motiv ist unter lg gar nicht sichtbar. Über `media` an den <source>-
            Elementen lädt es unterhalb von 1024px deshalb GAR NICHT (Telefone –
            u.a. der QR-Landepunkt /signup – sparen die volle Bilddatei), oberhalb
            dagegen sofort (eager, kein loading="lazy", damit der Bildaufbau am
            Desktop nicht verzögert wird). Reihenfolge: AVIF → WebP → Original-JPEG. */}
        <picture>
          {modern && <source media={DESKTOP_ONLY} srcSet={modern.avif} type="image/avif" />}
          {modern && <source media={DESKTOP_ONLY} srcSet={modern.webp} type="image/webp" />}
          <source media={DESKTOP_ONLY} srcSet={image} />
          <img
            src={BLANK_PIXEL}
            alt={imageAlt}
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: imagePosition }}
          />
        </picture>
      </div>
    </div>
  );
}
