"use client";

import { useState } from "react";
import axios from "axios";
import { FaImage } from "react-icons/fa";
import { getPlayerToken } from "@/lib/clientAuth";
import Avatar from "./Avatar";

// Eingabe-Karte für neue Beiträge.
export default function PostComposer({ player, onCreated }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [showImage, setShowImage] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!content.trim() && !image.trim()) return;
    setPosting(true);
    setError("");
    try {
      const token = getPlayerToken();
      const { data } = await axios.post("/api/posts/uploadpost", {
        token,
        content,
        image,
      });
      setContent("");
      setImage("");
      setShowImage(false);
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
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Bild-URL (https://…)"
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
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
