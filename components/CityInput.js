"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PiMapPinBold } from "react-icons/pi";
import { loadCities, normalizeCity } from "@/lib/geo";

// Stadt-Eingabe mit Typeahead aus dem deutschen Städte-Datensatz.
// onChange(name): freier/gewählter Ortsname. onPick(city): vollständiges
// Objekt {n,s,lat,lng} bei Auswahl eines Vorschlags (z.B. um das Bundesland
// automatisch zu setzen). Freitext bleibt erlaubt.
export default function CityInput({ value = "", onChange, onPick, placeholder = "Stadt…", className }) {
  const [list, setList] = useState([]);
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
    const q = normalizeCity(value);
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
  }, [value, list]);

  const inputClass =
    className ||
    "w-full rounded-sm border border-navy-600 px-4 py-2.5 text-paper-50 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

  function pick(c) {
    onChange?.(c.n);
    onPick?.(c);
    setOpen(false);
  }

  return (
    <div className="relative" ref={boxRef}>
      <PiMapPinBold className="absolute left-3 top-1/2 -translate-y-1/2 text-mist-400 text-sm pointer-events-none" />
      <input
        value={value}
        onChange={(e) => {
          onChange?.(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={`${inputClass} pl-9`}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-30 mt-1 w-full bg-navy-800 rounded-md border border-navy-600 max-h-60 overflow-y-auto">
          {suggestions.map((c, i) => (
            <button
              key={`${c.n}-${i}`}
              type="button"
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
  );
}
