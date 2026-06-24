import "./globals.css";
import { inter } from "@/lib/fonts";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import FeedbackButton from "@/components/FeedbackButton";

export const metadata = {
  title: "Hoops Germany – Amateur-Basketball Community",
  description:
    "Hoops Germany ist die Community-Plattform für Amateur-Basketball in Deutschland. Spieler, Teams, Ligen, Spiele, Tryouts und Transfers an einem Ort.",
  metadataBase: new URL("https://hoopsgermany.de"),
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-50 text-gray-900`}
      >
        <AnalyticsTracker />
        {children}
        <FeedbackButton />
      </body>
    </html>
  );
}
