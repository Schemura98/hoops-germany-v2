/** @type {import('tailwindcss').Config} */
// Farb- und Formsprache der visuellen Richtung „Anzeigetafel"
// (docs/VISUELLE-RICHTUNG-2026-08-12.md, Vivien, 12.08.2026).
// Alle Kontrastwerte in den Kommentaren sind gerechnet, nicht geschätzt.
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warmer Hallengrund – ersetzt slate/Navy. Tiefe entsteht über
        // Flächenstufen, nicht über Schatten oder Verläufe.
        ink: {
          950: "#120E0B", // Seitenhintergrund
          900: "#1B1512", // Navbar/Footer
          800: "#241D18", // Panel-/Kartenfläche
          700: "#2F2620", // Hover-Fläche, Eingabefelder
          600: "#4A3C31", // Rahmen und Trenner
          500: "#6B5B4C", // inaktive Icons, Platzhalter
        },
        // Text auf dunklem Grund
        paper: {
          50: "#FAF7F2", // Primärtext – 17,97:1 auf ink-950 (AAA)
          100: "#F1EAE0",
        },
        // Gedämpfter Text
        mist: {
          300: "#CFC7BC", // Labels, Zwischenüberschriften
          400: "#B9AFA3", // Fließtext sekundär – 8,89:1
          600: "#8A8074", // niedrigste Betonung – 4,96:1, NICHT für Absätze
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
          ok: "#6B9A5B", // 5,86:1 auf ink-950
          wait: "#C9A227", // 7,95:1
          error: "#E07257", // 5,04:1 auf ink-950; auf der Panel-Fläche ink-800
          // fiel der ursprüngliche Wert #D2604A auf 4,36:1 – zu wenig für die
          // Korbdifferenz-Spalte auf der Rangliste (gemessen, nicht geschätzt).
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        // Gestuft statt überall 16px: Radius ist wieder ein Hierarchie-Signal.
        sm: "6px", // Chips, Eingaben, Tabellenzellen
        md: "10px", // Standard-Panel, Buttons
        lg: "16px", // nur große Flächen (Hero-Panel, Dialog)
      },
      transitionTimingFunction: {
        "out-strong": "cubic-bezier(0.23, 1, 0.32, 1)",
      },
      keyframes: {
        "page-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "page-in": "page-in 420ms cubic-bezier(0.23, 1, 0.32, 1) both",
      },
    },
  },
  plugins: [],
};
