"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  PiPlusBold,
  PiTrashBold,
  PiMapPinBold,
  PiUsersBold,
  PiCaretDownBold,
  PiMegaphoneBold,
} from "react-icons/pi";
import { getTeamAuthToken } from "@/lib/useCurrentTeam";
import { POSITIONS, positionLabel } from "@/lib/constants";
import ConfirmAction from "@/components/ui/ConfirmAction";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import TabAlert from "@/components/team/tabs/TabAlert";
import { inputClassSm } from "@/lib/ui";

function formatDate(d) {
  try {
    return new Date(d).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function TryoutsTab() {
  const [tryouts, setTryouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    date: "",
    location: "",
    positions: [],
    description: "",
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const token = getTeamAuthToken();
    const { data } = await axios.post("/api/tryouts/my-tryouts", { token });
    setTryouts(data.tryouts || []);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await load();
      } catch {
        if (active) setMsg({ type: "err", text: "Tryouts konnten nicht geladen werden." });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [load]);

  function togglePosition(p) {
    setForm((f) => ({
      ...f,
      positions: f.positions.includes(p)
        ? f.positions.filter((x) => x !== p)
        : [...f.positions, p],
    }));
  }

  async function create(e) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    try {
      const token = getTeamAuthToken();
      await axios.post("/api/tryouts/create", { token, ...form });
      setForm({ date: "", location: "", positions: [], description: "" });
      setShowAdd(false);
      await load();
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || "Tryout konnte nicht angelegt werden." });
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(tryout) {
    setBusyId(tryout._id);
    setMsg(null);
    try {
      const token = getTeamAuthToken();
      await axios.patch("/api/tryouts/my-tryouts", {
        token,
        tryoutId: tryout._id,
        status: tryout.status === "active" ? "closed" : "active",
      });
      await load();
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || "Status konnte nicht geändert werden." });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(tryoutId) {
    setBusyId(tryoutId);
    setMsg(null);
    try {
      const token = getTeamAuthToken();
      await axios.delete("/api/tryouts/my-tryouts", { data: { token, tryoutId } });
      await load();
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || "Tryout konnte nicht entfernt werden." });
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <Loading className="py-12" size="text-2xl" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-paper-50">
          Tryouts <span className="text-sm font-normal text-mist-400">· {tryouts.length}</span>
        </h2>
        <Button
          onClick={() => setShowAdd((v) => !v)}
          aria-expanded={showAdd}
          className="flex-shrink-0"
        >
          <PiPlusBold className="text-xs" /> Tryout ausschreiben
        </Button>
      </div>

      <TabAlert msg={msg} />

      {showAdd && (
        <form
          onSubmit={create}
          className="bg-navy-800 rounded-md border border-navy-600 p-4 space-y-3"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-mist-400 mb-1">Datum & Uhrzeit</label>
              <input
                type="datetime-local"
                required
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className={inputClassSm}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-mist-400 mb-1">Ort</label>
              <input
                required
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className={inputClassSm}
                placeholder="z.B. Sporthalle Mitte"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-mist-400 mb-1">
              Gesuchte Positionen
            </label>
            <div className="flex flex-wrap gap-2">
              {POSITIONS.map((p) => {
                const active = form.positions.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePosition(p)}
                    className={`rounded-sm px-3 py-1.5 text-sm font-medium border transition-colors ${
                      active
                        ? "bg-brand-500 border-brand-500 text-navy-950"
                        : "border-navy-600 text-mist-400 hover:border-brand-500"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-mist-400 mb-1">
              Beschreibung <span className="text-mist-400">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className={`${inputClassSm} resize-none`}
              placeholder="Worauf achtet ihr, was sollten Bewerber mitbringen?"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving || !form.date || !form.location.trim()}
              className="px-6"
            >
              {saving ? "Speichern…" : "Ausschreiben"}
            </Button>
          </div>
        </form>
      )}

      {tryouts.length === 0 ? (
        <EmptyState
          icon={PiMegaphoneBold}
          title="Noch keine Tryouts ausgeschrieben"
          text="Lege das erste an – es erscheint dann öffentlich unter /tryouts, damit Spieler sich bewerben können."
          action={
            !showAdd && (
              <Button onClick={() => setShowAdd(true)}>
                <PiPlusBold className="text-xs" /> Tryout ausschreiben
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {tryouts.map((t) => {
            const applicants = (t.applicants || []).filter((a) => a.playerId);
            const isExpanded = expandedId === t._id;
            return (
              <div
                key={t._id}
                className="bg-navy-800 rounded-md border border-navy-600 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-paper-50">{formatDate(t.date)}</p>
                    <p className="text-xs text-mist-400 flex items-center gap-1 mt-0.5">
                      <PiMapPinBold /> {t.location}
                    </p>
                    {t.positions?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {t.positions.map((p) => (
                          <span
                            key={p}
                            className="text-xs font-medium bg-brand-500/10 text-brand-400 rounded-sm px-2 py-0.5"
                          >
                            {positionLabel(p)}
                          </span>
                        ))}
                      </div>
                    )}
                    {t.description && (
                      <p className="text-sm text-mist-400 mt-2">{t.description}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span
                      className={`text-xs font-medium rounded-full px-3 py-1 ${
                        t.status === "active"
                          ? "bg-signal-ok/15 text-signal-ok"
                          : "bg-navy-700 text-mist-400"
                      }`}
                    >
                      {t.status === "active" ? "Aktiv" : "Geschlossen"}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => toggleStatus(t)}
                        disabled={busyId === t._id}
                      >
                        {t.status === "active" ? "Schließen" : "Öffnen"}
                      </Button>
                      <ConfirmAction
                        trigger={({ onClick }) => (
                          <button
                            onClick={onClick}
                            disabled={busyId === t._id}
                            className="text-mist-400 hover:text-signal-error disabled:opacity-60 p-1.5"
                            title="Tryout entfernen"
                            aria-label={`Tryout am ${formatDate(t.date)} entfernen`}
                          >
                            <PiTrashBold className="text-sm" />
                          </button>
                        )}
                        message="Dieses Tryout wirklich entfernen?"
                        confirmLabel="Entfernen"
                        busy={busyId === t._id}
                        onConfirm={() => remove(t._id)}
                      />
                    </div>
                  </div>
                </div>

                {/* Bewerber */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : t._id)}
                  aria-expanded={isExpanded}
                  className="mt-3 inline-flex items-center gap-2 text-sm text-mist-400 hover:text-brand-400"
                >
                  <PiUsersBold />
                  {applicants.length} Bewerber
                  {applicants.length > 0 && (
                    <PiCaretDownBold
                      className={`text-xs transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                {isExpanded && applicants.length > 0 && (
                  <ul className="mt-2 divide-y divide-navy-600 border-t border-navy-600">
                    {applicants.map((a) => (
                      <li key={a._id} className="flex items-center gap-3 py-2">
                        {a.playerId.profileImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={a.playerId.profileImage}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="h-8 w-8 rounded-full bg-brand-500/15 text-brand-400 text-xs font-semibold flex items-center justify-center">
                            {(a.playerId.firstName?.[0] || "") + (a.playerId.lastName?.[0] || "")}
                          </span>
                        )}
                        <div>
                          <p className="text-sm font-medium text-paper-50">
                            {a.playerId.firstName} {a.playerId.lastName}
                          </p>
                          <p className="text-xs text-mist-400">
                            {positionLabel(a.playerId.position) || "Position offen"}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
