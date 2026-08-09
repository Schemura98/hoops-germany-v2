// Einheitlicher Leerzustand: Icon + Titel + Text + optionale Aktion.
export default function EmptyState({ icon: Icon, title, text, action, className = "" }) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && <Icon className="text-4xl text-gray-200 mx-auto mb-3" />}
      {title && <p className="text-gray-600 font-semibold">{title}</p>}
      {text && <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">{text}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
