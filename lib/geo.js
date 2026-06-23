"use client";

// Geo-Helfer für die Umkreis-Suche (Stufe 2). Lädt den mitgelieferten
// deutschen Städte-Datensatz (public/data/de-cities.json) einmalig und cacht ihn.

let _cachePromise = null;

// Normalisiert Ortsnamen für robustes Matching (Umlaute, Bindestriche, Whitespace).
export function normalizeCity(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Lädt die Städte einmalig: { list: [{n,s,lat,lng}], map: Map<normName, city> }
export function loadCities() {
  if (_cachePromise) return _cachePromise;
  _cachePromise = fetch("/data/de-cities.json")
    .then((r) => r.json())
    .then((list) => {
      const map = new Map();
      for (const c of list) {
        const k = normalizeCity(c.n);
        if (!map.has(k)) map.set(k, c);
      }
      return { list, map };
    })
    .catch(() => ({ list: [], map: new Map() }));
  return _cachePromise;
}

// Koordinaten eines Ortsnamens aus der Map (oder null).
export function cityCoords(map, name) {
  if (!map || !name) return null;
  return map.get(normalizeCity(name)) || null;
}

// Entfernung zwischen zwei Punkten in km (Haversine).
export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
