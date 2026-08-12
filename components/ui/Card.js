// Einheitliche Karte („Panel" der Richtung Anzeigetafel): navy-800-Fläche auf
// navy-950-Grund, 1px Rahmen in navy-600, kein Schatten. Tiefe entsteht durch die
// Flächenstufe, nicht durch Weichzeichnung – Schatten auf dunklem Grund sind
// ohnehin unsichtbar und kosten nur Rendering.
// padding: Tailwind-Padding-Klasse (Default p-5).
// hover: Rahmen zieht auf Brand an, Fläche hellt eine Stufe auf.
export default function Card({ className = "", padding = "p-5", hover = false, children, ...props }) {
  return (
    <div
      className={`rounded-md border border-navy-600 bg-navy-800 ${padding} ${
        hover
          ? // Kein Anheben mehr: Das war die Material-Design-Standardgeste. Auf
            // dem dunklen Panel-Grund liest sich „heller werden" wie ein
            // angehendes Licht – näher am Bild der Anzeigetafel.
            "transition-[background-color,border-color] duration-200 ease-out-strong hover:border-brand-500 hover:bg-navy-700"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
