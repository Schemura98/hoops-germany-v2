"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaMapMarkerAlt, FaTimes } from "react-icons/fa";
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
        <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Stadt (Umkreis)…"
          className="w-full sm:w-56 rounded-xl border border-gray-200 pl-9 pr-8 py-3 text-sm text-gray-900 outline-none focus:border-brand-400 bg-white shadow-sm"
        />
        {value?.center && (
          <button
            onClick={clear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            aria-label="Stadt-Filter löschen"
          >
            <FaTimes className="text-sm" />
          </button>
        )}
        {open && suggestions.length > 0 && (
          <div className="absolute z-30 mt-1 w-full sm:w-72 bg-white rounded-xl shadow-lg border border-gray-100 max-h-64 overflow-y-auto">
            {suggestions.map((c, i) => (
              <button
                key={`${c.n}-${i}`}
                onClick={() => pick(c)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
              >
                <span className="text-gray-900">{c.n}</span>
                <span className="text-xs text-gray-400">{c.s}</span>
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
        className="rounded-xl border border-gray-200 px-3 py-3 text-sm text-gray-700 bg-white shadow-sm outline-none focus:border-brand-400 disabled:opacity-50"
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
