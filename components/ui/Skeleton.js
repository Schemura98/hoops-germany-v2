// Einheitliche Skeleton-Loader (Platzhalter beim Laden).
export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse motion-reduce:animate-none rounded bg-gray-200/70 ${className}`}
    />
  );
}

// Karten-Skeleton (für Listen/Grids), grob im Look der echten Karten.
export function SkeletonCard({ className = "" }) {
  return (
    <div className={`rounded-2xl border border-gray-100 bg-white p-5 ${className}`}>
      <Skeleton className="h-4 w-1/3 mb-3" />
      <Skeleton className="h-3 w-2/3 mb-2" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

// Liste von Zeilen-Skeletons.
export function SkeletonList({ rows = 5, className = "" }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-3.5 w-1/3 mb-2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
