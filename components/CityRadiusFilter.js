"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PiMapPinBold, PiXBold } from "react-icons/pi";
import { loadCities, normalizeCity } from "@/lib/geo";

const RADII = [10, 25, 50, 100];

// Stadt-Typeahead + Umkreis-Auswahl. Meldet { center: {n,lat,lng}|null, radiusKm }.
export default function CityRadiusFilter({ value, onChange }) {
  const [list, setList] = useState([]);
  const [term, setTerm] = useState(value?.center?.n || "");
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    loadCities().then(({ list }) => setList(list));
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Wird der Filter von AUSSEN zurückgesetzt (value.center → null, z. B. über
  // den „Filter zurücksetzen"-Knopf der Listenseite), muss auch der angezeigte
  // Stadtname verschwinden – sonst steht „Passau" im Feld, während der Filter
  // nicht mehr wirkt, und der Umkreisfilter wirkt kaputt (Befund Tobias B2,
  // 23.08.2026). Während des Tippens ändert sich value.center nicht, der
  // Effekt greift also nur beim echten Reset.
  useEffect(() => {
    if (!value?.center) setTerm("");
  }, [value?.center]);

  const suggestions = useMemo(() => {
    const q = normalizeCity(term);
    if (q.length < 2 || !list.length) return [];
    const starts = [];
    const incl = [];
    for (const c of list) {
      const n = normalizeCity(c.n);
      if (n.startsWith(q)) starts.push(c);
      else if (n.includes(q)) incl.push(c);
      if (starts.length >= 8) break;
    }
    return [...starts, ...incl].slice(0, 8);
  }, [term, list]);

  const radiusKm = value?.radiusKm || 50;

  function pick(c) {
    setTerm(c.n);
    setOpen(false);
    onChange({ center: { n: c.n, lat: c.lat, lng: c.lng }, radiusKm });
  }

  function clear() {
    setTerm("");
    onChange({ center: null, radiusKm });
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2" ref={boxRef}>
      <div className="relative">
        <PiMapPinBold className="absolute left-3 top-1/2 -translate-y-1/2 text-mist-400 text-sm" />
        <input
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Stadt (Umkreis)…"
          className="w-full sm:w-56 rounded-md border border-navy-600 pl-9 pr-8 py-3 text-sm text-paper-50 outline-none focus:border-brand-400 bg-navy-800"
        />
        {value?.center && (
          <button
            onClick={clear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-mist-400 hover:text-mist-300"
            aria-label="Stadt-Filter löschen"
          >
            <PiXBold className="text-sm" />
          </button>
        )}
        {open && suggestions.length > 0 && (
          <div className="absolute z-30 mt-1 w-full sm:w-72 bg-navy-800 rounded-md border border-navy-600 max-h-64 overflow-y-auto">
            {suggestions.map((c, i) => (
              <button
                key={`${c.n}-${i}`}
                onClick={() => pick(c)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-navy-700 flex items-center justify-between"
              >
                <span className="text-paper-50">{c.n}</span>
                <span className="text-xs text-mist-400">{c.s}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <select
        value={radiusKm}
        onChange={(e) =>
          onChange({ center: value?.center || null, radiusKm: Number(e.target.value) })
        }
        disabled={!value?.center}
        className="rounded-md border border-navy-600 px-3 py-3 text-sm text-mist-300 bg-navy-800 outline-none focus:border-brand-400 disabled:opacity-50"
      >
        {RADII.map((r) => (
          <option key={r} value={r}>
            +{r} km
          </option>
        ))}
      </select>
    </div>
  );
}
