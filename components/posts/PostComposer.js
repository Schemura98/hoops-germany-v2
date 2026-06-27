"use client";

import { useState } from "react";
import axios from "axios";
import { FaImage, FaTimes } from "react-icons/fa";
import { getPlayerToken } from "@/lib/clientAuth";
import ImageUpload from "@/components/ImageUpload";
import Avatar from "./Avatar";

// Eingabe-Karte für neue Beiträge.
export default function PostComposer({ player, onCreated }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [showImage, setShowImage] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  // Erzwingt ein Remount des Uploaders (setzt dessen interne Vorschau zurück).
  const [uploadKey, setUploadKey] = useState(0);

  const token = getPlayerToken();

  function clearImage() {
    setImage("");
    setUploadKey((k) => k + 1);
  }

  async function submit() {
    if (!content.trim() && !image.trim()) return;
    setPosting(true);
    setError("");
    try {
      const { data } = await axios.post("/api/posts/uploadpost", {
        token,
        content,
        image,
      });
      setContent("");
      setImage("");
      setShowImage(false);
      setUploadKey((k) => k + 1);
      onCreated?.(data.post);
    } catch (err) {
      setError(err.response?.data?.message || "Beitrag konnte nicht erstellt werden.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex gap-3">
        <Avatar player={player} />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Was gibt's Neues?"
            rows={2}
            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />

          {showImage && (
            <div className="mt-3">
              <ImageUpload
                key={uploadKey}
                endpoint="/api/posts/upload-image"
                fields={{ token }}
                onUploaded={(url) => setImage(url)}
                currentUrl={image}
                variant="banner"
                label={image ? "Bild ersetzen" : "Bild hochladen"}
              />
              {image && (
                <button
                  type="button"
                  onClick={clearImage}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600"
                >
                  <FaTimes /> Bild entfernen
                </button>
              )}
            </div>
          )}

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowImage((v) => !v)}
              className={`inline-flex items-center gap-1.5 text-sm ${
                showImage ? "text-brand-600" : "text-gray-500 hover:text-brand-600"
              }`}
            >
              <FaImage /> Bild
            </button>
            <button
              onClick={submit}
              disabled={posting || (!content.trim() && !image.trim())}
              className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors"
            >
              {posting ? "Posten…" : "Posten"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
