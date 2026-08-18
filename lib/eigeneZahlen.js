import Match from "@/models/Match";

// Hängt an Ergebnis-Beiträge die Werte des BETRACHTERS aus dem Box-Score.
//
// WARUM ES DAS GIBT (18.08.2026, Gestaltungsvorschlag „Der Feed als Anzeigetafel")
// Der Feed zeigte Ereignisse, die sehr verschieden sind, in genau einer Form.
// Das Vorbild aus der Recherche ist Strava: Ein Feed-Eintrag zeigt nicht immer
// dieselben Felder, sondern die, die bei DIESEM Ereignis bemerkenswert sind.
// Für uns heißt das: Ein Spiel, in dem der Betrachter selbst gepunktet hat, ist
// für ihn etwas anderes als dasselbe Spiel für einen Unbeteiligten.
//
// ⚠️ WARUM KEIN EIGENER BEITRAGSTYP (Abweichung vom Vorschlag, bewusst):
// Der Entwurf zeigte „Deine Zahlen" als eigene Karte. Als eigener Auto-Post
// wäre das ein Beitrag **pro Spieler und Spiel** – bei zwölf Kadermitgliedern
// zwölf Beiträge für ein Spiel, die den Feed zuschütten. Und er trüge im Feed
// anderer Leute eine Überschrift („Deine Zahlen"), die dort nicht stimmt.
// Als Ergänzung der Ergebnis-Karte entsteht kein einziger neuer Beitrag, und
// die Zahl steht neben ihrem Beleg – genau da, wo sie hingehört.
//
// ⚠️ NICHTS WIRD GESPEICHERT. Die Werte hängen am Betrachter, nicht am Beitrag;
// sie werden pro Anfrage berechnet. Würden sie im Beitrag landen, bekäme der
// nächste Leser die Zahlen eines fremden Menschen als „deine" angezeigt – der
// Klassiker aus `docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md`.
export async function mitEigenenZahlen(posts, me) {
  try {
    if (!me?._id || !Array.isArray(posts) || !posts.length) return posts;

    // `meta.matchId` setzt `syncMatchResultPost` seit dem 18.08.2026. Ältere
    // Ergebnis-Beiträge haben es nicht – die bleiben unverändert und fallen in
    // der Karte auf die schlichte Darstellung zurück. Kein Text-Parsen.
    const roh = posts.map((p) => (typeof p?.toObject === "function" ? p.toObject() : p));
    const matchIds = [...new Set(roh.map((p) => p?.meta?.matchId).filter(Boolean))];
    if (!matchIds.length) return roh;

    const matches = await Match.find({ _id: { $in: matchIds } }).select("playerStats").lean();

    const proMatch = new Map();
    for (const m of matches) {
      const eig = (m.playerStats || []).find(
        (s) => String(s.player || "") === String(me._id) && !s.didNotPlay
      );
      if (!eig) continue;
      const pkt = Number(eig.points) || 0;
      const ast = Number(eig.assists) || 0;
      const reb = Number(eig.rebounds) || 0;
      // Ein Eintrag ohne jede Zahl ist keine Nachricht. „0/0/0" als Auftritt zu
      // gestalten wäre eine Aussage über eine schwache Leistung, die niemand
      // bestellt hat.
      if (pkt === 0 && ast === 0 && reb === 0) continue;
      proMatch.set(String(m._id), { pkt, ast, reb, haupt: hauptwert(pkt, ast, reb) });
    }
    if (!proMatch.size) return roh;

    return roh.map((p) => {
      const w = p?.meta?.matchId ? proMatch.get(String(p.meta.matchId)) : null;
      return w ? { ...p, meta: { ...p.meta, eigeneZahlen: w } } : p;
    });
  } catch (err) {
    // Der Feed darf an einer Zusatzinformation NIE scheitern.
    console.error("[eigeneZahlen]", err);
    return posts;
  }
}

// Welche der drei Zahlen führt? Das ist der Kern des Strava-Prinzips: nicht
// immer dasselbe Feld, sondern das bemerkenswerte.
//
// Die Regel ist bewusst schlicht und erklärbar – ein Aufbauspieler mit 11
// Assists und 6 Punkten soll die Assists sehen, nicht die Punkte. Sie ist KEIN
// Leistungsurteil und keine Wertung: Sie wählt nur aus, was in großer Schrift
// steht; die anderen beiden stehen unverändert daneben.
function hauptwert(pkt, ast, reb) {
  // Punkte sind der Normalfall und bleiben es, solange keine andere Zahl
  // deutlich heraussticht. „Deutlich" = mindestens 8 und größer als die Punkte;
  // die 8 ist die Schwelle, ab der ein Assist-/Rebound-Wert in einem
  // Amateurspiel als Ausbeute gilt und nicht als Nebenprodukt.
  if (ast >= 8 && ast > pkt) return "ast";
  if (reb >= 8 && reb > pkt) return "reb";
  return "pkt";
}
