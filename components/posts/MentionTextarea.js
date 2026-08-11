"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import BaseAvatar from "@/components/Avatar";

// Eingabefeld mit @-Mention-Autocomplete. Tippt der Nutzer „@" + Namen, erscheint eine
// Vorschlagsliste (aus /api/player/search); die Auswahl fügt den Handle
// „@VornameNachname" ein – genau die Form, die serverseitig `resolveMentions`
// wieder auflöst (norm() entfernt Groß-/Kleinschreibung + Sonderzeichen).
//
// Props:
//  - value, onChange(nextString), placeholder, className   (wie ein Eingabefeld)
//  - multiline (default true) → <textarea rows>, sonst <input> (z.B. Kommentare)
//  - onEnter() → bei Enter OHNE offene Vorschlagsliste (nur sinnvoll für <input>-Absenden)
//  - wrapperClassName (default "relative"), rows, autoFocus

// Aktives @-Token direkt vor dem Cursor finden (nur wenn ohne Leerzeichen am Wortanfang).
function activeMention(text, caret) {
  const upto = String(text || "").slice(0, caret);
  const m = upto.match(/(?:^|\s)@([A-Za-z0-9_äöüÄÖÜß]*)$/);
  if (!m) return null;
  return { query: m[1], start: caret - m[1].length - 1, end: caret };
}

// Name → einfügbarer Handle (nur Buchstaben/Ziffern, damit die Mention-Regex greift).
function toHandle(name) {
  return String(name || "").replace(/[^\p{L}\p{N}]/gu, "");
}

export default function MentionTextarea({
  value,
  onChange,
  placeholder,
  rows = 2,
  className = "",
  multiline = true,
  onEnter,
  wrapperClassName = "relative",
  autoFocus = false,
}) {
  const fieldRef = useRef(null);
  const boxRef = useRef(null);
  const debounceRef = useRef(null);
  const caretToSet = useRef(null);

  const [active, setActive] = useState(null); // { query, start, end }
  const [results, setResults] = useState([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  // Cursor nach programmatischem Einfügen an die richtige Stelle setzen.
  useEffect(() => {
    if (caretToSet.current != null && fieldRef.current) {
      const pos = caretToSet.current;
      caretToSet.current = null;
      fieldRef.current.focus();
      fieldRef.current.setSelectionRange(pos, pos);
    }
  }, [value]);

  // Suche (debounced), sobald ein @-Token mit ≥2 Zeichen aktiv ist.
  useEffect(() => {
    if (!active || active.query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await axios.post("/api/player/search", { q: active.query });
        const list = data?.players || [];
        setResults(list);
        setIndex(0);
        setOpen(list.length > 0);
      } catch {
        setResults([]);
        setOpen(false);
      }
    }, 200);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [active?.query]);

  // Klick außerhalb schließt die Liste.
  useEffect(() => {
    function onDoc(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function syncActive(el) {
    setActive(activeMention(el.value, el.selectionStart));
  }

  function handleChange(e) {
    onChange(e.target.value);
    syncActive(e.target);
  }

  function pick(p) {
    if (!active) return;
    const insert = "@" + toHandle(p.name) + " ";
    const before = String(value).slice(0, active.start);
    const after = String(value).slice(active.end);
    const next = before + insert + after;
    caretToSet.current = (before + insert).length;
    onChange(next);
    setActive(null);
    setOpen(false);
    setResults([]);
  }

  function handleKeyDown(e) {
    if (open && results.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIndex((i) => (i + 1) % results.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setIndex((i) => (i - 1 + results.length) % results.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        pick(results[index]);
        return;
      }
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
    }
    // Enter zum Absenden (nur <input>) – nicht wenn die Vorschlagsliste offen ist.
    if (e.key === "Enter" && onEnter && !e.shiftKey && !multiline) {
      e.preventDefault();
      onEnter();
    }
  }

  const shared = {
    ref: fieldRef,
    value,
    onChange: handleChange,
    onKeyUp: (e) => syncActive(e.currentTarget),
    onClick: (e) => syncActive(e.currentTarget),
    onKeyDown: handleKeyDown,
    placeholder,
    className,
    autoFocus,
  };

  return (
    <div ref={boxRef} className={wrapperClassName}>
      {multiline ? <textarea {...shared} rows={rows} /> : <input {...shared} />}

      {open && results.length > 0 && (
        <ul className="absolute z-20 left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-md border border-navy-600 bg-navy-800 py-1">
          {results.map((p, i) => (
            <li key={p.playerId}>
              <button
                type="button"
                // onMouseDown statt onClick: feuert vor dem Blur des Feldes.
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(p);
                }}
                onMouseEnter={() => setIndex(i)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left ${
                  i === index ? "bg-brand-500/10" : "hover:bg-navy-700"
                }`}
              >
                <BaseAvatar
                  name={p.name}
                  src={p.profileImage}
                  className="h-7 w-7"
                  textClass="text-[10px]"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-paper-50">
                    {p.name}
                  </span>
                  {(p.position || p.teamName) && (
                    <span className="block truncate text-xs text-mist-400">
                      {[p.position, p.teamName].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
