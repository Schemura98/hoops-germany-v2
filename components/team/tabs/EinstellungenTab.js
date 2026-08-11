"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { PiCheckBold, PiTrophyBold, PiBellBold, PiXBold } from "react-icons/pi";
import { getTeamAuthToken } from "@/lib/useCurrentTeam";
import {
  BUNDESLAENDER,
  LEAGUE_LEVELS,
  BASKETBALLKREISE_NRW_GRUPPIERT,
  ALL_ROLES,
  bezirkOfKreis,
} from "@/lib/constants";
import { PiUserPlusBold } from "react-icons/pi";
import ImageUpload from "@/components/ImageUpload";
import CityInput from "@/components/CityInput";
import LeagueReportLink from "@/components/team/LeagueReportLink";
import Button from "@/components/ui/Button";
import TabAlert from "@/components/team/tabs/TabAlert";
import { inputClass } from "@/lib/ui";

// required: markiert Pflichtfelder mit „*" – optionale Felder tragen weiterhin
// „(optional)" im Label, damit beide Seiten konsistent gekennzeichnet sind.
function Field({ label, hint, required = false, optional = false, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-mist-300 mb-1">
        {label}
        {required && (
          <span className="text-brand-400" aria-hidden="true">
            {" *"}
          </span>
        )}
        {optional && <span className="font-normal text-mist-400"> (optional)</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-mist-400">{hint}</p>}
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
        className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md bg-navy-950 border border-navy-600 px-4 py-2.5 text-sm"
      >
        {[
          { href: "#team-daten", label: "Team-Daten" },
          { href: "#liga", label: "Liga" },
          { href: "#verstaerkung", label: "Verstärkung" },
          { href: "#benachrichtigungen", label: "Benachrichtigungen" },
        ].map((l, i, arr) => (
          <span key={l.href} className="flex items-center gap-x-2">
            <a href={l.href} className="font-medium text-mist-400 hover:text-brand-400">
              {l.label}
            </a>
            {i < arr.length - 1 && <span className="text-navy-500">·</span>}
          </span>
        ))}
      </nav>

      <TabAlert msg={msg} />

      {/* Stammdaten */}
      <form
        id="team-daten"
        onSubmit={onSave}
        className="scroll-mt-24 bg-navy-800 rounded-md border border-navy-600 p-6 space-y-5"
      >
        <h2 className="text-lg font-semibold text-paper-50">Team-Daten</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Teamname" required>
            <input
              name="teamName"
              required
              value={form.teamName}
              onChange={onChange}
              className={inputClass}
            />
          </Field>
          <Field label="Stadt/Region" optional>
            <CityInput
              value={form.region}
              onChange={(v) => setForm((f) => ({ ...f, region: v }))}
              onPick={(c) =>
                setForm((f) => ({ ...f, region: c.n, bundesland: c.s || f.bundesland }))
              }
              placeholder="z.B. Berlin"
            />
          </Field>
          <Field label="Bundesland" optional>
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

        <Field label="Über das Team" optional>
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
          <Field label="Logo" optional>
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
          <Field label="Banner" optional>
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
          <Button type="submit" size="lg" disabled={saving} className="px-6">
            {saving ? "Speichern…" : "Speichern"}
          </Button>
        </div>
      </form>

      {/* Liga */}
      <div id="liga" className="scroll-mt-24 bg-navy-800 rounded-md border border-navy-600 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <PiTrophyBold className="text-brand-400" />
          <h2 className="text-lg font-semibold text-paper-50">Liga</h2>
        </div>

        {/* Aktuelle Liga – SCHREIBGESCHÜTZT. Ändert sich nur nach Super-Admin-Freigabe. */}
        <div className="rounded-md border border-navy-600 bg-navy-950 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-mist-400">
            Aktuelle Liga
          </p>
          {currentLeague ? (
            <div className="space-y-0.5 text-sm">
              <p className="font-semibold text-paper-50">{currentLeague.name}</p>
              <p className="text-mist-400">
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
              <p className="text-xs text-mist-400">
                Status: {currentLeague.finished ? "Abgeschlossen" : currentLeague.active ? "Aktiv" : "Inaktiv"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-mist-400">Noch keine Liga zugeordnet.</p>
          )}
        </div>

        <TabAlert msg={leagueMsg} />

        {requestsLoading ? null : pendingRequest ? (
          /* Offene Anfrage – kein neues Formular, solange diese läuft. */
          <div className="rounded-md border border-signal-wait/50 bg-signal-wait/10 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-signal-wait">
              Ligazuordnung ausstehend
            </p>
            <p className="text-sm text-paper-50">
              Angefragt: <strong>{pendingRequest.requestedLeagueId?.name}</strong>
              {pendingRequest.requestedLeagueId?.season ? ` · Saison ${pendingRequest.requestedLeagueId.season}` : ""}
            </p>
            <p className="text-xs text-mist-400">Ein Super-Admin prüft die Anfrage.</p>
            <button
              type="button"
              onClick={() => onCancelRequest(pendingRequest._id)}
              disabled={cancelingId === pendingRequest._id}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-signal-error hover:brightness-125 transition-[filter] disabled:opacity-60"
            >
              <PiXBold className="text-[10px]" />
              {cancelingId === pendingRequest._id ? "Storniere…" : "Anfrage stornieren"}
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-mist-400">
              Ligazuordnung ändern? Wähle die gewünschte Liga aus dem offiziellen Katalog –
              ein Super-Admin prüft die Anfrage, bevor sie wirksam wird.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <select
                aria-label="Bereich filtern"
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
                aria-label="Kategorie filtern"
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
                aria-label="Spielklasse filtern"
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
                  aria-label="Regierungsbezirk filtern"
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
                  aria-label="Basketballkreis filtern"
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
                aria-label="Liga suchen"
                value={leagueFilter.search}
                onChange={(e) => setFilter({ search: e.target.value })}
                placeholder="Liga, Region oder Basketballkreis suchen"
                className={inputClass}
              />
            </div>

            <Field label="Ziel-Liga" required>
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

            <Field label="Hinweis" optional>
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
              <Button
                type="button"
                size="lg"
                onClick={onRequestLeague}
                disabled={leagueSaving || !leagueId}
                className="px-6"
              >
                {leagueSaving ? "Sende…" : "Ligazuordnung anfragen"}
              </Button>
            </div>
          </>
        )}

        {historyRequests.length > 0 && (
          <div className="pt-2 border-t border-navy-600">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-mist-400">
              Letzte Anfragen
            </p>
            <ul className="space-y-1.5">
              {historyRequests.map((r) => (
                <li key={r._id} className="flex items-center justify-between gap-3 text-xs text-mist-400">
                  <span className="truncate">{r.requestedLeagueId?.name || "Liga"}</span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 font-medium ${
                      r.status === "genehmigt"
                        ? "bg-signal-ok/10 text-signal-ok"
                        : r.status === "abgelehnt"
                        ? "bg-signal-error/10 text-signal-error"
                        : "bg-navy-700 text-mist-400"
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
      <div id="verstaerkung" className="scroll-mt-24 bg-navy-800 rounded-md border border-navy-600 p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-paper-50 flex items-center gap-2">
            <PiUserPlusBold className="text-brand-400" /> Verstärkung suchen
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
              recruiting ? "bg-brand-500" : "bg-navy-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-navy-800 transition-transform ${
                recruiting ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        <p className="text-sm text-mist-400">
          {recruiting
            ? 'Dein Team erscheint im Transfermarkt-Tab „Vereine suchen Spieler".'
            : "Aktiviere den Schalter, um dein Team im Transfermarkt als suchend zu listen."}
        </p>

        <TabAlert msg={recruitMsg} />

        {recruiting && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-mist-400 mb-2">
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
                          ? "bg-brand-500 text-navy-950 border-brand-500"
                          : "bg-navy-800 text-mist-400 border-navy-600 hover:border-brand-300"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
            <Field label="Notiz" optional>
              <textarea
                value={recruitNote}
                onChange={(e) => setRecruitNote(e.target.value)}
                rows={2}
                className={`${inputClass} resize-none`}
                placeholder="Was sucht ihr? Spielklasse, Trainingszeiten, Region…"
              />
            </Field>
            <div className="flex justify-end">
              <Button
                type="button"
                size="lg"
                onClick={() => saveRecruiting(true)}
                disabled={recruitSaving}
                className="px-6"
              >
                {recruitSaving ? "Speichern…" : "Speichern"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Benachrichtigungen */}
      <div id="benachrichtigungen" className="scroll-mt-24 bg-navy-800 rounded-md border border-navy-600 p-6 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-paper-50 flex items-center gap-2">
            <PiBellBold className="text-brand-400" /> Benachrichtigungen
          </h2>
          <div className="flex items-center gap-2">
            {notifySaved && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-signal-ok">
                <PiCheckBold className="text-[10px]" /> Gespeichert
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
                notifyAllAdmins ? "bg-brand-500" : "bg-navy-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-navy-800 transition-transform ${
                  notifyAllAdmins ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
        <p className="text-sm text-mist-400">
          {notifyAllAdmins
            ? "Bei Beitritten und Anfragen werden alle Team-Admins (Haupt-Admin + Co-Admins) benachrichtigt."
            : "Bei Beitritten und Anfragen wird nur der Haupt-Admin benachrichtigt. Aktiviere den Schalter, um alle Team-Admins zu benachrichtigen."}
        </p>
        <TabAlert msg={notifyMsg} />
      </div>

      {/* Einladungslink – wird zentral im Kader-Tab verwaltet (ein Token, keine Dopplung) */}
      <p className="text-center text-xs text-mist-600">
        Den Team-Einladungslink verwaltest du im{" "}
        <a
          href="/team/admin?tab=kader"
          className="font-medium text-brand-400 hover:text-brand-300 transition-colors underline underline-offset-2"
        >
          Kader-Tab
        </a>
        .
      </p>
    </div>
  );
}
