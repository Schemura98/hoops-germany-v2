"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getTeamAuthToken } from "@/lib/useCurrentTeam";

// ---------------------------------------------------------------------------
// „Was ist zu tun?" – die offenen Aufgaben eines Team-Admins, aus Daten, die
// die Seite ohnehin schon lädt.
//
// Hintergrund (Ronjas Befund R3, docs/RETENTION-BEFUND-2026-08-13.md): Ein
// Team-Admin kommt nicht zum Stöbern, er kommt, um etwas zu erledigen. Die
// Tab-Leiste von /team/admin trug bisher keine einzige Zahl – ob unter
// „Anfragen" jemand wartet und ob unter „Ergebnisse" etwas fehlt, erfuhr er
// nur, indem er beide Tabs anklickt.
//
// ⚠️ Jede Zahl hier muss zählen, was ihre Beschriftung behauptet
// (docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md). Deshalb sind die Definitionen
// unten einzeln kommentiert – und deshalb sind „Ergebnis fehlt" und
// „Box-Score fehlt" ÜBERSCHNEIDUNGSFREI: solange das Ergebnis fehlt, ist der
// Box-Score nicht die nächste Aufgabe, sondern die übernächste.
// ---------------------------------------------------------------------------

const LEER = {
  anfragen: 0,
  kaderFreigabe: 0,
  ergebnisFehlt: 0,
  widerspruch: 0,
  boxscoreFehlt: 0,
  naechstesSpiel: null,
  proTab: { kader: 0, anfragen: 0, ergebnisse: 0 },
  gesamt: 0,
};

// Die eigene bzw. gegnerische Meldung eines Spiels.
function eigeneMeldung(match, teamId) {
  return String(match.teamA?._id || match.teamA) === String(teamId)
    ? match.teamAResult
    : match.teamBResult;
}

function gegner(match, teamId) {
  return String(match.teamA?._id || match.teamA) === String(teamId)
    ? match.teamB
    : match.teamA;
}

// Hat unser Team für dieses Spiel überhaupt einen Wert erfasst? Der
// Statistik-Editor schickt IMMER den ganzen Kader mit – eine 0/0/0-Zeile heißt
// „noch nicht eingetragen", nicht „hat nichts gemacht" (gleiche Regel wie in
// lib/statsNotify.js, damit Anzeige und Versand dasselbe meinen).
function hatBoxscore(match, teamId) {
  return (match.playerStats || []).some(
    (s) =>
      String(s.team) === String(teamId) &&
      !s.didNotPlay &&
      (s.points || 0) + (s.assists || 0) + (s.rebounds || 0) > 0
  );
}

export function berechneAufgaben({ team, matches, teamId, anzahlAnfragen, jetzt = Date.now() }) {
  const a = { ...LEER, proTab: { ...LEER.proTab } };

  // 1. Beitrittsanfragen: /api/team/fetchjoinrequests liefert ausschließlich
  //    Spieler mit offenem `teamJoinRequest` – erledigte sind nicht dabei.
  a.anfragen = anzahlAnfragen || 0;

  // 2. Kader: ein Spieler hat einen Platz beansprucht und wartet auf die
  //    Freigabe („Genehmigen" im Kader-Tab). Nur `pending` ist eine Aufgabe.
  a.kaderFreigabe = (team?.rosterSlots || []).filter((s) => s.status === "pending").length;

  let naechstes = null;
  for (const m of matches || []) {
    if (m.status === "cancelled") continue;
    const zeit = new Date(m.date).getTime();

    if (zeit > jetzt) {
      if (!naechstes || zeit < new Date(naechstes.date).getTime()) naechstes = m;
      continue; // Ein Spiel, das noch nicht stattfand, ist keine Aufgabe.
    }

    // 3. Widerspruch: beide Teams haben gemeldet, die Angaben passen nicht.
    //    Das ist eine Aufgabe für beide Seiten.
    if (m.resultStatus === "mismatch") {
      a.widerspruch += 1;
      continue;
    }

    const eigen = eigeneMeldung(m, teamId);
    const eigenGemeldet = eigen?.ownPoints != null;

    // 4. Ergebnis fehlt: unser Team hat nicht gemeldet UND es liegt auch sonst
    //    kein bestätigtes Ergebnis vor. Die zweite Bedingung schützt vor dem
    //    Fall, dass ein Super-Admin das Ergebnis nachgetragen hat – dann steht
    //    es zwar da, aber ohne unsere Meldung. „Fehlt" wäre dort falsch.
    if (!eigenGemeldet && m.resultStatus !== "confirmed") {
      a.ergebnisFehlt += 1;
      continue;
    }

    // 5. Box-Score fehlt: das Ergebnis steht, die Spielerwerte nicht. Genau
    //    diese Eingabe löst die Benachrichtigung an die Spieler aus
    //    (lib/statsNotify.js) – sie ist die Arbeit mit dem sichtbarsten Ertrag.
    if (!hatBoxscore(m, teamId)) a.boxscoreFehlt += 1;
  }

  a.naechstesSpiel = naechstes
    ? { date: naechstes.date, gegner: gegner(naechstes, teamId)?.teamName || null }
    : null;

  a.proTab = {
    kader: a.kaderFreigabe,
    anfragen: a.anfragen,
    ergebnisse: a.ergebnisFehlt + a.widerspruch + a.boxscoreFehlt,
  };
  a.gesamt = a.proTab.kader + a.proTab.anfragen + a.proTab.ergebnisse;
  return a;
}

/**
 * Lädt die offenen Aufgaben des eigenen Teams.
 * Nutzt ausschließlich bestehende Endpunkte (keine API-Änderung nötig).
 */
export function useTeamAufgaben(team) {
  const [aufgaben, setAufgaben] = useState(LEER);
  const [status, setStatus] = useState("loading");

  const laden = useCallback(async () => {
    const token = getTeamAuthToken();
    if (!token || !team?._id) return;
    setStatus("loading");
    try {
      const [matchRes, anfrageRes] = await Promise.all([
        axios.post("/api/team/matches/list", { token }),
        axios.post("/api/team/fetchjoinrequests", { token }),
      ]);
      setAufgaben(
        berechneAufgaben({
          team,
          matches: matchRes.data.matches || [],
          teamId: matchRes.data.teamId,
          anzahlAnfragen: (anfrageRes.data.requests || []).length,
        })
      );
      setStatus("ready");
    } catch {
      // Kein Alarm: Die Aufgabenleiste ist eine Zugabe. Fällt sie aus, bleibt
      // das Panel vollständig bedienbar – wir behaupten dann nur nichts.
      setStatus("error");
    }
  }, [team]);

  useEffect(() => {
    let aktiv = true;
    (async () => {
      if (!aktiv) return;
      await laden();
    })();
    return () => {
      aktiv = false;
    };
  }, [laden]);

  return { aufgaben, status, reload: laden };
}
