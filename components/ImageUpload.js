"use client";

import { useRef, useState } from "react";
import axios from "axios";
import { FaUpload, FaSpinner } from "react-icons/fa";

// Muss zu lib/uploadFile.js (Server) passen.
const MAX_MB = 4;
const MAX_BYTES = MAX_MB * 1024 * 1024;
// Im Browser darstellbare Formate (für den Hinweistext).
const DISPLAY_FORMATS = "JPG, PNG, WEBP, GIF";
const ALLOWED_LABEL = "JPG, PNG, WEBP, GIF oder HEIC";
// Akzeptierte MIME-Typen inkl. iPhone-HEIC (wird serverseitig nach JPG konvertiert).
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);
// Manche Browser senden HEIC ohne MIME-Typ → über die Endung erkennen.
const ALLOWED_EXT = /\.(jpe?g|png|webp|gif|heic|heif)$/i;

function isAllowedFile(file) {
  return ALLOWED_MIME.has((file.type || "").toLowerCase()) || ALLOWED_EXT.test(file.name || "");
}

// MB-Anzeige mit einer Nachkommastelle.
const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1).replace(".", ",");

// Wiederverwendbarer Bild-Upload.
// props:
//   endpoint   – API-Route (multipart)
//   fields     – zusätzliche Formularfelder (z.B. { token, type })
//   onUploaded – Callback(url) nach Erfolg
//   currentUrl – aktuelle Bild-URL (Vorschau)
//   variant    – "avatar" | "banner"
//   label      – Button-Text
export default function ImageUpload({
  endpoint,
  fields = {},
  onUploaded,
  currentUrl,
  variant = "avatar",
  label = "Bild hochladen",
}) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(currentUrl || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function resetInput() {
    if (inputRef.current) inputRef.current.value = "";
  }

  async function onChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    // Vorprüfung vor dem Upload → sofortige, klare Rückmeldung (kein vergeblicher Upload).
    if (!isAllowedFile(file)) {
      setError(`Dieses Format wird nicht unterstützt. Erlaubt: ${ALLOWED_LABEL}.`);
      resetInput();
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`Die Datei ist zu groß (${mb(file.size)} MB). Maximal ${MAX_MB} MB erlaubt.`);
      resetInput();
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      for (const [k, v] of Object.entries(fields)) {
        if (v != null) fd.append(k, v);
      }
      const { data } = await axios.post(endpoint, fd);
      setPreview(data.url);
      onUploaded?.(data.url);
    } catch (err) {
      // 413 (z.B. Proxy-Limit) liefert oft kein JSON → eigene verständliche Meldung.
      const msg =
        err.response?.status === 413
          ? `Die Datei ist zu groß. Maximal ${MAX_MB} MB erlaubt.`
          : err.response?.data?.message || "Upload fehlgeschlagen. Bitte erneut versuchen.";
      setError(msg);
    } finally {
      setUploading(false);
      resetInput();
    }
  }

  // Banner: vertikal gestapelt (Vorschau oben über volle Breite, Steuerung darunter)
  // → läuft nicht aus schmalen Spalten heraus. Avatar: kompakte Zeile.
  const isBanner = variant === "banner";
  const previewBox = isBanner
    ? "h-28 w-full rounded-lg"
    : "h-16 w-16 rounded-full flex-shrink-0";

  return (
    <div
      className={`w-full min-w-0 ${
        isBanner ? "flex flex-col gap-2" : "flex items-center gap-3"
      }`}
    >
      <div
        className={`${previewBox} bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Vorschau" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-gray-400">kein Bild</span>
        )}
      </div>

      <div className="min-w-0">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif"
          onChange={onChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 border border-gray-300 hover:border-brand-500 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {uploading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
          {uploading ? "Lädt…" : label}
        </button>
        {error && <p className="mt-1 text-xs text-red-600 break-words">{error}</p>}
        <p className="mt-1 text-xs text-gray-400 break-words">
          {DISPLAY_FORMATS} · max. {MAX_MB} MB · iPhone-Fotos (HEIC) werden automatisch umgewandelt
        </p>
      </div>
    </div>
  );
}
