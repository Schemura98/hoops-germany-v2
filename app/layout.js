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
