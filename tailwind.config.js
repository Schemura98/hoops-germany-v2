/** @type {import('tailwindcss').Config} */
// Farb- und Formsprache der visuellen Richtung „Anzeigetafel"
// (docs/VISUELLE-RICHTUNG-2026-08-12.md, Vivien, 12.08.2026).
// Alle Kontrastwerte in den Kommentaren sind gerechnet, nicht geschätzt.
module.exports = {
  // ⚠️ `lib/` GEHOERT HIER HINEIN, UND ZWAR SEIT DEM ANFANG (Roadmap 36,
  // Befund Kai am 22.08.2026, am ausgelieferten Live-Stylesheet belegt).
  //
  // Tailwind erzeugt eine Regel nur fuer Klassennamen, die es in den hier
  // gelisteten Dateien FINDET. `lib/ui.js` ist aber die zentrale Quelle fuer
  // `inputClass`/`inputClassSm` und speist rund 143 Formularfelder — und stand
  // nicht in dieser Liste. Eine Klasse, die AUSSCHLIESSLICH dort steht, erzeugt
  // deshalb **kein CSS**. Sie steht im Markup, sieht richtig aus, und tut nichts.
  //
  // Belegt am 22.08.2026: `placeholder:text-navy-500` stand nur in `lib/ui.js`
  // und kam im ausgelieferten Stylesheet **gar nicht vor** — die 143 Felder
  // trugen die Browser-Vorgabe `#9CA3AF`. Die Nachfolgefarbe `mist-400` wirkt
  // heute nur, weil sieben Dateien unter `components/`/`app/` dieselbe Klasse
  // zufaellig noch einmal woertlich hinschreiben. Wer diese sieben Stellen auf
  // `inputClass` konsolidiert — also genau die Aufraeumarbeit macht, die
  // CLAUDE.md fuer die handgebauten Panels fordert —, nimmt der Plattform die
  // Platzhalterfarbe, **und nichts sieht kaputt aus**.
  //
  // ⚠️ Wer diese Zeile wieder entfernt, baut genau diese stille Falle zurueck.
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,mjs}",
  ],
  theme: {
    extend: {
      // Eigener Umschaltpunkt NUR fuer die waagerechte Navigationsleiste
      // (Vivien, 20.08.2026). Er ist gerechnet, nicht gegriffen:
      //
      // Die Leiste sitzt in `max-w-6xl` (1152px) mit `px-6` (2x24). Mehr als
      // 1104px Inhaltsbreite gibt es also auf KEINEM Bildschirm — auch nicht
      // auf einem 1600er. Das Budget ist eine Konstante, keine Funktion der
      // Fensterbreite; das ist der Satz, an dem dieser Befund haengt.
      //
      // Angemeldet braucht die Leiste nach der Diaet im ungünstigsten Fall
      // 1075,7px (gemessen: Seite /transfermarkt, wo der laengste Punkt aktiv
      // und damit `font-semibold` ist, UND mit blockierter Webschrift, wo die
      // Ersatz-Metriken 12,3px zusetzen). Sie passt damit ab einer
      // Fensterbreite von 1123,7px.
      //
      // 1152 ist der naechste Wert mit Bedeutung im System — es ist die
      // Hoechstbreite des Containers selbst. Verbleibende Luft: 40,6px mit
      // eigener Schrift, 28,3px mit Ersatzschrift.
      //
      // ⚠️ Wer hier eine Zahl aendert, aendert eine MESSUNG — nachrechnen,
      // nicht schaetzen: Inhaltsbreite der Leiste gegen (Containerbreite
      // minus Polsterung), angemeldet, mit Team-Admin-Konto, auf der Seite
      // mit dem laengsten aktiven Punkt (/transfermarkt).
      // ✅ Bewacht seit dem 20.08.2026 durch
      // `tests/e2e/navigationsleiste-breite.spec.mjs`. Die Datei haelt vier
      // Aussagen ueber genau diese Zahl:
      //   1) Angemeldet passt die Leiste auf 1024–1600px in ihre eigene Reihe
      //      (gemessen wird `scrollWidth` gegen `clientWidth` — das Dokument
      //      allein genuegt nicht, weil `overflow-x-hidden` den Ueberhang
      //      abklemmt statt ihn zu zeigen).
      //   2) Die Wortmarke wird nirgends gestaucht.
      //   3) Der Umschaltpunkt ist scharf: bei 1151 Klappmenue, bei 1152
      //      Zeile — und nie beides oder keins von beidem.
      //   4) Waehrend der Anmeldezustand noch unbekannt ist, verschwindet
      //      kein Punkt wieder, der schon sichtbar war (Blitzer-Waechter).
      // ⚠️ Bis zum 20.08.2026 stand hier „NOCH NICHT GEBAUT … bis er steht,
      // haelt diese Zahl nichts ausser diesem Kommentar". Der Waechter lag da
      // bereits im SELBEN Commit. Wer eine Zahl aendert, aendert weiterhin
      // eine MESSUNG — aber sie faellt jetzt auf, statt still zu bleiben.
      screens: {
        leiste: "1152px",
      },
      colors: {
        // Nachtblauer Hallengrund. Entscheidung Patrick (12.08.2026): Navy +
        // Orange ist die Basketball-Paarung – Ball auf Nachtblau, Hallenlicht,
        // Anzeigetafel. Ersetzt Viviens ursprünglich warmen Braun-Grund; die
        // Stufung bleibt exakt gleich, damit keine Klasse ihre Bedeutung ändert.
        // Tiefe entsteht weiterhin über Flächenstufen, nicht über Schatten.
        // Werte von Vivien gerechnet (docs/WOW-KONZEPT-2026-08-12.md), nicht
        // geschätzt. Bewusst ohne Cyan-/Violett-Stich, sonst kippt es in die
        // verworfene Neon-/E-Sport-Ecke.
        navy: {
          950: "#0B1220", // Seitenhintergrund – paper-50 darauf: 17,45:1
          900: "#111A2E", // Navbar/Footer – 16,16:1
          800: "#182543", // Panel-/Kartenfläche – mist-400 darauf: 7,27:1
          700: "#223058", // Hover-Fläche, Eingabefelder
          // Die Haarlinie ist bewusst kräftiger als im braunen Entwurf
          // (1,92:1 zu navy-800 statt 1,57:1): Blau auf Blau ist schwerer
          // auseinanderzuhalten als Braun auf Braun.
          600: "#3D5080", // Rahmen und Trenner
          500: "#56699B", // inaktive Icons, Platzhalter
        },
        // Text auf dunklem Grund – leicht kühl, damit das Orange der einzige
        // warme Ton auf der Seite bleibt.
        paper: {
          50: "#F5F7FA", // Primärtext
          100: "#E6EAF2",
        },
        // Gedämpfter Text, blaustichig statt bräunlich
        mist: {
          300: "#C5CEDE", // Labels, Zwischenüberschriften
          400: "#A9B4C9", // Fließtext sekundär – 8,97:1 auf navy-950
          600: "#78839C", // niedrigste Betonung – 4,93:1, NICHT für Absätze
        },
        // Verankert auf dem echten Logo-Orange (#F07A27 aus logo.svg),
        // nicht auf dem bisherigen orange-500.
        brand: {
          50: "#FFF4E9",
          100: "#FFE3C6",
          200: "#FFC58C",
          300: "#FCA25A",
          400: "#F68C3E",
          500: "#F07A27", // Logo-Wert
          600: "#D9600F",
          700: "#B04D0D", // 5,02:1 zu paper-50 – für Weiß-auf-Orange
          800: "#7E3509",
          900: "#4F2107",
        },
        // Semantisch, bewusst entsättigt – Status ist keine Marke.
        signal: {
          ok: "#6B9A5B", // 5,86:1 auf navy-950
          wait: "#C9A227", // 7,95:1
          error: "#E07257", // 5,04:1 auf navy-950; auf der Panel-Fläche navy-800
          // fiel der ursprüngliche Wert #D2604A auf 4,36:1 – zu wenig für die
          // Korbdifferenz-Spalte auf der Rangliste (gemessen, nicht geschätzt).
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        // Segment-Ziffern der Anzeigetafel – NUR ueber SegmentZahl in Tafel-Fenstern.
        segment: ["var(--font-segment)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        // Gestuft statt überall 16px: Radius ist wieder ein Hierarchie-Signal.
        // Entscheidung Patrick 23.08.2026 („weg vom abgerundeten
        // KI-Standard-Kachel-Design, die Linien-Sprache des Hero-Spielfelds
        // überall"): die Leiter wird scharf – 2/4/6 statt 6/10/16. Die Stufung
        // bleibt (Hierarchie-Signal), die Kante liest sich als technische
        // Zeichnung statt als Kachel. rounded-full (Avatare, Lampen,
        // Schalter) bleibt bewusst rund – ein Kreis ist eine Form, keine
        // Weichzeichnung. Überschreibt die Radien-Zeile der Spezifikation
        // vom 12.08. (Eigentümer-Entscheidung).
        sm: "2px", // Chips, Eingaben, Tabellenzellen
        md: "4px", // Standard-Panel, Buttons
        lg: "6px", // nur große Flächen (Hero-Panel, Dialog)
      },
      transitionTimingFunction: {
        "out-strong": "cubic-bezier(0.23, 1, 0.32, 1)",
      },
      keyframes: {
        "page-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Splitflap: Die Klappe fällt von oben, schießt einen Hauch über die
        // Waagerechte hinaus und pendelt sich ein – die mechanische Anzeigetafel
        // stoppt auch nicht sanft, sie schlägt an.
        flap: {
          "0%": { opacity: "0", transform: "rotateX(-92deg)" },
          "55%": { opacity: "1", transform: "rotateX(12deg)" },
          "78%": { transform: "rotateX(-5deg)" },
          "100%": { opacity: "1", transform: "rotateX(0deg)" },
        },
      },
      animation: {
        "page-in": "page-in 420ms cubic-bezier(0.23, 1, 0.32, 1) both",
        flap: "flap 620ms cubic-bezier(0.34, 1.4, 0.64, 1) both",
      },
    },
  },
  plugins: [],
};
