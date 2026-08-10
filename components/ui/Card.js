// Einheitliche Karte: weiße Fläche, rounded-2xl, dezenter Rahmen + Schatten.
// padding: Tailwind-Padding-Klasse (Default p-5). hover: dezenter Hover-Effekt
// (Schatten/Rahmen + leichtes Anheben, gleiche Kurve wie Teams/Ligen/Spiele-Karten).
export default function Card({ className = "", padding = "p-5", hover = false, children, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-white shadow-sm ${padding} ${
        hover
          ? "transition-all duration-200 ease-out-strong hover:shadow-md hover:border-brand-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
