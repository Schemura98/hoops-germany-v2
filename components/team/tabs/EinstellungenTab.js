"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaCopy, FaCheck, FaLink, FaTrophy } from "react-icons/fa";
import { getTeamAuthToken } from "@/lib/useCurrentTeam";
import {
  BUNDESLAENDER,
  LEAGUE_LEVELS,
  LEAGUE_GENDERS,
  LEAGUE_AGE_GROUPS,
} from "@/lib/constants";
import ImageUpload from "@/components/ImageUpload";
import CityInput from "@/components/CityInput";
import LeagueReportLink from "@/components/team/LeagueReportLink";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export default function EinstellungenTab({ team, reload }) {
  const [form, setForm] = useState({
    teamName: team?.teamName || "",
    region: team?.region || "",
    bundesland: team?.bundesland || "",
    about: team?.about || "",
    logo: team?.logo || "",
    banner: team?.banner || "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null); // { type: "ok"|"err", text }

  // Liga-Auswahl/-Wechsel
  const [leagues, setLeagues] = useState([]);
  const [leagueId, setLeagueId] = useState(team?.leagueId ? String(team.leagueId) : "");
  const [leagueFilter, setLeagueFilter] = useState({ level: "", gender: "", ageGroup: "" });
  const [leagueSaving, setLeagueSaving] = useState(false);
  const [leagueMsg, setLeagueMsg] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await axios.get("/api/leagues");
        if (active) setLeagues(data.leagues || []);
      } catch {
        /* Ligen optional */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Optionen: nach Bundesland des Teams + Filtern; aktuelle Liga immer enthalten.
  const leagueOptions = useMemo(() => {
    const cur = leagues.find((l) => String(l._id) === leagueId);
    const list = leagues.filter((l) => {
      if (form.bundesland && l.bundesland && l.bundesland !== form.bundesland) return false;
      if (leagueFilter.level && l.level !== leagueFilter.level) return false;
      if (leagueFilter.gender && l.gender !== leagueFilter.gender) return false;
      if (leagueFilter.ageGroup && l.ageGroup !== leagueFilter.ageGroup) return false;
      return true;
    });
    if (cur && !list.some((l) => String(l._id) === leagueId)) list.unshift(cur);
    return list;
  }, [leagues, leagueId, form.bundesland, leagueFilter]);

  const leagueLabel = (l) =>
    [l.name, l.gender, l.ageGroup !== "Senioren" ? l.ageGroup : null, l.season]
      .filter(Boolean)
      .join(" · ");

  async function onSaveLeague() {
    setLeagueMsg(null);
    setLeagueSaving(true);
    try {
      const token = getTeamAuthToken();
      await axios.post("/api/team/set-league", { token, leagueId });
      setLeagueMsg({ type: "ok", text: "Liga gespeichert." });
      reload?.();
    } catch (err) {
      setLeagueMsg({
        type: "err",
        text: err.response?.data?.message || "Liga konnte nicht gespeichert werden.",
      });
    } finally {
      setLeagueSaving(false);
    }
  }

  // Einladungslink
  const [inviteToken, setInviteToken] = useState(team?.inviteToken || "");
  const [origin, setOrigin] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSave(e) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    try {
      const token = getTeamAuthToken();
      await axios.post("/api/team/update-team", { token, ...form });
      setMsg({ type: "ok", text: "Änderungen gespeichert." });
      reload?.();
    } catch (err) {
      setMsg({
        type: "err",
        text: err.response?.data?.message || "Speichern fehlgeschlagen.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function onGenerate() {
    setGenerating(true);
    setMsg(null);
    try {
      const token = getTeamAuthToken();
      const { data } = await axios.post("/api/team/generate-invite", { token });
      setInviteToken(data.inviteToken);
      setCopied(false);
    } catch (err) {
      setMsg({
        type: "err",
        text: err.response?.data?.message || "Link konnte nicht erstellt werden.",
      });
    } finally {
      setGenerating(false);
    }
  }

  const inviteLink = inviteToken ? `${origin}/team/join/${inviteToken}` : "";

  async function copyLink() {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard nicht verfügbar – Nutzer kann manuell kopieren */
    }
  }

  return (
    <div className="space-y-6">
      {msg && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            msg.type === "ok"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Stammdaten */}
      <form
        onSubmit={onSave}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5"
      >
        <h2 className="text-lg font-semibold text-gray-900">Team-Daten</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Teamname">
            <input
              name="teamName"
              required
              value={form.teamName}
              onChange={onChange}
              className={inputClass}
            />
          </Field>
          <Field label="Stadt/Region">
            <CityInput
              value={form.region}
              onChange={(v) => setForm((f) => ({ ...f, region: v }))}
              onPick={(c) =>
                setForm((f) => ({ ...f, region: c.n, bundesland: c.s || f.bundesland }))
              }
              placeholder="z.B. Berlin"
            />
          </Field>
          <Field label="Bundesland">
            <select
              name="bundesland"
              value={form.bundesland}
              onChange={onChange}
              className={inputClass}
            >
              <option value="">– wählen –</option>
              {BUNDESLAENDER.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Über das Team">
          <textarea
            name="about"
            rows={3}
            value={form.about}
            onChange={onChange}
            className={`${inputClass} resize-none`}
            placeholder="Kurzbeschreibung, Spielklasse, Heimhalle…"
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Logo">
            <ImageUpload
              endpoint="/api/upload/team-image"
              fields={{ token: getTeamAuthToken(), type: "logo" }}
              currentUrl={form.logo}
              variant="avatar"
              label="Logo hochladen"
              onUploaded={(url) => {
                setForm((f) => ({ ...f, logo: url }));
                reload?.();
              }}
            />
          </Field>
          <Field label="Banner">
            <ImageUpload
              endpoint="/api/upload/team-image"
              fields={{ token: getTeamAuthToken(), type: "banner" }}
              currentUrl={form.banner}
              variant="banner"
              label="Banner hochladen"
              onUploaded={(url) => {
                setForm((f) => ({ ...f, banner: url }));
                reload?.();
              }}
            />
          </Field>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-6 py-2.5 font-medium transition-colors"
          >
            {saving ? "Speichern…" : "Speichern"}
          </button>
        </div>
      </form>

      {/* Liga */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <FaTrophy className="text-brand-500" />
          <h2 className="text-lg font-semibold text-gray-900">Liga</h2>
        </div>
        <p className="text-sm text-gray-500">
          Wähle die Liga deines Teams aus dem offiziellen Katalog. Nach Saisonwechsel
          (Auf-/Abstieg) hier die neue Liga einstellen.
        </p>

        {leagueMsg && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              leagueMsg.type === "ok"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {leagueMsg.text}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <select
            value={leagueFilter.level}
            onChange={(e) => setLeagueFilter((f) => ({ ...f, level: e.target.value }))}
            className={inputClass}
          >
            <option value="">Alle Spielklassen</option>
            {LEAGUE_LEVELS.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
          <select
            value={leagueFilter.gender}
            onChange={(e) => setLeagueFilter((f) => ({ ...f, gender: e.target.value }))}
            className={inputClass}
          >
            <option value="">Alle Geschlechter</option>
            {LEAGUE_GENDERS.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
          <select
            value={leagueFilter.ageGroup}
            onChange={(e) => setLeagueFilter((f) => ({ ...f, ageGroup: e.target.value }))}
            className={inputClass}
          >
            <option value="">Alle Altersklassen</option>
            {LEAGUE_AGE_GROUPS.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </div>

        <Field
          label="Liga"
          hint={
            form.bundesland
              ? `Gefiltert nach ${form.bundesland}.`
              : "Tipp: Bundesland oben setzen, um die Auswahl einzugrenzen."
          }
        >
          <select
            value={leagueId}
            onChange={(e) => setLeagueId(e.target.value)}
            className={inputClass}
          >
            <option value="">– keine Liga –</option>
            {leagueOptions.map((l) => (
              <option key={l._id} value={l._id}>
                {leagueLabel(l)}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex items-center justify-between gap-3">
          <LeagueReportLink bundesland={form.bundesland} />
          <button
            type="button"
            onClick={onSaveLeague}
            disabled={leagueSaving}
            className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-6 py-2.5 font-medium transition-colors"
          >
            {leagueSaving ? "Speichern…" : "Liga speichern"}
          </button>
        </div>
      </div>

      {/* Einladungslink */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <FaLink className="text-brand-500" />
          <h2 className="text-lg font-semibold text-gray-900">Einladungslink</h2>
        </div>
        <p className="text-sm text-gray-500">
          Teile diesen Link, damit Spieler deinem Team beitreten können. Beim Neu-Erstellen
          wird der alte Link ungültig.
        </p>

        {inviteLink ? (
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={inviteLink}
              className={`${inputClass} bg-gray-50 text-gray-600`}
              onFocus={(e) => e.target.select()}
            />
            <button
              type="button"
              onClick={copyLink}
              className="flex-shrink-0 inline-flex items-center gap-2 border border-gray-300 hover:border-brand-500 text-gray-700 rounded-lg px-4 py-2.5 text-sm font-medium"
            >
              {copied ? <FaCheck className="text-green-600" /> : <FaCopy />}
              {copied ? "Kopiert" : "Kopieren"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Noch kein Link erstellt.</p>
        )}

        <button
          type="button"
          onClick={onGenerate}
          disabled={generating}
          className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
        >
          {generating
            ? "Erstellen…"
            : inviteToken
            ? "Neuen Link erstellen"
            : "Einladungslink erstellen"}
        </button>
      </div>
    </div>
  );
}
