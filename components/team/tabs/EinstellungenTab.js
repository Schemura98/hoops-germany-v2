"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaCheck, FaTrophy, FaBell, FaTimes } from "react-icons/fa";
import { getTeamAuthToken } from "@/lib/useCurrentTeam";
import {
  BUNDESLAENDER,
  LEAGUE_LEVELS,
  BASKETBALLKREISE_NRW_GRUPPIERT,
  ALL_ROLES,
  bezirkOfKreis,
} from "@/lib/constants";
import { FaUserPlus } from "react-icons/fa";
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
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
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

  // Liga-Zuordnung: NUR Anfrage (Freigabe durch Super-Admin) – s. request-league-change.
  const [leagues, setLeagues] = useState([]);
  const [leagueId, setLeagueId] = useState(""); // Ziel-Liga der ANFRAGE – startet immer leer
  const [leagueFilter, setLeagueFilter] = useState({
    bereich: "",
    kategorie: "",
    level: "",
    bezirk: "",
    kreis: "",
    search: "",
  });
  const [leagueRequests, setLeagueRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestNote, setRequestNote] = useState("");
  const [leagueSaving, setLeagueSaving] = useState(false);
  const [leagueMsg, setLeagueMsg] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);

  // Scouting: Verstärkung suchen
  const [recruiting, setRecruiting] = useState(!!team?.recruiting);
  const [recruitPositions, setRecruitPositions] = useState(team?.recruitingPositions || []);
  const [recruitNote, setRecruitNote] = useState(team?.recruitingNote || "");
  const [recruitSaving, setRecruitSaving] = useState(false);
  const [recruitMsg, setRecruitMsg] = useState(null);

  // Benachrichtigungen: bei Beitritten/Anfragen alle Admins benachrichtigen
  const [notifyAllAdmins, setNotifyAllAdmins] = useState(!!team?.notifyAllAdmins);
  const [notifySaving, setNotifySaving] = useState(false);
  const [notifySaved, setNotifySaved] = useState(false); // kurze Inline-Rückmeldung nach Erfolg
  const [notifyMsg, setNotifyMsg] = useState(null); // { type: "err", text } – nur im Fehlerfall

  const toggleRecruitPos = (p) =>
    setRecruitPositions((list) =>
      list.includes(p) ? list.filter((x) => x !== p) : [...list, p]
    );

  async function saveRecruiting(nextRecruiting) {
    setRecruitSaving(true);
    setRecruitMsg(null);
    try {
      const token = getTeamAuthToken();
      await axios.post("/api/team/set-recruiting", {
        token,
        recruiting: nextRecruiting,
        positions: recruitPositions,
        recruitingNote: recruitNote,
      });
      setRecruitMsg({ type: "ok", text: "Gespeichert." });
      reload?.();
    } catch (err) {
      setRecruitMsg({
        type: "err",
        text: err.response?.data?.message || "Speichern fehlgeschlagen.",
      });
    } finally {
      setRecruitSaving(false);
    }
  }

  async function saveNotifyAdmins(next) {
    setNotifySaving(true);
    setNotifyMsg(null);
    try {
      const token = getTeamAuthToken();
      await axios.post("/api/team/set-notify-admins", { token, notifyAllAdmins: next });
      setNotifySaved(true);
      setTimeout(() => setNotifySaved(false), 2000);
    } catch (err) {
      setNotifyAllAdmins(!next); // bei Fehler zurückrollen
      setNotifyMsg({
        type: "err",
        text: err.response?.data?.message || "Speichern fehlgeschlagen.",
      });
    } finally {
      setNotifySaving(false);
    }
  }

  const loadLeagueRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const token = getTeamAuthToken();
      const { data } = await axios.post("/api/team/league-change-requests", { token });
      setLeagueRequests(data.requests || []);
    } catch {
      /* optional */
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await axios.get("/api/leagues", { params: { scope: "all" } });
        if (active) setLeagues(data.leagues || []);
      } catch {
        /* Ligen optional */
      }
    })();
    loadLeagueRequests();
    return () => {
      active = false;
    };
  }, [loadLeagueRequests]);

  const currentLeague = useMemo(
    () => leagues.find((l) => String(l._id) === String(team?.leagueId || "")) || null,
    [leagues, team?.leagueId]
  );
  const pendingRequest = useMemo(
    () => leagueRequests.find((r) => r.status === "ausstehend") || null,
    [leagueRequests]
  );
  const historyRequests = useMemo(
    () => leagueRequests.filter((r) => r.status !== "ausstehend").slice(0, 3),
    [leagueRequests]
  );

  const isYouth = leagueFilter.bereich === "U18" || leagueFilter.bereich === "U16";
  const kategorieOptions = isYouth
    ? [
        { v: "", l: "Alle" },
        { v: "Herren", l: "männlich" },
        { v: "Damen", l: "weiblich" },
        { v: "Mixed", l: "offen" },
      ]
    : [
        { v: "", l: "Alle" },
        { v: "Herren", l: "Herren" },
        { v: "Damen", l: "Damen" },
      ];
  const showKreisFilter = leagueFilter.level === "Kreisliga";
  const kreisGroupsForSelect = leagueFilter.bezirk
    ? BASKETBALLKREISE_NRW_GRUPPIERT.filter((g) => g.bezirk === leagueFilter.bezirk)
    : BASKETBALLKREISE_NRW_GRUPPIERT;

  function setFilter(patch) {
    setLeagueFilter((f) => ({ ...f, ...patch }));
  }

  // Optionen: nach den gewählten Filtern; eigene aktuelle Liga wird NICHT als Ziel angeboten
  // (Anfrage auf die bereits aktuelle Liga ist unzulässig).
  const leagueOptions = useMemo(() => {
    const q = leagueFilter.search.trim().toLowerCase();
    return leagues
      .filter((l) => {
        if (team?.leagueId && String(l._id) === String(team.leagueId)) return false;
        if (l.finished) return false;
        if (leagueFilter.bereich && l.ageGroup !== leagueFilter.bereich) return false;
        if (leagueFilter.kategorie && l.gender !== leagueFilter.kategorie) return false;
        if (leagueFilter.level && l.level !== leagueFilter.level) return false;
        if (showKreisFilter && leagueFilter.bezirk && bezirkOfKreis(l.region) !== leagueFilter.bezirk)
          return false;
        if (showKreisFilter && leagueFilter.kreis && l.region !== leagueFilter.kreis) return false;
        if (q && !`${l.name} ${l.region} ${l.bundesland}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => String(a.name).localeCompare(String(b.name), "de"));
  }, [leagues, leagueFilter, showKreisFilter, team?.leagueId]);

  // Ziel-Liga zurücksetzen, sobald sie durch einen Filterwechsel nicht mehr in den
  // Optionen vorkommt (Auswahl darf nie „unsichtbar" gewählt bleiben).
  useEffect(() => {
    if (leagueId && !leagueOptions.some((l) => String(l._id) === leagueId)) setLeagueId("");
  }, [leagueOptions, leagueId]);
  // Regierungsbezirk/Kreis nur relevant bei Kreisliga.
  useEffect(() => {
    if (!showKreisFilter && (leagueFilter.bezirk || leagueFilter.kreis)) {
      setFilter({ bezirk: "", kreis: "" });
    }
  }, [showKreisFilter, leagueFilter.bezirk, leagueFilter.kreis]);

  const leagueLabel = (l) =>
    [l.name, l.gender, l.ageGroup !== "Senioren" ? l.ageGroup : null, l.season]
      .filter(Boolean)
      .join(" · ");

  async function onRequestLeague() {
    if (!leagueId) return;
    setLeagueMsg(null);
    setLeagueSaving(true);
    try {
      const token = getTeamAuthToken();
      await axios.post("/api/team/request-league-change", { token, requestedLeagueId: leagueId, note: requestNote });
      setLeagueMsg({ type: "ok", text: "Anfrage gesendet – ein Super-Admin prüft sie." });
      setLeagueId("");
      setRequestNote("");
      await loadLeagueRequests();
    } catch (err) {
      setLeagueMsg({
        type: "err",
        text: err.response?.data?.message || "Anfrage konnte nicht gesendet werden.",
      });
    } finally {
      setLeagueSaving(false);
    }
  }

  async function onCancelRequest(requestId) {
    setCancelingId(requestId);
    try {
      const token = getTeamAuthToken();
      await axios.post("/api/team/cancel-league-change-request", { token, requestId });
      await loadLeagueRequests();
    } catch {
      /* ignorieren */
    } finally {
      setCancelingId(null);
    }
  }

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

  return (
    <div className="space-y-6">
      {/* Sprungmarken – die Seite ist mobil sehr lang */}
      <nav
        aria-label="Bereiche"
        className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-gray-50 border border-gray-100 px-4 py-2.5 text-sm"
      >
        {[
          { href: "#team-daten", label: "Team-Daten" },
          { href: "#liga", label: "Liga" },
          { href: "#verstaerkung", label: "Verstärkung" },
          { href: "#benachrichtigungen", label: "Benachrichtigungen" },
        ].map((l, i, arr) => (
          <span key={l.href} className="flex items-center gap-x-2">
            <a href={l.href} className="font-medium text-gray-600 hover:text-brand-600">
              {l.label}
            </a>
            {i < arr.length - 1 && <span className="text-gray-300">·</span>}
          </span>
        ))}
      </nav>

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
        id="team-daten"
        onSubmit={onSave}
        className="scroll-mt-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5"
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
      <div id="liga" className="scroll-mt-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <FaTrophy className="text-brand-500" />
          <h2 className="text-lg font-semibold text-gray-900">Liga</h2>
        </div>

        {/* Aktuelle Liga – SCHREIBGESCHÜTZT. Ändert sich nur nach Super-Admin-Freigabe. */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Aktuelle Liga
          </p>
          {currentLeague ? (
            <div className="space-y-0.5 text-sm">
              <p className="font-semibold text-gray-900">{currentLeague.name}</p>
              <p className="text-gray-500">
                {[
                  currentLeague.season ? `Saison ${currentLeague.season}` : null,
                  currentLeague.ageGroup,
                  currentLeague.gender,
                  currentLeague.level,
                  currentLeague.region,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="text-xs text-gray-500">
                Status: {currentLeague.finished ? "Abgeschlossen" : currentLeague.active ? "Aktiv" : "Inaktiv"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Noch keine Liga zugeordnet.</p>
          )}
        </div>

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

        {requestsLoading ? null : pendingRequest ? (
          /* Offene Anfrage – kein neues Formular, solange diese läuft. */
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Ligazuordnung ausstehend
            </p>
            <p className="text-sm text-gray-800">
              Angefragt: <strong>{pendingRequest.requestedLeagueId?.name}</strong>
              {pendingRequest.requestedLeagueId?.season ? ` · Saison ${pendingRequest.requestedLeagueId.season}` : ""}
            </p>
            <p className="text-xs text-gray-500">Ein Super-Admin prüft die Anfrage.</p>
            <button
              type="button"
              onClick={() => onCancelRequest(pendingRequest._id)}
              disabled={cancelingId === pendingRequest._id}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-60"
            >
              <FaTimes className="text-[10px]" />
              {cancelingId === pendingRequest._id ? "Storniere…" : "Anfrage stornieren"}
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">
              Ligazuordnung ändern? Wähle die gewünschte Liga aus dem offiziellen Katalog –
              ein Super-Admin prüft die Anfrage, bevor sie wirksam wird.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <select
                value={leagueFilter.bereich}
                onChange={(e) =>
                  setFilter({ bereich: e.target.value, kategorie: "", level: "", bezirk: "", kreis: "" })
                }
                className={inputClass}
              >
                <option value="">Alle Bereiche</option>
                <option value="Senioren">Senioren</option>
                <option value="U18">U18</option>
                <option value="U16">U16</option>
              </select>
              <select
                value={leagueFilter.kategorie}
                onChange={(e) => setFilter({ kategorie: e.target.value })}
                className={inputClass}
              >
                {kategorieOptions.map((o) => (
                  <option key={o.v || "all"} value={o.v}>
                    {o.v ? o.l : "Alle Kategorien"}
                  </option>
                ))}
              </select>
              <select
                value={leagueFilter.level}
                onChange={(e) => setFilter({ level: e.target.value, bezirk: "", kreis: "" })}
                className={inputClass}
              >
                <option value="">Alle Spielklassen</option>
                {LEAGUE_LEVELS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
              {showKreisFilter && (
                <select
                  value={leagueFilter.bezirk}
                  onChange={(e) => setFilter({ bezirk: e.target.value, kreis: "" })}
                  className={inputClass}
                >
                  <option value="">Alle Regierungsbezirke</option>
                  {BASKETBALLKREISE_NRW_GRUPPIERT.map((g) => (
                    <option key={g.bezirk} value={g.bezirk}>
                      {g.bezirk}
                    </option>
                  ))}
                </select>
              )}
              {showKreisFilter && (
                <select
                  value={leagueFilter.kreis}
                  onChange={(e) => setFilter({ kreis: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Alle Basketballkreise</option>
                  {kreisGroupsForSelect.map((g) => (
                    <optgroup key={g.bezirk} label={g.bezirk}>
                      {g.kreise.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              )}
              <input
                value={leagueFilter.search}
                onChange={(e) => setFilter({ search: e.target.value })}
                placeholder="Liga, Region oder Basketballkreis suchen"
                className={inputClass}
              />
            </div>

            <Field label="Ziel-Liga">
              <select
                value={leagueId}
                onChange={(e) => setLeagueId(e.target.value)}
                className={inputClass}
              >
                <option value="">Bitte gewünschte Liga auswählen</option>
                {leagueOptions.map((l) => (
                  <option key={l._id} value={l._id}>
                    {leagueLabel(l)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Hinweis (optional)">
              <textarea
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                rows={2}
                placeholder="z. B. Grund für den Wechsel"
                className={inputClass}
              />
            </Field>

            <div className="flex items-center justify-between gap-3">
              <LeagueReportLink bundesland={form.bundesland} />
              <button
                type="button"
                onClick={onRequestLeague}
                disabled={leagueSaving || !leagueId}
                className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-6 py-2.5 font-medium transition-colors"
              >
                {leagueSaving ? "Sende…" : "Ligazuordnung anfragen"}
              </button>
            </div>
          </>
        )}

        {historyRequests.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Letzte Anfragen
            </p>
            <ul className="space-y-1.5">
              {historyRequests.map((r) => (
                <li key={r._id} className="flex items-center justify-between gap-3 text-xs text-gray-500">
                  <span className="truncate">{r.requestedLeagueId?.name || "Liga"}</span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 font-medium ${
                      r.status === "genehmigt"
                        ? "bg-green-50 text-green-700"
                        : r.status === "abgelehnt"
                        ? "bg-red-50 text-red-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {r.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Verstärkung suchen (Scouting) */}
      <div id="verstaerkung" className="scroll-mt-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FaUserPlus className="text-brand-500" /> Verstärkung suchen
          </h2>
          <button
            type="button"
            onClick={() => {
              const next = !recruiting;
              setRecruiting(next);
              saveRecruiting(next);
            }}
            disabled={recruitSaving}
            role="switch"
            aria-checked={recruiting}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-60 ${
              recruiting ? "bg-brand-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                recruiting ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        <p className="text-sm text-gray-500">
          {recruiting
            ? 'Dein Team erscheint im Transfermarkt-Tab „Vereine suchen Spieler".'
            : "Aktiviere den Schalter, um dein Team im Transfermarkt als suchend zu listen."}
        </p>

        {recruitMsg && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              recruitMsg.type === "ok"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {recruitMsg.text}
          </div>
        )}

        {recruiting && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Gesuchte Positionen / Rollen
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_ROLES.map((p) => {
                  const active = recruitPositions.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => toggleRecruitPos(p)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        active
                          ? "bg-brand-500 text-white border-brand-500"
                          : "bg-white text-gray-600 border-gray-200 hover:border-brand-300"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
            <Field label="Notiz (optional)">
              <textarea
                value={recruitNote}
                onChange={(e) => setRecruitNote(e.target.value)}
                rows={2}
                className={`${inputClass} resize-none`}
                placeholder="Was sucht ihr? Spielklasse, Trainingszeiten, Region…"
              />
            </Field>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => saveRecruiting(true)}
                disabled={recruitSaving}
                className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-6 py-2.5 font-medium transition-colors"
              >
                {recruitSaving ? "Speichern…" : "Speichern"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Benachrichtigungen */}
      <div id="benachrichtigungen" className="scroll-mt-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FaBell className="text-brand-500" /> Benachrichtigungen
          </h2>
          <div className="flex items-center gap-2">
            {notifySaved && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                <FaCheck className="text-[10px]" /> Gespeichert
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                const next = !notifyAllAdmins;
                setNotifyAllAdmins(next);
                saveNotifyAdmins(next);
              }}
              disabled={notifySaving}
              role="switch"
              aria-checked={notifyAllAdmins}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-60 ${
                notifyAllAdmins ? "bg-brand-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifyAllAdmins ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          {notifyAllAdmins
            ? "Bei Beitritten und Anfragen werden alle Team-Admins (Haupt-Admin + Co-Admins) benachrichtigt."
            : "Bei Beitritten und Anfragen wird nur der Haupt-Admin benachrichtigt. Aktiviere den Schalter, um alle Team-Admins zu benachrichtigen."}
        </p>
        {notifyMsg && (
          <div className="rounded-lg border px-4 py-3 text-sm bg-red-50 border-red-200 text-red-700">
            {notifyMsg.text}
          </div>
        )}
      </div>

      {/* Einladungslink – wird zentral im Kader-Tab verwaltet (ein Token, keine Dopplung) */}
      <p className="text-center text-xs text-gray-400">
        Den Team-Einladungslink verwaltest du im{" "}
        <a
          href="/team/admin?tab=kader"
          className="font-medium text-brand-600 hover:text-brand-700 underline underline-offset-2"
        >
          Kader-Tab
        </a>
        .
      </p>
    </div>
  );
}
