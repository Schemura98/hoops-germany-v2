import "./globals.css";
import { display, sans, mono } from "@/lib/fonts";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import TestPhaseBanner from "@/components/TestPhaseBanner";
import WelcomeTour from "@/components/onboarding/WelcomeTour";
import PageTransition from "@/components/layout/PageTransition";

export const metadata = {
  title: "Hoops Germany – Amateur-Basketball Community",
  description:
    "Hoops Germany ist die Community-Plattform für Amateur-Basketball in NRW. Spieler, Teams, Ligen, Spiele, Tryouts und Transfers an einem Ort.",
  metadataBase: new URL("https://hoopsgermany.de"),
  applicationName: "Hoops Germany",
  appleWebApp: {
    capable: true,
    title: "Hoops Germany",
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body
        className={`${sans.variable} ${display.variable} ${mono.variable} font-sans antialiased bg-navy-950 text-paper-50`}
      >
        {/* ══ SPRUNGMARKE ZUM INHALT — WCAG 2.4.1 „Bypass Blocks" (A) ═════════
            Befund Tobias (17.08.2026, live gegen hoopsgermany.de, 375×812):
            Das Dokument hatte KEINEN Weg, die auf jeder Seite wiederholten
            Blöcke zu überspringen. Die erste Tab-Station war „Feedback geben"
            im Testphase-Banner, danach Logo, Feedback-Symbol, Suche, Menü —
            ein Tastaturnutzer musste sich das auf JEDER Seite neu erlaufen.

            ⚠️ WARUM `fixed` UND NICHT `sr-only` + `not-sr-only`:
            Das ist die naheliegende Tailwind-Lösung und sie ist hier eine
            Falle. `sr-only` setzt `position: absolute`, `not-sr-only` setzt
            wieder auf `position: static` zurück — und `static` bedeutet: das
            Element steht im Fluss und schiebt den Testphase-Banner nach unten.
            Genau darauf rechnen aber die Sticky-Leisten mit ihren festen
            Offsets (`Navbar.js` Z. 694 ff., `PlayerNav.js` Z. 212 ff.: die
            7rem für das Mobil-Menü enthalten die 45 px des Banners). Ob am
            Ende `static` oder das zusätzliche `fixed` gewinnt, hinge an der
            Reihenfolge in Tailwinds erzeugtem CSS — eine Wette, die man nicht
            eingehen muss. `position: fixed` beeinflusst den Fluss NIE, in
            keinem Zustand. Die Offsets bleiben damit garantiert unberührt.

            Bewusst NICHT `hidden`/`display:none`: Der Verweis soll für
            Screenreader jederzeit auffindbar bleiben, er wird nur optisch aus
            dem Bild geschoben und kommt bei Tastaturfokus herein.

            z-[100], weil beide Navigationsleisten auf `z-50` sitzen.
            Gestaltung = Primärbutton der Anzeigetafel (CLAUDE.md): orange
            Fläche mit DUNKLEM Text (navy-950 auf brand-500 = 7,1:1; weiß wäre
            2,6:1 und damit unter AA), 1px-Haarlinie, kein Verlauf, kein
            Schatten. Der Fokusring in `paper-50` statt `brand-400` — ein
            oranger Ring auf oranger Fläche wäre kaum zu sehen. */}
        <a
          href="#hauptinhalt"
          className="fixed left-3 top-3 z-[100] -translate-y-[250%] rounded-md border border-navy-950/25 bg-brand-500 px-4 py-2 font-display text-sm font-bold uppercase tracking-wide text-navy-950 transition-transform duration-150 ease-out focus-visible:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper-50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 motion-reduce:transition-none"
        >
          Zum Inhalt springen
        </a>
        <AnalyticsTracker />
        <TestPhaseBanner />
        {/* Der schwebende FeedbackButton wurde am 13.08.2026 entfernt – der
            Feedback-Zugang sitzt jetzt fest im Sticky-Chrome der drei
            Navigationsleisten (components/layout/FeedbackLink.js, dort steht
            auch das Warum). */}
        <PageTransition>{children}</PageTransition>
        <WelcomeTour />
      </body>
    </html>
  );
}
