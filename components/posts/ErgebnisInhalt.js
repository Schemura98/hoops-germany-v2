import Link from "next/link";
import { PiSealCheckBold } from "react-icons/pi";

// Die Ergebnis-Karte im Feed – der Punktestand führt, nicht der Satz.
//
// WARUM (Gestaltungsvorschlag „Der Feed als Anzeigetafel", 18.08.2026)
// Ein bestätigtes Spielergebnis stand im Feed als Fließtextzeile
// („Test Baskets 62:61 Munich Hoops") in genau derselben Form wie „Hartes
// Training heute." Die Recherche dazu, in einem Satz (Nielsen Norman Group):
// *„Card layouts typically deemphasize the ranking of content."* Gleichartige
// Inhalte gehören in eine Liste, ungleichartige brauchen unterschiedliche
// Formen – und im Feed liegen sehr ungleichartige Dinge nebeneinander.
//
// ⚠️ DER BELEG IST HIER DAS EIGENTLICHE MOTIV, nicht der Punktestand.
// Dass beide Vereine dasselbe gemeldet haben, ist das Alleinstellungsmerkmal
// der Plattform – und stand im Feed bisher nur als grauer Kleintext („note").
// Jetzt ist es eine eigene Zeile mit eigener Farbe.
//
// ⚠️ DREI STUFEN, NICHT ZWEI. `belegStufe` kommt aus `lib/autoPost.js` und dort
// aus `beidseitigBelegt()` – der EINEN Quelle für jede Aussage mit dem Wort
// „bestätigt". „fest" heißt: Ein Super-Admin hat das Ergebnis gesetzt; das ist
// endgültig, aber es ist KEINE beidseitige Bestätigung. Diese Unterscheidung
// hat auf Prod reale Folgen: 137 von 137 abgeschlossenen Spielen trugen
// `resultStatus: "confirmed"` ohne beidseitiges `submittedBy`.

const BELEG = {
  beidseitig: {
    text: "Von beiden Vereinen bestätigt",
    klasse: "text-signal-ok",
    marke: true,
  },
  fest: {
    text: "Ergebnis steht fest",
    klasse: "text-mist-300",
    marke: false,
  },
  vorlaeufig: {
    text: "Noch nicht vom Gegner bestätigt",
    klasse: "text-signal-wait",
    marke: false,
  },
};

const ZAHL_LABEL = { pkt: "Punkte", ast: "Assists", reb: "Rebounds" };
const ZAHL_KURZ = { pkt: "PKT", ast: "AST", reb: "REB" };

function EigeneZahlen({ werte }) {
  const reihenfolge = ["pkt", "ast", "reb"];
  const haupt = werte.haupt || "pkt";
  const rest = reihenfolge.filter((k) => k !== haupt);

  return (
    <div className="mt-3 pt-3 border-t border-navy-600">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-400">
        Deine Zahlen
      </p>
      <div className="mt-1.5 flex items-end gap-4">
        <div>
          <span className="font-display text-4xl font-black leading-none text-brand-400 tabular-nums">
            {werte[haupt]}
          </span>
          <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-mist-400 mt-1">
            {ZAHL_LABEL[haupt]}
          </span>
        </div>
        <div className="flex gap-3 pb-0.5">
          {rest.map((k) => (
            <div key={k}>
              <span className="font-display text-xl font-bold leading-none text-mist-300 tabular-nums">
                {werte[k]}
              </span>
              <span className="block font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-mist-500 mt-0.5">
                {ZAHL_KURZ[k]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ErgebnisInhalt({ post }) {
  const m = post?.meta || {};

  // ⚠️ Der Schalter auf die alte Darstellung. Ergebnis-Beiträge von VOR dem
  // 18.08.2026 – auf Prod liegen solche – haben diese Felder nicht. Sie dürfen
  // nicht kaputt aussehen, und ihr Punktestand wird NICHT aus `content`
  // zurückgerechnet: Der Satz enthält Vereinsnamen, und ein Vereinsname darf
  // einen Doppelpunkt tragen.
  const strukturiert =
    m.heim != null && m.gast != null && m.heimPunkte != null && m.gastPunkte != null;

  if (!strukturiert) {
    return (
      <div className="mt-3">
        <p className="font-semibold text-paper-50">{post.content}</p>
        {m.note && <p className="text-xs text-mist-400 mt-0.5">{m.note}</p>}
      </div>
    );
  }

  const beleg = BELEG[m.belegStufe] || BELEG.vorlaeufig;
  const heimGewinnt = m.heimPunkte > m.gastPunkte;
  const gastGewinnt = m.gastPunkte > m.heimPunkte;

  const Zeile = ({ name, punkte, fuehrt }) => (
    <>
      <span
        className={`font-display text-lg font-bold uppercase tracking-wide leading-tight ${
          fuehrt ? "text-paper-50" : "text-mist-400"
        }`}
      >
        {name}
      </span>
      <span
        className={`font-display text-3xl font-black leading-none text-right tabular-nums ${
          fuehrt ? "text-brand-400" : "text-mist-400"
        }`}
      >
        {punkte}
      </span>
    </>
  );

  const tafel = (
    <>
      <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 items-center">
        <Zeile name={m.heim} punkte={m.heimPunkte} fuehrt={heimGewinnt} />
        <Zeile name={m.gast} punkte={m.gastPunkte} fuehrt={gastGewinnt} />
      </div>
      <p
        className={`mt-3 pt-2.5 border-t border-navy-600 flex items-center gap-1.5 text-xs ${beleg.klasse}`}
      >
        {beleg.marke ? (
          <PiSealCheckBold aria-hidden="true" />
        ) : (
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
        )}
        {beleg.text}
      </p>
    </>
  );

  return (
    <div className="mt-3">
      {m.href ? (
        <Link href={m.href} className="block group" aria-label={`${post.content} – Spiel ansehen`}>
          <div className="group-hover:opacity-90 transition-opacity">{tafel}</div>
        </Link>
      ) : (
        tafel
      )}
      {m.eigeneZahlen && <EigeneZahlen werte={m.eigeneZahlen} />}
    </div>
  );
}
