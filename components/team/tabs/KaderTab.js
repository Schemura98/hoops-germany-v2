"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  PiIdentificationBadgeBold,
  PiTrashBold,
  PiCopyBold,
  PiCheckBold,
  PiEnvelopeSimpleBold,
  PiUserCheckBold,
  PiUserMinusBold,
  PiUserBold,
  PiWhatsappLogoBold,
  PiUserGearBold,
  PiProhibitBold,
  PiLinkBold,
  PiHashBold,
  PiSlidersHorizontalBold,
  PiMagnifyingGlassBold,
  PiUserPlusBold,
  PiCaretDownBold,
} from "react-icons/pi";
import { getTeamAuthToken } from "@/lib/useCurrentTeam";
import { POSITIONS, positionLabel } from "@/lib/constants";
import { TEAM_PERMISSIONS } from "@/lib/teamPermissions";
import ConfirmAction from "@/components/ui/ConfirmAction";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import TabAlert from "@/components/team/tabs/TabAlert";
import { inputClassSm, inputClassStat } from "@/lib/ui";

const STATUS_BADGE = {
  empty: { label: "Frei", cls: "bg-navy-700 text-mist-400" },
  pending: { label: "Ausstehend", cls: "bg-signal-wait/15 text-signal-wait" },
  confirmed: { label: "Bestätigt", cls: "bg-signal-ok/15 text-signal-ok" },
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

  // Weitere Einlade-Wege sind eingeklappt – der Kader-Tab soll führen statt drei
  // gleichwertige Optionen nebeneinanderzustellen (Design-Review Welle 2b).
  const [moreOpen, setMoreOpen] = useState(false);

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

  async function setMemberAdmin(playerId, makeAdmin) {
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

  // Neuen Spieler anlegen (Slot)
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
      flash("ok", "Platz angelegt – schick den persönlichen Link unten an den Spieler.");
      reload?.();
    } catch (err) {
      flash("err", err.response?.data?.message || "Slot konnte nicht angelegt werden.");
    } finally {
      setAdding(false);
    }
  }

  async function removeSlot(slotId) {
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
      <div>
        <h2 className="text-lg font-semibold text-paper-50">
          Kader <span className="text-sm font-normal text-mist-400">· {members.length} Spieler</span>
        </h2>
        <p className="text-xs text-mist-400 mt-0.5">
          So holst du jemanden in dein Team:
        </p>
      </div>

      <TabAlert msg={msg} />

      {/* 1) Bestehenden Account direkt einladen – der häufigste Fall, deshalb
          optisch führend (Welle 2b: vorher drei gleichwertige Blöcke ohne Führung). */}
      <div className="bg-navy-800 rounded-md border-2 border-brand-500/50 p-5">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <PiUserPlusBold className="text-brand-400" />
          <h3 className="text-base font-semibold text-paper-50">Bestehenden Spieler einladen</h3>
          <span className="ml-auto flex-shrink-0 rounded-sm bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-400">
            Schnellster Weg
          </span>
        </div>
        <p className="text-xs text-mist-400 mb-3">
          Er ist <strong>schon bei Hoops Germany registriert?</strong> Such ihn und lade ihn ein – er wird
          per Glocke &amp; E-Mail gefragt und ist nach seiner Zustimmung im Kader (mit Karriere-Eintrag).
        </p>
        <div className="relative">
          <PiMagnifyingGlassBold className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-500 text-xs" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Name suchen…"
            aria-label="Registrierten Spieler nach Namen suchen"
            className={`${inputClassSm} pl-8`}
          />
        </div>
        {searchQuery.trim().length >= 2 && (
          <div className="mt-2 divide-y divide-navy-600 rounded-sm border border-navy-600">
            {searching ? (
              <p className="px-3 py-3 text-xs text-mist-400">Suche…</p>
            ) : (
              (() => {
                const list = searchResults.filter(
                  (p) => !members.some((m) => m.playerId === p.playerId)
                );
                if (list.length === 0) {
                  return (
                    <p className="px-3 py-3 text-xs text-mist-400">
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
                        <p className="text-sm font-medium text-paper-50 truncate">{p.name}</p>
                        <p className="text-xs text-mist-400 truncate">
                          {[p.position, p.teamName].filter(Boolean).join(" · ") || "Vereinslos"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => invitePlayer(p)}
                        disabled={invitingId === p.playerId || already}
                        className="flex-shrink-0"
                      >
                        {already ? <PiCheckBold /> : <PiUserPlusBold />}
                        {already ? "Eingeladen" : invitingId === p.playerId ? "…" : "Einladen"}
                      </Button>
                    </div>
                  );
                });
              })()
            )}
          </div>
        )}
      </div>

      {/* Weitere Wege – eingeklappt, damit oben ein klarer Standardweg führt.
          ACHTUNG: Der allgemeine Team-Einladungslink lebt seit Welle 2a NUR hier
          (Einstellungen verlinkt hierher) – beim Umbauen nicht entfernen. */}
      <div className="bg-navy-800 rounded-md border border-navy-600 overflow-hidden">
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
          className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-navy-700 transition-colors"
        >
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-paper-50">Weitere Optionen</span>
            <span className="block text-xs text-mist-400">
              Spieler ohne Account anlegen · Einladungslink für alle
            </span>
          </span>
          <PiCaretDownBold
            className={`text-mist-600 flex-shrink-0 transition-transform ${
              moreOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {moreOpen && (
          <div className="border-t border-navy-600 divide-y divide-navy-600">
      {/* 2) Neuen Spieler anlegen (Account-Platz + persönlicher Einladungslink) */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-1">
          <PiIdentificationBadgeBold className="text-brand-400 text-sm" />
          <h3 className="text-sm font-semibold text-paper-50">Neuen Spieler anlegen</h3>
        </div>
        <p className="text-xs text-mist-400 mb-3">
          Er hat <strong>noch keinen Account?</strong> Leg ihm hier einen Platz an – du erhältst seinen
          <strong> persönlichen Einladungslink</strong>, den du ihm per Kopieren, WhatsApp oder E-Mail schickst.
          Er registriert sich darüber und ist sofort im Kader. (Erscheint unten unter „Eingeladene &amp; offene Plätze“.)
        </p>
        <form
          onSubmit={addSlot}
          className="grid sm:grid-cols-[1fr_140px_90px_auto] gap-3 items-end"
        >
          <div>
            <label className="block text-xs font-medium text-mist-400 mb-1">Name</label>
            <input
              value={newSlot.name}
              onChange={(e) => setNewSlot((s) => ({ ...s, name: e.target.value }))}
              className={inputClassSm}
              placeholder="Spielername"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-mist-400 mb-1">Position</label>
            <select
              value={newSlot.position}
              onChange={(e) => setNewSlot((s) => ({ ...s, position: e.target.value }))}
              className={inputClassSm}
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
            <label className="block text-xs font-medium text-mist-400 mb-1">Nr.</label>
            <input
              value={newSlot.number}
              onChange={(e) => setNewSlot((s) => ({ ...s, number: e.target.value }))}
              className={inputClassSm}
              placeholder="#"
            />
          </div>
          <Button type="submit" disabled={adding || !newSlot.name.trim()} className="h-[38px]">
            {adding ? "…" : "Anlegen"}
          </Button>
        </form>
      </div>

      {/* 3) Allgemeiner Team-Einladungslink (für alle, Selbst-Beitritt) */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-1">
          <PiLinkBold className="text-brand-400 text-sm" />
          <h3 className="text-sm font-semibold text-paper-50">Team-Einladungslink (für alle)</h3>
        </div>
        <p className="text-xs text-mist-400 mb-3">
          <strong>Ein Link für alle:</strong> teile ihn z.&nbsp;B. in eurer WhatsApp-Gruppe. Jeder erstellt sich
          selbst einen Account und ist über den Link <strong>automatisch im Team</strong>.
        </p>
        {inviteLink ? (
          <div className="flex flex-wrap items-center gap-2">
            <input
              readOnly
              value={inviteLink}
              onFocus={(e) => e.target.select()}
              aria-label="Team-Einladungslink"
              className={`${inputClassSm} flex-1 min-w-0 bg-navy-950`}
            />
            <Button variant="secondary" size="sm" onClick={copyInvite}>
              {inviteCopied ? <PiCheckBold className="text-signal-ok" /> : <PiCopyBold />}
              {inviteCopied ? "Kopiert" : "Kopieren"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={shareInviteWhatsApp}
              className="hover:border-signal-ok hover:text-signal-ok"
            >
              <PiWhatsappLogoBold className="text-signal-ok" /> WhatsApp
            </Button>
            <ConfirmAction
              trigger={({ onClick }) => (
                <button
                  onClick={onClick}
                  disabled={generatingInvite}
                  className="text-xs text-mist-400 hover:text-paper-50 transition-colors underline px-1 disabled:opacity-60"
                >
                  Neuer Link
                </button>
              )}
              message="Der alte Link wird sofort ungültig – bereits verschickte Links funktionieren dann nicht mehr. Trotzdem neu erstellen?"
              confirmLabel="Neu erstellen"
              busy={generatingInvite}
              onConfirm={generateInvite}
            />
          </div>
        ) : (
          <Button onClick={generateInvite} disabled={generatingInvite}>
            <PiLinkBold className="text-xs" />
            {generatingInvite ? "Wird erstellt…" : "Einladungslink erstellen"}
          </Button>
        )}
      </div>
          </div>
        )}
      </div>

      {/* Mitglieder (Account-Spieler) */}
      {members.length > 0 && (
        <div className="bg-navy-800 rounded-md border border-navy-600 divide-y divide-navy-600">
          {members.map((m) => (
            <div key={m.playerId} className="px-5 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="h-9 w-9 flex-shrink-0 rounded-full bg-brand-500/15 text-brand-400 text-sm font-semibold flex items-center justify-center">
                    {m.number ? `#${m.number}` : <PiUserBold className="text-sm" />}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-paper-50 truncate">{m.name}</p>
                    <p className="text-xs text-mist-400">{positionLabel(m.position) || "Position offen"}</p>
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
                        aria-label={`Rückennummer für ${m.name}`}
                        className={`w-14 ${inputClassStat}`}
                      />
                      <button
                        onClick={() => saveMemberNumber(m.playerId)}
                        disabled={numberBusyId === m.playerId}
                        className="text-signal-ok hover:brightness-125 transition-[filter] disabled:opacity-60 p-1.5"
                        title="Nummer speichern"
                        aria-label={`Rückennummer für ${m.name} speichern`}
                      >
                        <PiCheckBold className="text-sm" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setNumberEditId(m.playerId);
                        setNumberValue(m.number || "");
                      }}
                      className="text-mist-400 hover:text-brand-400 p-1.5"
                      title="Rückennummer vergeben"
                      aria-label={`Rückennummer für ${m.name} vergeben`}
                    >
                      <PiHashBold className="text-sm" />
                    </button>
                  )}

                  {m.isFounder ? (
                    <span className="text-xs font-medium rounded-sm px-3 py-1 bg-brand-500/15 text-brand-400">
                      Haupt-Admin
                    </span>
                  ) : m.isAdmin ? (
                    <span className="text-xs font-medium rounded-sm px-3 py-1 bg-brand-500/15 text-brand-400">
                      Admin
                    </span>
                  ) : (
                    <span className="text-xs font-medium rounded-sm px-3 py-1 bg-signal-ok/15 text-signal-ok">
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
                          ? "text-brand-400"
                          : "text-mist-400 hover:text-brand-400"
                      }`}
                      title="Teilrechte festlegen"
                      aria-label={`Teilrechte für ${m.name} festlegen`}
                      aria-expanded={permEditId === m.playerId}
                    >
                      <PiSlidersHorizontalBold className="text-sm" />
                    </button>
                  )}

                  {/* Admin-Rechte vergeben/entziehen (nur Haupt-Admin) */}
                  {isMainAdmin &&
                    !m.isFounder &&
                    (m.isAdmin ? (
                      <ConfirmAction
                        trigger={({ onClick }) => (
                          <button
                            onClick={onClick}
                            disabled={adminBusyId === m.playerId}
                            className="text-brand-400 hover:text-mist-400 disabled:opacity-60 p-1.5"
                            title="Adminrechte entziehen"
                            aria-label={`${m.name} die Adminrechte entziehen`}
                          >
                            <PiProhibitBold className="text-sm" />
                          </button>
                        )}
                        message={`${m.name} die Adminrechte entziehen?`}
                        confirmLabel="Entziehen"
                        busy={adminBusyId === m.playerId}
                        onConfirm={() => setMemberAdmin(m.playerId, false)}
                      />
                    ) : (
                      <ConfirmAction
                        trigger={({ onClick }) => (
                          <button
                            onClick={onClick}
                            disabled={adminBusyId === m.playerId}
                            className="text-mist-400 hover:text-brand-400 disabled:opacity-60 p-1.5"
                            title="Zum Admin machen"
                            aria-label={`${m.name} zum Team-Admin machen`}
                          >
                            <PiUserGearBold className="text-sm" />
                          </button>
                        )}
                        message={`${m.name} zum Team-Admin machen? Die Person kann dann Kader, Spiele & Ergebnisse verwalten.`}
                        confirmLabel="Zum Admin machen"
                        confirmVariant="primary"
                        busy={adminBusyId === m.playerId}
                        onConfirm={() => setMemberAdmin(m.playerId, true)}
                      />
                    ))}

                  {/* Entfernen nur für einfache Mitglieder (Admins vorher degradieren) */}
                  {!m.isFounder && !m.isAdmin && (
                    <ConfirmAction
                      trigger={({ onClick }) => (
                        <button
                          onClick={onClick}
                          disabled={removingId === m.playerId}
                          className="text-mist-400 hover:text-signal-error disabled:opacity-60 p-1.5"
                          title="Aus Team entfernen"
                          aria-label={`${m.name} aus dem Team entfernen`}
                        >
                          <PiUserMinusBold className="text-sm" />
                        </button>
                      )}
                      message={`${m.name} wirklich aus dem Team entfernen?`}
                      confirmLabel="Entfernen"
                      busy={removingId === m.playerId}
                      onConfirm={() => removeMember(m.playerId)}
                    />
                  )}
                </div>
              </div>

              {/* Teilrechte-Panel (nur Haupt-Admin) */}
              {isMainAdmin && permEditId === m.playerId && (
                <div className="mt-3 rounded-md border border-navy-600 bg-navy-950 p-4">
                  <p className="text-sm font-medium text-mist-300 mb-2">
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
                          <span className="block text-sm font-medium text-paper-50">{p.label}</span>
                          <span className="block text-xs text-mist-400">{p.desc}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => savePerms(m.playerId)}
                      disabled={permBusyId === m.playerId}
                    >
                      {permBusyId === m.playerId ? "Speichern…" : "Rechte speichern"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setPermEditId(null)}>
                      Abbrechen
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-mist-400">
                    Alle Häkchen = voller Zugriff wie der Haupt-Admin. Keine = nur ansehen.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <h3 className="text-sm font-semibold text-mist-300 pt-2">
        Eingeladene &amp; offene Plätze
      </h3>

      {/* Slot-Liste (über „Neuen Spieler anlegen" erstellt) */}
      {slots.length === 0 ? (
        <EmptyState
          icon={PiIdentificationBadgeBold}
          title="Noch keine offenen Plätze"
          text="Über „Neuen Spieler anlegen“ legst du jemandem ohne Account einen Platz an – sein persönlicher Einladungslink erscheint dann hier."
          action={
            <Button variant="secondary" onClick={() => setMoreOpen(true)}>
              <PiIdentificationBadgeBold className="text-xs" /> Neuen Spieler anlegen
            </Button>
          }
        />
      ) : (
        <div className="bg-navy-800 rounded-md border border-navy-600 divide-y divide-navy-600">
          {slots.map((slot) => {
            const badge = STATUS_BADGE[slot.status] || STATUS_BADGE.empty;
            const isBusy = busyId === slot._id;
            return (
              <div key={slot._id} className="px-5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="h-9 w-9 flex-shrink-0 rounded-full bg-brand-500/15 text-brand-400 text-sm font-semibold flex items-center justify-center">
                      {slot.number || "–"}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-paper-50 truncate">
                        {slot.name || "Unbenannter Slot"}
                      </p>
                      <p className="text-xs text-mist-400">
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
                        aria-label={`Anspruch auf den Platz von ${slot.name || "diesem Slot"} genehmigen`}
                        className="inline-flex items-center gap-1.5 bg-signal-ok hover:brightness-110 disabled:opacity-60 text-paper-50 rounded-sm px-3 py-1.5 text-xs font-medium"
                      >
                        <PiUserCheckBold /> Genehmigen
                      </button>
                    )}
                    <ConfirmAction
                      trigger={({ onClick }) => (
                        <button
                          onClick={onClick}
                          disabled={isBusy}
                          className="text-mist-400 hover:text-signal-error disabled:opacity-60 p-1.5"
                          title="Slot entfernen"
                          aria-label={`Platz von ${slot.name || "unbenanntem Slot"} entfernen`}
                        >
                          <PiTrashBold className="text-sm" />
                        </button>
                      )}
                      message={`Den Platz von ${slot.name || "diesem Slot"} wirklich entfernen? Der persönliche Einladungslink wird damit ungültig.`}
                      confirmLabel="Entfernen"
                      busy={isBusy}
                      onConfirm={() => removeSlot(slot._id)}
                    />
                  </div>
                </div>

                {/* Einladungs-Aktionen (nur solange nicht bestätigt).
                    Die Bedingung hing früher zusätzlich an `slot.claimToken` –
                    ein freigegebener Platz (Token gelöscht, siehe
                    lib/rosterSlots.js) zeigte dadurch ÜBERHAUPT keinen Knopf
                    mehr, und der Admin konnte ihn nur löschen und neu anlegen.
                    Genau der Umweg, den die Freigabe beseitigen sollte
                    (Fund von Kai, 13.08.2026).
                    Jetzt getrennt: „Per E-Mail einladen" geht immer, weil
                    send-invite-email bei fehlendem Token selbst eines erzeugt.
                    Link-Kopieren und WhatsApp brauchen ein vorhandenes Token –
                    einen Link anzubieten, den es nicht gibt, wäre schlimmer
                    als der fehlende Knopf. */}
                {slot.status !== "confirmed" && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 pl-12">
                    {slot.claimToken && (
                    <>
                    <Button variant="secondary" size="sm" onClick={() => copyClaim(slot)}>
                      {copiedId === slot._id ? (
                        <PiCheckBold className="text-signal-ok" />
                      ) : (
                        <PiCopyBold />
                      )}
                      {copiedId === slot._id ? "Link kopiert" : "Claim-Link"}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => shareWhatsApp(slot)}
                      className="hover:border-signal-ok hover:text-signal-ok"
                    >
                      <PiWhatsappLogoBold className="text-signal-ok" /> WhatsApp
                    </Button>
                    </>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      aria-expanded={inviteOpenId === slot._id}
                      onClick={() =>
                        setInviteOpenId((id) => (id === slot._id ? null : slot._id))
                      }
                    >
                      <PiEnvelopeSimpleBold /> Per E-Mail einladen
                    </Button>

                    {inviteOpenId === slot._id && (
                      <div className="flex items-center gap-2 w-full mt-2">
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className={inputClassSm}
                          aria-label={`E-Mail-Adresse für die Einladung von ${slot.name || "diesem Spieler"}`}
                          placeholder="spieler@beispiel.de"
                        />
                        <Button
                          onClick={() => sendInvite(slot._id)}
                          disabled={sending || !inviteEmail.trim()}
                          className="flex-shrink-0"
                        >
                          {sending ? "…" : "Senden"}
                        </Button>
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
