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
            //
            // Dazu ein Mikro-Detail (Wow-Konzept Stufe C.2): Zahlen im Panel
            // springen beim Zeigen kurz auf die Markenfarbe. Es hängt an
            // `font-mono`, also genau an den Werten, die ohnehin als Daten
            // gesetzt sind – kein zusätzliches Markup, keine Ausnahme pro Seite.
            // Einzeln bemerkt das niemand; in der Summe ist es der Unterschied
            // zwischen „ordentlich" und „aus einem Guss".
            "transition-[background-color,border-color] duration-200 ease-out-strong hover:border-brand-500 hover:bg-navy-700 [&_.font-mono]:transition-colors [&_.font-mono]:duration-200 hover:[&_.font-mono]:text-brand-400"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
