"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FaImage, FaTimes, FaYoutube } from "react-icons/fa";
import { getPlayerToken } from "@/lib/clientAuth";
import ImageUpload from "@/components/ImageUpload";
import Avatar from "./Avatar";
import BaseAvatar from "@/components/Avatar";
import MentionTextarea from "./MentionTextarea";

// Eingabe-Karte für neue Beiträge. Team-Admins können zusätzlich „als Verein" posten.
export default function PostComposer({ player, onCreated }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [showImage, setShowImage] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  // Erzwingt ein Remount des Uploaders (setzt dessen interne Vorschau zurück).
  const [uploadKey, setUploadKey] = useState(0);
  // Vereins-Modus: geladenes Team (nur bei Team-Admins) + aktive Autorenwahl.
  const [team, setTeam] = useState(null);
  const [asTeam, setAsTeam] = useState(false);

  const token = getPlayerToken();

  // Verwaltetes Team laden (für den „als Verein"-Umschalter).
  useEffect(() => {
    if (!player?.isTeamAdmin) return;
    let active = true;
    (async () => {
      try {
        const { data } = await axios.post("/api/team/fetchinfo", { token });
        if (active && data?.team) setTeam(data.team);
      } catch {
        /* kein Team-Modus */
      }
    })();
    return () => {
      active = false;
    };
  }, [player?.isTeamAdmin, token]);

  function clearImage() {
    setImage("");
    setUploadKey((k) => k + 1);
  }

  async function submit() {
    if (!content.trim() && !image.trim()) return;
    setPosting(true);
    setError("");
    try {
      const endpoint = asTeam ? "/api/posts/team-post" : "/api/posts/uploadpost";
      const { data } = await axios.post(endpoint, { token, content, image });
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
        {asTeam && team ? (
          <BaseAvatar name={team.teamName} src={team.logo} square />
        ) : (
          <Avatar player={player} />
        )}
        <div className="flex-1">
          {/* Autorenwahl (nur Team-Admins) */}
          {team && (
            <div className="mb-2 inline-flex rounded-lg bg-gray-100 p-0.5 text-sm">
              <button
                type="button"
                onClick={() => setAsTeam(false)}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  !asTeam ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                }`}
              >
                Als Spieler
              </button>
              <button
                type="button"
                onClick={() => setAsTeam(true)}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  asTeam ? "bg-white text-brand-600 shadow-sm" : "text-gray-500"
                }`}
              >
                Als {team.teamName}
              </button>
            </div>
          )}

          <MentionTextarea
            value={content}
            onChange={setContent}
            placeholder={
              asTeam ? "Neuigkeit vom Verein teilen…" : "Was gibt's Neues? Tippe @ für Erwähnungen"
            }
            rows={2}
            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />

          {/* Kurzer Hinweis auf die Post-Funktionen (dezent, immer sichtbar). */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
            <span>
              <b className="font-semibold text-gray-500">@</b> erwähnt Spieler
            </span>
            <span>
              <b className="font-semibold text-gray-500">#</b> Hashtag
            </span>
            <span className="inline-flex items-center gap-1">
              <FaYoutube className="text-[11px]" /> Links &amp; YouTube werden als Vorschau eingebettet
            </span>
            <span className="inline-flex items-center gap-1">
              <FaImage className="text-[10px]" /> Foto anhängen
            </span>
          </div>

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
