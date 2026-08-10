"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  FaPlus,
  FaTrash,
  FaMapMarkerAlt,
  FaUsers,
  FaChevronDown,
  FaBasketballBall,
} from "react-icons/fa";
import { getTeamAuthToken } from "@/lib/useCurrentTeam";
import { POSITIONS, positionLabel } from "@/lib/constants";
import ConfirmAction from "@/components/ui/ConfirmAction";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <FaBasketballBall className="text-brand-500 text-2xl animate-bounce" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Tryouts <span className="text-sm font-normal text-gray-500">· {tryouts.length}</span>
        </h2>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <FaPlus className="text-xs" /> Tryout ausschreiben
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

      {showAdd && (
        <form
          onSubmit={create}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Datum & Uhrzeit</label>
              <input
                type="datetime-local"
                required
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ort</label>
              <input
                required
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className={inputClass}
                placeholder="z.B. Sporthalle Mitte"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
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
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium border transition-colors ${
                      active
                        ? "bg-brand-500 border-brand-500 text-white"
                        : "border-gray-300 text-gray-600 hover:border-brand-500"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Beschreibung <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className={`${inputClass} resize-none`}
              placeholder="Worauf achtet ihr, was sollten Bewerber mitbringen?"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || !form.date || !form.location.trim()}
              className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-6 py-2 text-sm font-medium"
            >
              {saving ? "Speichern…" : "Ausschreiben"}
            </button>
          </div>
        </form>
      )}

      {tryouts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <p className="text-sm text-gray-500">
            Noch keine Tryouts ausgeschrieben. Lege das erste an, um Bewerber zu finden.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tryouts.map((t) => {
            const applicants = (t.applicants || []).filter((a) => a.playerId);
            const isExpanded = expandedId === t._id;
            return (
              <div
                key={t._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{formatDate(t.date)}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <FaMapMarkerAlt /> {t.location}
                    </p>
                    {t.positions?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {t.positions.map((p) => (
                          <span
                            key={p}
                            className="text-xs font-medium bg-brand-50 text-brand-700 rounded-full px-2 py-0.5"
                          >
                            {positionLabel(p)}
                          </span>
                        ))}
                      </div>
                    )}
                    {t.description && (
                      <p className="text-sm text-gray-600 mt-2">{t.description}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span
                      className={`text-xs font-medium rounded-full px-3 py-1 ${
                        t.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {t.status === "active" ? "Aktiv" : "Geschlossen"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(t)}
                        disabled={busyId === t._id}
                        className="text-xs border border-gray-300 hover:border-brand-500 text-gray-600 rounded-lg px-3 py-1.5 disabled:opacity-60"
                      >
                        {t.status === "active" ? "Schließen" : "Öffnen"}
                      </button>
                      <ConfirmAction
                        trigger={({ onClick }) => (
                          <button
                            onClick={onClick}
                            disabled={busyId === t._id}
                            className="text-gray-500 hover:text-red-600 disabled:opacity-60 p-1.5"
                            title="Tryout entfernen"
                          >
                            <FaTrash className="text-sm" />
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
                  className="mt-3 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand-600"
                >
                  <FaUsers />
                  {applicants.length} Bewerber
                  {applicants.length > 0 && (
                    <FaChevronDown
                      className={`text-xs transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                {isExpanded && applicants.length > 0 && (
                  <ul className="mt-2 divide-y divide-gray-100 border-t border-gray-100">
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
                          <span className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold flex items-center justify-center">
                            {(a.playerId.firstName?.[0] || "") + (a.playerId.lastName?.[0] || "")}
                          </span>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {a.playerId.firstName} {a.playerId.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
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
