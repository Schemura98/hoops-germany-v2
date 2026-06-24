"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { FaBasketballBall } from "react-icons/fa";
import { useCurrentPlayer } from "@/lib/useCurrentPlayer";
import { getPlayerToken, setStoredPlayer } from "@/lib/clientAuth";
import { POSITIONS, BUNDESLAENDER } from "@/lib/constants";
import PlayerNav from "@/components/layout/PlayerNav";
import ImageUpload from "@/components/ImageUpload";
import CityInput from "@/components/CityInput";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

// Felder, die das Formular bearbeitet (müssen mit der API-Whitelist übereinstimmen)
const FIELDS = [
  "firstName",
  "lastName",
  "position",
  "height",
  "weight",
  "age",
  "birthdate",
  "nationality",
  "country",
  "hometown",
  "bundesland",
  "preferredLeague",
  "instagram",
  "fibaLink",
  "profileImage",
  "aboutPlayer",
];

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

export default function PlayerEditProfilePage() {
  const router = useRouter();
  const { player, status } = useCurrentPlayer();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Formular aus geladenem Profil vorbefüllen
  useEffect(() => {
    if (player && !form) {
      const initial = {};
      for (const f of FIELDS) initial[f] = player[f] ?? "";
      // Mail-Einstellung (Standard an, wenn nicht explizit abgeschaltet)
      initial.emailPendingResult = player.emailPendingResult !== false;
      setForm(initial);
    }
  }, [player, form]);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const token = getPlayerToken();
      const { data } = await axios.post("/api/player/update-profile", {
        token,
        ...form,
      });
      setStoredPlayer(data.player);
      router.push("/player/player-detail");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Speichern fehlgeschlagen. Bitte erneut versuchen."
      );
      setSaving(false);
    }
  }

  if (status === "loading" || !form) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <FaBasketballBall className="text-brand-500 text-3xl animate-bounce" />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <p className="text-gray-700">Profil konnte nicht geladen werden.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 font-medium"
        >
          Erneut versuchen
        </button>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PlayerNav player={player} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profil bearbeiten</h1>
          <Link
            href="/player/player-detail"
            className="text-sm text-gray-500 hover:text-brand-600"
          >
            Abbrechen
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5"
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="Vorname">
              <input name="firstName" value={form.firstName} onChange={onChange} className={inputClass} />
            </Field>
            <Field label="Nachname">
              <input name="lastName" value={form.lastName} onChange={onChange} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Position">
              <select name="position" value={form.position} onChange={onChange} className={inputClass}>
                <option value="">– wählen –</option>
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Alter">
              <input type="number" min="0" name="age" value={form.age} onChange={onChange} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Größe">
              <input name="height" value={form.height} onChange={onChange} className={inputClass} placeholder="z.B. 1,92 m" />
            </Field>
            <Field label="Gewicht">
              <input name="weight" value={form.weight} onChange={onChange} className={inputClass} placeholder="z.B. 85 kg" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Geburtsdatum">
              <input name="birthdate" value={form.birthdate} onChange={onChange} className={inputClass} placeholder="TT.MM.JJJJ" />
            </Field>
            <Field label="Nationalität">
              <input name="nationality" value={form.nationality} onChange={onChange} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Land">
              <input name="country" value={form.country} onChange={onChange} className={inputClass} />
            </Field>
            <Field label="Heimatstadt">
              <CityInput
                value={form.hometown}
                onChange={(v) => setForm((f) => ({ ...f, hometown: v }))}
                onPick={(c) =>
                  setForm((f) => ({ ...f, hometown: c.n, bundesland: c.s || f.bundesland }))
                }
                placeholder="Stadt eingeben…"
              />
            </Field>
          </div>

          <Field label="Bundesland">
            <select name="bundesland" value={form.bundesland} onChange={onChange} className={inputClass}>
              <option value="">– wählen –</option>
              {BUNDESLAENDER.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Bevorzugte Liga">
            <input name="preferredLeague" value={form.preferredLeague} onChange={onChange} className={inputClass} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Instagram">
              <input name="instagram" value={form.instagram} onChange={onChange} className={inputClass} placeholder="@username" />
            </Field>
            <Field label="FIBA-Link">
              <input name="fibaLink" value={form.fibaLink} onChange={onChange} className={inputClass} placeholder="https://…" />
            </Field>
          </div>

          <Field label="Profilbild">
            <ImageUpload
              endpoint="/api/upload/player-image"
              fields={{ token: getPlayerToken() }}
              currentUrl={form.profileImage}
              onUploaded={(url) => setForm((f) => ({ ...f, profileImage: url }))}
              label="Profilbild hochladen"
            />
            <input
              name="profileImage"
              value={form.profileImage}
              onChange={onChange}
              className={`${inputClass} mt-2`}
              placeholder="…oder Bild-URL einfügen"
            />
          </Field>

          <Field label="Über mich">
            <textarea
              name="aboutPlayer"
              value={form.aboutPlayer}
              onChange={onChange}
              rows={4}
              className={`${inputClass} resize-none`}
              placeholder="Erzähl etwas über deinen Spielstil, deine Erfahrung…"
            />
          </Field>

          {player.isTeamAdmin && (
            <div className="border-t border-gray-100 pt-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.emailPendingResult}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, emailPendingResult: e.target.checked }))
                  }
                  className="mt-0.5 h-4 w-4 accent-brand-500"
                />
                <span>
                  <span className="block text-sm font-medium text-gray-800">
                    E-Mail-Erinnerung bei ausstehenden Ergebnissen
                  </span>
                  <span className="block text-xs text-gray-500">
                    Als Team-Admin bekommst du eine Mail, wenn nach einem Spiel noch das
                    Ergebnis fehlt. Die Glocken-Benachrichtigung bleibt unabhängig davon.
                  </span>
                </span>
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/player/player-detail"
              className="border border-gray-300 hover:border-brand-500 text-gray-700 rounded-lg px-4 py-2.5 font-medium"
            >
              Abbrechen
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-6 py-2.5 font-medium transition-colors"
            >
              {saving ? "Speichern…" : "Speichern"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
