// PWA-Manifest: macht die Website installierbar (Vollbild-App, eigenes Icon,
// Splash). Next App Router generiert daraus /manifest.webmanifest + <link rel="manifest">.
export default function manifest() {
  return {
    name: "Hoops Germany – Amateur-Basketball Community",
    short_name: "Hoops Germany",
    description:
      "Spieler, Teams, Ligen, Spiele, Tryouts und Transfers im Amateur-Basketball – an einem Ort.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    lang: "de",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
