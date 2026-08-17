"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import Button from "@/components/ui/Button";
import FormAlert from "@/components/ui/FormAlert";
import Loading from "@/components/ui/Loading";
import { inputClass } from "@/lib/ui";
import { useCurrentPlayer } from "@/lib/useCurrentPlayer";
import { getPlayerToken, setStoredPlayer, clearPlayerToken, clearTeamToken } from "@/lib/clientAuth";
import { POSITIONS, PLAYER_ROLES, BUNDESLAENDER, LEAGUE_LEVELS, positionLabel } from "@/lib/constants";
import { ageFromBirthdate, toDateInputValue } from "@/lib/age";
import PlayerNav from "@/components/layout/PlayerNav";
import Footer from "@/components/layout/Footer";
import ImageUpload from "@/components/ImageUpload";
import CityInput from "@/components/CityInput";

// Felder, die das Formular bearbeitet (müssen mit der API-Whitelist übereinstimmen)
const FIELDS = [
  "firstName",
  "lastName",
  "position",
  "number",
  "height",
  "weight",
  "birthdate",
  "nationality",
  "hometown",
  "bundesland",
  "preferredLeague",
  "instagram",
  "fibaLink",
  "profileImage",
  "aboutPlayer",
];

// required markiert Pflichtfelder mit „*" – alle übrigen Felder sind optional
// (Legende steht über dem Formular).
function Field({ label, required = false, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-mist-300 mb-1">
        {label}
        {required && (
          <span className="text-brand-400" aria-hidden="true">
            {" *"}
          </span>
        )}
      </label>
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
  // Die Fehlermeldung steht ganz oben, der Speichern-Knopf am Ende eines
  // langen Formulars. Ohne diesen Anker passiert beim Ablehnen im Sichtfeld
  // des Nutzers NICHTS – der Knopf zuckt kurz, mehr nicht (Fund von Tobias).
  // Die Mindestalter-Regel macht genau diesen Fall zum ersten Mal wahrscheinlich.
  const fehlerRef = useRef(null);


  // Konto löschen (Self-Service)
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function deleteAccount() {
    setDeleting(true);
    setDeleteError("");
    try {
      await axios.post("/api/player/delete-account", { token: getPlayerToken() });
      clearPlayerToken();
      clearTeamToken();
      if (typeof window !== "undefined") window.localStorage.removeItem("player");
      router.replace("/?deleted=1");
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Löschen fehlgeschlagen.");
      setDeleting(false);
    }
  }

  // Formular aus geladenem Profil vorbefüllen
  useEffect(() => {
    if (player && !form) {
      const initial = {};
      for (const f of FIELDS) initial[f] = player[f] ?? "";
      // Alte Positions-Kürzel (PG…) → ausgeschrieben, damit das Dropdown vorausgewählt
      // ist und beim Speichern der kanonische Wert landet.
      initial.position = positionLabel(player.position);
      // Geburtsdatum für <input type="date"> normalisieren (akzeptiert auch Altdaten)
      initial.birthdate = toDateInputValue(player.birthdate);
      // Mail-Einstellung (Standard an, wenn nicht explizit abgeschaltet)
      initial.emailPendingResult = player.emailPendingResult !== false;
      setForm(initial);
    }
  }, [player, form]);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Zur Meldung springen, sobald sie WIRKLICH im Dokument steht. Im catch
  // direkt nach setError() aufgerufen lief der Sprung ins Leere: React hatte
  // die Meldung zu dem Zeitpunkt noch nicht gerendert, und die Seite blieb am
  // Formularende stehen (nachgemessen: Meldung 944 px oberhalb des Sichtfelds).
  useEffect(() => {
    if (!error) return;
    // Bewusst OHNE `behavior: "smooth"`. Das Einblenden des Meldungskastens
    // verschiebt das Layout um rund 60 px, und die weiche Bewegung wurde davon
    // überfahren – nachgemessen blieb die Seite am Formularende stehen, die
    // Meldung 944 px darüber. Ein Sprung ohne Animation ist hier ohnehin
    // richtig: Die Ablehnung soll sofort sichtbar sein, nicht in einer halben
    // Sekunde, und `prefers-reduced-motion` ist damit gleich miterledigt.
    fehlerRef.current?.scrollIntoView({ block: "center" });
  }, [error]);

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
      <main id="hauptinhalt" tabIndex={-1} className="min-h-screen flex items-center justify-center">
        <Loading />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main id="hauptinhalt" tabIndex={-1} className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <p className="text-mist-300">Profil konnte nicht geladen werden.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Erneut versuchen
        </Button>
      </main>
    );
  }

  const computedAge = ageFromBirthdate(form.birthdate);

  return (
    <div className="min-h-screen bg-navy-950">
      <PlayerNav player={player} />

      <main id="hauptinhalt" tabIndex={-1} className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display uppercase tracking-tight text-2xl font-black text-paper-50">Profil bearbeiten</h1>
          <Link
            href="/player/player-detail"
            className="text-sm text-mist-400 hover:text-brand-400"
          >
            Abbrechen
          </Link>
        </div>

        {/* FormAlert statt eigenem Kasten: Es traegt role="alert" und
            aria-live, die Vorlesesoftware meldet die Ablehnung also von
            selbst. Der Anker daneben ist fuer die Augen da (siehe onSubmit). */}
        <div ref={fehlerRef} aria-hidden="true" className="scroll-mt-24" />
        {error && <FormAlert className="mb-4">{error}</FormAlert>}

        <form
          onSubmit={onSubmit}
          className="bg-navy-800 rounded-md border border-navy-600 p-6 space-y-5"
        >
          <p className="text-xs text-mist-400">
            Mit <span className="text-brand-400">*</span> markierte Felder sind Pflichtfelder – alle
            anderen Angaben sind freiwillig.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Vorname" required>
              <input
                name="firstName"
                required
                value={form.firstName}
                onChange={onChange}
                className={inputClass}
              />
            </Field>
            <Field label="Nachname" required>
              <input
                name="lastName"
                required
                value={form.lastName}
                onChange={onChange}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Position / Rolle">
              <select name="position" value={form.position} onChange={onChange} className={inputClass}>
                <option value="">– wählen –</option>
                <optgroup label="Spielposition">
                  {POSITIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Funktion">
                  {PLAYER_ROLES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </optgroup>
              </select>
            </Field>
            <Field label="Geburtsdatum">
              <input
                type="date"
                name="birthdate"
                value={form.birthdate}
                onChange={onChange}
                max={new Date().toISOString().slice(0, 10)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-mist-400">
                {computedAge != null
                  ? `Alter: ${computedAge} Jahre (wird automatisch aktualisiert)`
                  : "Dein Alter wird daraus berechnet."}
              </p>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Größe">
              <input name="height" value={form.height} onChange={onChange} className={inputClass} placeholder="z.B. 1,92 m" />
            </Field>
            <Field label="Gewicht">
              <input name="weight" value={form.weight} onChange={onChange} className={inputClass} placeholder="z.B. 85 kg" />
            </Field>
            <Field label="Rückennummer">
              <input name="number" value={form.number} onChange={onChange} className={inputClass} placeholder="z.B. 7" maxLength={3} />
            </Field>
          </div>

          <Field label="Nationalität">
            <input name="nationality" value={form.nationality} onChange={onChange} className={inputClass} placeholder="z.B. Deutschland" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
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
          </div>

          <Field label="Bevorzugte Spielklasse">
            <select name="preferredLeague" value={form.preferredLeague} onChange={onChange} className={inputClass}>
              <option value="">– keine Angabe –</option>
              {LEAGUE_LEVELS.map((lv) => (
                <option key={lv} value={lv}>
                  {lv}
                </option>
              ))}
            </select>
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
            <div className="border-t border-navy-600 pt-4">
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
                  <span className="block text-sm font-medium text-paper-50">
                    E-Mail-Erinnerung bei ausstehenden Ergebnissen
                  </span>
                  <span className="block text-xs text-mist-400">
                    Als Team-Admin bekommst du eine Mail, wenn nach einem Spiel noch das
                    Ergebnis fehlt. Die Glocken-Benachrichtigung bleibt unabhängig davon.
                  </span>
                </span>
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button href="/player/player-detail" variant="secondary">
              Abbrechen
            </Button>
            <Button type="submit" disabled={saving} size="lg">
              {saving ? "Speichern…" : "Speichern"}
            </Button>
          </div>
        </form>

        {/* Gefahrenzone: Konto löschen */}
        <div className="mt-8 bg-navy-800 rounded-md border border-signal-error/50 p-6">
          <h2 className="text-base font-bold text-signal-error">Konto löschen</h2>
          <p className="text-sm text-mist-400 mt-1">
            Dein Profil, deine Beiträge und Verknüpfungen werden dauerhaft entfernt. Das kann nicht
            rückgängig gemacht werden.
          </p>
          {!showDelete ? (
            <Button
              variant="dangerGhost"
              className="mt-4"
              onClick={() => {
                setShowDelete(true);
                setDeleteError("");
              }}
            >
              Konto löschen…
            </Button>
          ) : (
            <div className="mt-4 rounded-md bg-signal-error/10 border border-signal-error/50 p-4">
              <p className="text-sm font-medium text-paper-50">
                Bist du sicher? Diese Aktion ist endgültig.
              </p>
              {deleteError && <p className="mt-2 text-sm text-signal-error">{deleteError}</p>}
              <div className="mt-3 flex flex-wrap gap-3">
                <Button variant="danger" size="lg" onClick={deleteAccount} disabled={deleting}>
                  {deleting ? "Wird gelöscht…" : "Ja, Konto endgültig löschen"}
                </Button>
                <Button variant="secondary" onClick={() => setShowDelete(false)} disabled={deleting}>
                  Abbrechen
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
