"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { PiImageBold, PiXBold, PiYoutubeLogoBold } from "react-icons/pi";
import { getPlayerToken } from "@/lib/clientAuth";
import ImageUpload from "@/components/ImageUpload";
import Avatar from "./Avatar";
import BaseAvatar from "@/components/Avatar";
import MentionTextarea from "./MentionTextarea";
import Card from "@/components/ui/Card";

// Eingabe-Karte für neue Beiträge. Team-Admins können zusätzlich „als Verein" posten.
//
// collapsible (13.08.2026): Auf Mobil startet die Karte als einzeilige
// Schaltfläche und klappt erst beim Antippen zur vollen Eingabe auf – der
// Feed rückt dadurch näher an den Seitenanfang. Die Funktionshinweise
// (@/#/YouTube/Foto) erscheinen erst bei Fokus oder vorhandenem Inhalt,
// statt dauerhaft zwei Zeilen zu belegen.
export default function PostComposer({ player, onCreated, collapsible = false }) {
  const [expanded, setExpanded] = useState(!collapsible);
  const [focused, setFocused] = useState(false);
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

  // Eingeklappt: eine Zeile, die wie ein Eingabefeld aussieht, aber erst beim
  // Antippen die volle Karte lädt (der echte Fokus landet dann per autoFocus
  // direkt im Textfeld).
  if (!expanded) {
    return (
      <Card padding="p-3">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex w-full items-center gap-3 text-left"
        >
          <Avatar player={player} />
          <span className="flex-1 rounded-sm border border-navy-600 bg-navy-700 px-4 py-2.5 text-sm text-mist-400">
            Was gibt&apos;s Neues?
          </span>
        </button>
      </Card>
    );
  }

  return (
    <div
      className="bg-navy-800 rounded-md border border-navy-600 p-4"
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      <div className="flex gap-3">
        {asTeam && team ? (
          <BaseAvatar name={team.teamName} src={team.logo} square />
        ) : (
          <Avatar player={player} />
        )}
        <div className="flex-1">
          {/* Autorenwahl (nur Team-Admins) */}
          {team && (
            <div className="mb-2 inline-flex rounded-sm bg-navy-700 p-0.5 text-sm">
              <button
                type="button"
                onClick={() => setAsTeam(false)}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  !asTeam ? "bg-navy-800 text-paper-50" : "text-mist-400"
                }`}
              >
                Als Spieler
              </button>
              <button
                type="button"
                onClick={() => setAsTeam(true)}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  asTeam ? "bg-navy-800 text-brand-400" : "text-mist-400"
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
            autoFocus={collapsible}
            className="w-full resize-none rounded-sm border border-navy-600 px-3 py-2 text-paper-50 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />

          {/* Kurzer Hinweis auf die Post-Funktionen – erst beim Schreiben,
              damit die Karte im Ruhezustand nicht zwei Zeilen höher ist. */}
          {(focused || content.trim() || showImage || image) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-mist-400">
            <span>
              <b className="font-semibold text-mist-400">@</b> erwähnt Spieler
            </span>
            <span>
              <b className="font-semibold text-mist-400">#</b> Hashtag
            </span>
            <span className="inline-flex items-center gap-1">
              <PiYoutubeLogoBold className="text-[11px]" /> Links &amp; YouTube werden als Vorschau eingebettet
            </span>
            <span className="inline-flex items-center gap-1">
              <PiImageBold className="text-[10px]" /> Foto anhängen
            </span>
          </div>
          )}

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
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-mist-400 hover:text-signal-error"
                >
                  <PiXBold /> Bild entfernen
                </button>
              )}
            </div>
          )}

          {error && <p className="mt-2 text-sm text-signal-error">{error}</p>}

          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowImage((v) => !v)}
              className={`inline-flex items-center gap-1.5 text-sm ${
                showImage ? "text-brand-400" : "text-mist-400 hover:text-brand-400"
              }`}
            >
              <PiImageBold /> Bild
            </button>
            <button
              onClick={submit}
              disabled={posting || (!content.trim() && !image.trim())}
              className="bg-brand-500 hover:bg-brand-400 disabled:opacity-60 text-navy-950 rounded-sm px-5 py-2 text-sm font-medium transition-colors"
            >
              {posting ? "Posten…" : "Posten"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
