// Einheitliche Karte: weiße Fläche, rounded-2xl, dezenter Rahmen + Schatten.
// padding: Tailwind-Padding-Klasse (Default p-5). hover: dezenter Hover-Effekt.
export default function Card({ className = "", padding = "p-5", hover = false, children, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-white shadow-sm ${padding} ${
        hover ? "transition-all duration-200 hover:shadow-md hover:border-brand-200" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
