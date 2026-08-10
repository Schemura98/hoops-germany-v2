import "./globals.css";
import { inter } from "@/lib/fonts";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import FeedbackButton from "@/components/FeedbackButton";
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
        className={`${inter.variable} font-sans antialiased bg-gray-50 text-gray-900`}
      >
        <AnalyticsTracker />
        <TestPhaseBanner />
        <PageTransition>{children}</PageTransition>
        <FeedbackButton />
        <WelcomeTour />
      </body>
    </html>
  );
}
