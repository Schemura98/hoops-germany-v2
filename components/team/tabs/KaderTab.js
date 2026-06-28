"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaPlus,
  FaTrash,
  FaCopy,
  FaCheck,
  FaEnvelope,
  FaUserCheck,
  FaUserMinus,
  FaUser,
  FaWhatsapp,
  FaUserShield,
  FaUserSlash,
  FaLink,
  FaHashtag,
  FaSlidersH,
  FaSearch,
  FaUserPlus,
} from "react-icons/fa";
import { getTeamAuthToken } from "@/lib/useCurrentTeam";
import { POSITIONS, positionLabel } from "@/lib/constants";
import { TEAM_PERMISSIONS } from "@/lib/teamPermissions";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

const STATUS_BADGE = {
  empty: { label: "Frei", cls: "bg-gray-100 text-gray-600" },
  pending: { label: "Ausstehend", cls: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Bestätigt", cls: "bg-green-100 text-green-700" },
};

export default function KaderTab({ team, reload, isMainAdmin = true }) {
  const slots = team?.rosterSlots || [];

  const [origin, setOrigin] = useState("");
  const [msg, setMsg] = useState(null); // { type, text }

  // Tatsächliche Mitglieder (Account-Spieler mit teamId)
  const [members, setMembers] = useState([]);
  const [removingId, setRemovingId] = useState(null);
  const [adminBusyId, setAdminBusyId] = useState(null);

  // Rückennummer eines Mitglieds bearbeiten (Inline)
  const [numberEditId, setNumberEditId] = useState(null);
  const [numberValue, setNumberValue] = useState("");
  const [numberBusyId, setNumberBusyId] = useState(null);

  // Teilrechte eines Co-Admins bearbeiten (nur Haupt-Admin)
  const [permEditId, setPermEditId] = useState(null);
  const [permDraft, setPermDraft] = useState([]);
  const [permBusyId, setPermBusyId] = useState(null);

  // Allgemeiner Team-Einladungslink (auch im Kader, nicht nur in Einstellungen)
  const [inviteToken, setInviteToken] = useState(team?.inviteToken || "");
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  // Bestehenden Account direkt einladen (Suche)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [invitingId, setInvitingId] = useState(null);
  const [invitedIds, setInvitedIds] = useState([]);

  async function loadMembers() {
    try {
      const token = getTeamAuthToken();
      const { data } = await axios.post("/api/team/roster-players", { token });
      setMembers(data.players || []);
    } catch {
      /* ignorieren */
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  async function removeMember(playerId) {
    if (!window.confirm("Diesen Spieler aus dem Team entfernen?")) return;
    setRemovingId(playerId);
    setMsg(null);
    try {
      const token = getTeamAuthToken();
      await axios.post("/api/team/remove-member", { token, playerId });
      flash("ok", "Spieler entfernt.");
      loadMembers();
    } catch (err) {
      flash("err", err.response?.data?.message || "Entfernen fehlgeschlagen.");
    } finally {
      setRemovingId(null);
    }
  }

  async function setMemberAdmin(playerId, makeAdmin, name) {
    const q = makeAdmin
      ? `${name} zum Team-Admin machen? Die Person kann dann Kader, Spiele & Ergebnisse verwalten.`
      : `${name} die Adminrechte entziehen?`;
    if (!window.confirm(q)) return;
    setAdminBusyId(playerId);
    setMsg(null);
    try {
      const token = getTeamAuthToken();
      await axios.post("/api/team/set-member-admin", { token, playerId, makeAdmin });
      flash("ok", makeAdmin ? "Spieler ist jetzt Team-Admin." : "Adminrechte entzogen.");
      loadMembers();
    } catch (err) {
      flash("err", err.response?.data?.message || "Aktion fehlgeschlagen.");
    } finally {
      setAdminBusyId(null);
    }
  }

  function openPermEditor(m) {
    setPermEditId(m.playerId);
    setPermDraft(m.perms || []);
  }

  function togglePerm(key) {
    setPermDraft((d) => (d.includes(key) ? d.filter((x) => x !== key) : [...d, key]));
  }

  async function savePerms(playerId) {
    setPermBusyId(playerId);
    setMsg(null);
    try {
      const token = getTeamAuthToken();
      await axios.post("/api/team/set-member-permissions", {
        token,
        playerId,
        perms: permDraft,
      });
      flash("ok", "Rechte gespeichert.");
      setPermEditId(null);
      loadMembers();
    } catch (err) {
      flash("err", err.response?.data?.message || "Speichern fehlgeschlagen.");
    } finally {
      setPermBusyId(null);
    }
  }

  async function saveMemberNumber(playerId) {
    setNumberBusyId(playerId);
    setMsg(null);
    try {
      const token = getTeamAuthToken();
      await axios.post("/api/team/set-member-number", {
        token,
        playerId,
        number: numberValue,
      });
      setNumberEditId(null);
      setNumberValue("");
      loadMembers();
    } catch (err) {
      flash("err", err.response?.data?.message || "Nummer konnte nicht gespeichert werden.");
    } finally {
      setNumberBusyId(null);
    }
  }

  // Allgemeiner Team-Einladungslink (Beitritt ohne festen Slot)
  const inviteLink = inviteToken ? `${origin}/team/join/${inviteToken}` : "";

  async function generateInvite() {
    setGeneratingInvite(true);
    setMsg(null);
    try {
      const token = getTeamAuthToken();
      const { data } = await axios.post("/api/team/generate-invite", { token });
      setInviteToken(data.inviteToken);
      setInviteCopied(false);
    } catch (err) {
      flash("err", err.response?.data?.message || "Link konnte nicht erstellt werden.");
    } finally {
      setGeneratingInvite(false);
    }
  }

  async function copyInvite() {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2000);
    } catch {
      /* Clipboard nicht verfügbar */
    }
  }

  function shareInviteWhatsApp() {
    if (!inviteLink) return;
    const text = `Tritt dem Team ${team?.teamName || "unserem Team"} bei Hoops Germany bei: ${inviteLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  // Bestehende Accounts suchen (debounced) und einladen.
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    let active = true;
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await axios.post("/api/player/search", { q });
        if (active) setSearchResults(data.players || []);
      } catch {
        /* ignorieren */
      } finally {
        if (active) setSearching(false);
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [searchQuery]);

  async function invitePlayer(p) {
    setInvitingId(p.playerId);
    setMsg(null);
    try {
      const token = getTeamAuthToken();
      await axios.post("/api/team/invite-player", { token, playerId: p.playerId });
      setInvitedIds((ids) => [...ids, p.playerId]);
      flash("ok", `Einladung an ${p.name} gesendet – sie wird per Glocke & Mail gefragt.`);
    } catch (err) {
      flash("err", err.response?.data?.message || "Einladung fehlgeschlagen.");
    } finally {
      setInvitingId(null);
    }
  }

  // Slot hinzufügen
  const [showAdd, setShowAdd] = useState(false);
  const [newSlot, setNewSlot] = useState({ name: "", position: "", number: "" });
  const [adding, setAdding] = useState(false);

  // Pro-Slot UI-State
  const [busyId, setBusyId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [inviteOpenId, setInviteOpenId] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  function flash(type, text) {
    setMsg({ type, text });
  }

  async function addSlot(e) {
    e.preventDefault();
    if (!newSlot.name.trim()) return;
    setAdding(true);
    setMsg(null);
    try {
      const token = getTeamAuthToken();
      await axios.post("/api/team/roster/add-slot", { token, ...newSlot });
      setNewSlot({ name: "", position: "", number: "" });
      setShowAdd(false);
      reload?.();
    } catch (err) {
      flash("err", err.response?.data?.message || "Slot konnte nicht angelegt werden.");
    } finally {
      setAdding(false);
    }
  }

  async function removeSlot(slotId) {
    if (!window.confirm("Diesen Slot wirklich entfernen?")) return;
    setBusyId(slotId);
    setMsg(null);
    try {
      const token = getTeamAuthToken();
      await axios.post("/api/team/roster/remove-slot", { token, slotId });
      reload?.();
    } catch (err) {
      flash("err", err.response?.data?.message || "Slot konnte nicht entfernt werden.");
    } finally {
      setBusyId(null);
    }
  }

  async function approveClaim(slotId) {
    setBusyId(slotId);
    setMsg(null);
    try {
      const token = getTeamAuthToken();
      await axios.post("/api/team/roster/approve-claim", { token, slotId });
      flash("ok", "Anspruch bestätigt.");
      reload?.();
      loadMembers();
    } catch (err) {
      flash("err", err.response?.data?.message || "Bestätigung fehlgeschlagen.");
    } finally {
      setBusyId(null);
    }
  }

  async function copyClaim(slot) {
    const link = `${origin}/team/claim/${slot.claimToken}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(slot._id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* Clipboard nicht verfügbar */
    }
  }

  function shareWhatsApp(slot) {
    const link = `${origin}/team/claim/${slot.claimToken}`;
    const text = `Du bist eingeladen, dem Kader von ${team?.teamName || "unserem Team"} beizutreten${
      slot.position ? ` (Position: ${positionLabel(slot.position)})` : ""
    }: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  async function sendInvite(slotId) {
    if (!inviteEmail.trim()) return;
    setSending(true);
    setMsg(null);
    try {
      const token = getTeamAuthToken();
      const { data } = await axios.post("/api/team/roster/send-invite-email", {
        token,
        slotId,
        email: inviteEmail,
      });
      flash("ok", data.message || "Einladung gesendet.");
      setInviteOpenId(null);
      setInviteEmail("");
    } catch (err) {
      flash("err", err.response?.data?.message || "E-Mail konnte nicht gesendet werden.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Kader <span className="text-sm font-normal text-gray-500">· {members.length} Spieler</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Lege Spieler an und lade sie per Link, WhatsApp oder E-Mail ein.
          </p>
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex flex-shrink-0 items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <FaPlus className="text-xs" /> Spieler hinzufügen
        </button>
      </div>

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

      {/* Allgemeiner Team-Einladungslink (Beitritt ohne festen Slot) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-1">
          <FaLink className="text-brand-500 text-sm" />
          <h3 className="text-sm font-semibold text-gray-900">Team-Einladungslink</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Teile diesen Link – wer ihn öffnet, kann deinem Team direkt beitreten (kein fester Slot nötig).
        </p>
        {inviteLink ? (
          <div className="flex flex-wrap items-center gap-2">
            <input
              readOnly
              value={inviteLink}
              onFocus={(e) => e.target.select()}
              className={`${inputClass} flex-1 min-w-0 bg-gray-50`}
            />
            <button
              onClick={copyInvite}
              className="inline-flex items-center gap-1.5 border border-gray-300 hover:border-brand-500 text-gray-600 rounded-lg px-3 py-2 text-xs font-medium"
            >
              {inviteCopied ? <FaCheck className="text-green-600" /> : <FaCopy />}
              {inviteCopied ? "Kopiert" : "Kopieren"}
            </button>
            <button
              onClick={shareInviteWhatsApp}
              className="inline-flex items-center gap-1.5 border border-gray-300 hover:border-green-500 hover:text-green-700 text-gray-600 rounded-lg px-3 py-2 text-xs font-medium"
            >
              <FaWhatsapp className="text-green-600" /> WhatsApp
            </button>
            <button
              onClick={generateInvite}
              disabled={generatingInvite}
              className="text-xs text-gray-400 hover:text-gray-600 underline px-1"
            >
              Neuer Link
            </button>
          </div>
        ) : (
          <button
            onClick={generateInvite}
            disabled={generatingInvite}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2 text-sm font-medium"
          >
            <FaLink className="text-xs" />
            {generatingInvite ? "Wird erstellt…" : "Einladungslink erstellen"}
          </button>
        )}
      </div>

      {/* Bestehenden Account direkt einladen */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-1">
          <FaUserPlus className="text-brand-500 text-sm" />
          <h3 className="text-sm font-semibold text-gray-900">Bestehenden Spieler einladen</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Suche einen registrierten Spieler – er wird per Glocke &amp; E-Mail gefragt und landet erst nach
          seiner Zustimmung in deinem Kader.
        </p>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Name suchen…"
            className={`${inputClass} pl-8`}
          />
        </div>
        {searchQuery.trim().length >= 2 && (
          <div className="mt-2 divide-y divide-gray-50 rounded-lg border border-gray-100">
            {searching ? (
              <p className="px-3 py-3 text-xs text-gray-400">Suche…</p>
            ) : (
              (() => {
                const list = searchResults.filter(
                  (p) => !members.some((m) => m.playerId === p.playerId)
                );
                if (list.length === 0) {
                  return (
                    <p className="px-3 py-3 text-xs text-gray-400">
                      Keine passenden Spieler gefunden.
                    </p>
                  );
                }
                return list.map((p) => {
                  const already = invitedIds.includes(p.playerId);
                  return (
                    <div
                      key={p.playerId}
                      className="flex items-center justify-between gap-2 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {[p.position, p.teamName].filter(Boolean).join(" · ") || "Vereinslos"}
                        </p>
                      </div>
                      <button
                        onClick={() => invitePlayer(p)}
                        disabled={invitingId === p.playerId || already}
                        className="flex-shrink-0 inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-3 py-1.5 text-xs font-medium"
                      >
                        {already ? <FaCheck /> : <FaUserPlus />}
                        {already ? "Eingeladen" : invitingId === p.playerId ? "…" : "Einladen"}
                      </button>
                    </div>
                  );
                });
              })()
            )}
          </div>
        )}
      </div>

      {/* Mitglieder (Account-Spieler) */}
      {members.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {members.map((m) => (
            <div key={m.playerId} className="px-5 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="h-9 w-9 flex-shrink-0 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold flex items-center justify-center">
                    {m.number ? `#${m.number}` : <FaUser className="text-sm" />}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{m.name}</p>
                    <p className="text-xs text-gray-500">{positionLabel(m.position) || "Position offen"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Rückennummer vergeben/ändern */}
                  {numberEditId === m.playerId ? (
                    <div className="flex items-center gap-1">
                      <input
                        autoFocus
                        value={numberValue}
                        onChange={(e) => setNumberValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveMemberNumber(m.playerId)}
                        maxLength={3}
                        placeholder="Nr."
                        className="w-14 rounded-lg border border-gray-300 px-2 py-1 text-sm text-gray-900 outline-none focus:border-brand-500"
                      />
                      <button
                        onClick={() => saveMemberNumber(m.playerId)}
                        disabled={numberBusyId === m.playerId}
                        className="text-green-600 hover:text-green-700 disabled:opacity-60 p-1.5"
                        title="Nummer speichern"
                      >
                        <FaCheck className="text-sm" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setNumberEditId(m.playerId);
                        setNumberValue(m.number || "");
                      }}
                      className="text-gray-400 hover:text-brand-600 p-1.5"
                      title="Rückennummer vergeben"
                    >
                      <FaHashtag className="text-sm" />
                    </button>
                  )}

                  {m.isFounder ? (
                    <span className="text-xs font-medium rounded-full px-3 py-1 bg-brand-100 text-brand-700">
                      Haupt-Admin
                    </span>
                  ) : m.isAdmin ? (
                    <span className="text-xs font-medium rounded-full px-3 py-1 bg-brand-100 text-brand-700">
                      Admin
                    </span>
                  ) : (
                    <span className="text-xs font-medium rounded-full px-3 py-1 bg-green-100 text-green-700">
                      Mitglied
                    </span>
                  )}

                  {/* Teilrechte festlegen (nur Haupt-Admin, nur für Co-Admins) */}
                  {isMainAdmin && m.isAdmin && !m.isFounder && (
                    <button
                      onClick={() =>
                        permEditId === m.playerId ? setPermEditId(null) : openPermEditor(m)
                      }
                      className={`p-1.5 ${
                        permEditId === m.playerId
                          ? "text-brand-600"
                          : "text-gray-400 hover:text-brand-600"
                      }`}
                      title="Teilrechte festlegen"
                    >
                      <FaSlidersH className="text-sm" />
                    </button>
                  )}

                  {/* Admin-Rechte vergeben/entziehen (nur Haupt-Admin) */}
                  {isMainAdmin &&
                    !m.isFounder &&
                    (m.isAdmin ? (
                      <button
                        onClick={() => setMemberAdmin(m.playerId, false, m.name)}
                        disabled={adminBusyId === m.playerId}
                        className="text-brand-600 hover:text-gray-500 disabled:opacity-60 p-1.5"
                        title="Adminrechte entziehen"
                      >
                        <FaUserSlash className="text-sm" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setMemberAdmin(m.playerId, true, m.name)}
                        disabled={adminBusyId === m.playerId}
                        className="text-gray-400 hover:text-brand-600 disabled:opacity-60 p-1.5"
                        title="Zum Admin machen"
                      >
                        <FaUserShield className="text-sm" />
                      </button>
                    ))}

                  {/* Entfernen nur für einfache Mitglieder (Admins vorher degradieren) */}
                  {!m.isFounder && !m.isAdmin && (
                    <button
                      onClick={() => removeMember(m.playerId)}
                      disabled={removingId === m.playerId}
                      className="text-gray-400 hover:text-red-600 disabled:opacity-60 p-1.5"
                      title="Aus Team entfernen"
                    >
                      <FaUserMinus className="text-sm" />
                    </button>
                  )}
                </div>
              </div>

              {/* Teilrechte-Panel (nur Haupt-Admin) */}
              {isMainAdmin && permEditId === m.playerId && (
                <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Welche Bereiche darf <strong>{m.name}</strong> verwalten?
                  </p>
                  <div className="space-y-2">
                    {TEAM_PERMISSIONS.map((p) => (
                      <label key={p.key} className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={permDraft.includes(p.key)}
                          onChange={() => togglePerm(p.key)}
                          className="mt-0.5 h-4 w-4 accent-brand-500"
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-gray-800">{p.label}</span>
                          <span className="block text-xs text-gray-500">{p.desc}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => savePerms(m.playerId)}
                      disabled={permBusyId === m.playerId}
                      className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-1.5 text-sm font-medium"
                    >
                      {permBusyId === m.playerId ? "Speichern…" : "Rechte speichern"}
                    </button>
                    <button
                      onClick={() => setPermEditId(null)}
                      className="text-sm text-gray-500 hover:text-gray-700 px-2"
                    >
                      Abbrechen
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Alle Häkchen = voller Zugriff wie der Haupt-Admin. Keine = nur ansehen.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <h3 className="text-sm font-semibold text-gray-700 pt-2">
        Einladungen &amp; offene Plätze
      </h3>

      {/* Formular: Slot hinzufügen */}
      {showAdd && (
        <form
          onSubmit={addSlot}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 grid sm:grid-cols-[1fr_140px_90px_auto] gap-3 items-end"
        >
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input
              autoFocus
              value={newSlot.name}
              onChange={(e) => setNewSlot((s) => ({ ...s, name: e.target.value }))}
              className={inputClass}
              placeholder="Spielername"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Position</label>
            <select
              value={newSlot.position}
              onChange={(e) => setNewSlot((s) => ({ ...s, position: e.target.value }))}
              className={inputClass}
            >
              <option value="">–</option>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nr.</label>
            <input
              value={newSlot.number}
              onChange={(e) => setNewSlot((s) => ({ ...s, number: e.target.value }))}
              className={inputClass}
              placeholder="#"
            />
          </div>
          <button
            type="submit"
            disabled={adding || !newSlot.name.trim()}
            className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2 text-sm font-medium h-[38px]"
          >
            {adding ? "…" : "Anlegen"}
          </button>
        </form>
      )}

      {/* Slot-Liste */}
      {slots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <p className="text-sm text-gray-500">
            Noch keine Kader-Slots. Lege Slots an, um Spieler einzuladen.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {slots.map((slot) => {
            const badge = STATUS_BADGE[slot.status] || STATUS_BADGE.empty;
            const isBusy = busyId === slot._id;
            return (
              <div key={slot._id} className="px-5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="h-9 w-9 flex-shrink-0 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold flex items-center justify-center">
                      {slot.number || "–"}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {slot.name || "Unbenannter Slot"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {positionLabel(slot.position) || "Position offen"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium rounded-full px-3 py-1 ${badge.cls}`}>
                      {badge.label}
                    </span>
                    {slot.status === "pending" && (
                      <button
                        onClick={() => approveClaim(slot._id)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg px-3 py-1.5 text-xs font-medium"
                      >
                        <FaUserCheck /> Genehmigen
                      </button>
                    )}
                    <button
                      onClick={() => removeSlot(slot._id)}
                      disabled={isBusy}
                      className="text-gray-400 hover:text-red-600 disabled:opacity-60 p-1.5"
                      title="Slot entfernen"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                </div>

                {/* Einladungs-Aktionen (nur solange nicht bestätigt) */}
                {slot.status !== "confirmed" && slot.claimToken && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 pl-12">
                    <button
                      onClick={() => copyClaim(slot)}
                      className="inline-flex items-center gap-1.5 border border-gray-300 hover:border-brand-500 text-gray-600 rounded-lg px-3 py-1.5 text-xs font-medium"
                    >
                      {copiedId === slot._id ? (
                        <FaCheck className="text-green-600" />
                      ) : (
                        <FaCopy />
                      )}
                      {copiedId === slot._id ? "Link kopiert" : "Claim-Link"}
                    </button>
                    <button
                      onClick={() => shareWhatsApp(slot)}
                      className="inline-flex items-center gap-1.5 border border-gray-300 hover:border-green-500 hover:text-green-700 text-gray-600 rounded-lg px-3 py-1.5 text-xs font-medium"
                    >
                      <FaWhatsapp className="text-green-600" /> WhatsApp
                    </button>
                    <button
                      onClick={() =>
                        setInviteOpenId((id) => (id === slot._id ? null : slot._id))
                      }
                      className="inline-flex items-center gap-1.5 border border-gray-300 hover:border-brand-500 text-gray-600 rounded-lg px-3 py-1.5 text-xs font-medium"
                    >
                      <FaEnvelope /> Per E-Mail einladen
                    </button>

                    {inviteOpenId === slot._id && (
                      <div className="flex items-center gap-2 w-full mt-2">
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className={inputClass}
                          placeholder="spieler@beispiel.de"
                        />
                        <button
                          onClick={() => sendInvite(slot._id)}
                          disabled={sending || !inviteEmail.trim()}
                          className="flex-shrink-0 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2 text-sm font-medium"
                        >
                          {sending ? "…" : "Senden"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
