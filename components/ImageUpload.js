"use client";

import { useRef, useState } from "react";
import axios from "axios";
import { FaUpload, FaSpinner } from "react-icons/fa";

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

  async function onChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
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
      setError(err.response?.data?.message || "Upload fehlgeschlagen.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const previewBox =
    variant === "banner"
      ? "h-24 w-full rounded-lg"
      : "h-16 w-16 rounded-full";

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${previewBox} bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Vorschau" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-gray-400">kein Bild</span>
        )}
      </div>

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
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
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        <p className="mt-1 text-xs text-gray-400">JPG, PNG, WEBP, GIF · max. 4 MB</p>
      </div>
    </div>
  );
}
