// „Was aus Feedback schon wurde" – schließt die Lücke im Versprechen des
// Tester-Flyers („Deine Meinung entscheidet mit, was als Nächstes gebaut wird").
//
// Warum es diese Fläche gibt: Das Versprechen ist inhaltlich wahr – Tester-
// Rückmeldungen haben nachweislich Funktionen verändert –, aber der Absender
// erfuhr es nie. Das Feedback-Formular erfasst bewusst **keine Kontaktangabe**
// (anonym ist die datensparsame Variante), also gibt es keinen Rückweg. Statt
// dafür personenbezogene Daten zu erheben, wird das Versprechen hier öffentlich
// überprüfbar gemacht: Wer gleich etwas schreibt, sieht vorher, dass frühere
// Rückmeldungen tatsächlich etwas verändert haben.
//
// ⚠️ Regel für Einträge: Nur echte, belegte Änderungen. Jeder Punkt unten steht
// mit Datum und Commit in docs/CHRONIK.md. Keine Wunschliste, keine geplanten
// Sachen, nichts Aufgehübschtes – sonst ist die Fläche in dem Moment wertlos,
// in dem ein Tester eine Behauptung wiedererkennt, die nicht stimmt.
const EINTRAEGE = [
  {
    rueckmeldung: '„Neue Nutzer sind lost.“',
    folge: "Eine Checkliste im Feed führt jetzt durch die ersten Schritte.",
  },
  {
    rueckmeldung: '„Team gründen war nur versteckt in der Navbar.“',
    folge: "Auf der Teams-Seite steht dafür jetzt ein eigener Knopf.",
  },
  {
    rueckmeldung: '„Profilbild und Vereinslogo lassen sich nicht hochladen.“',
    folge: "Lag am Server, nicht am Handy – behoben, auch für große Fotos.",
  },
  {
    rueckmeldung:
      '„Rückennummern fehlen, und man kann bestehende Konten nicht einladen.“',
    folge: "Beides gibt es jetzt im Kader.",
  },
];

export default function WasDarausWurde() {
  return (
    <section className="mt-10 border-t border-navy-600 pt-6">
      <h2 className="font-display text-xl font-black uppercase tracking-tight text-paper-50">
        Was aus Feedback schon wurde
      </h2>
      <p className="mt-1 text-sm text-mist-400">
        Vier Beispiele aus der Testphase – jedes davon kam von jemandem wie dir.
      </p>
      <ul className="mt-4 space-y-3">
        {EINTRAEGE.map((e) => (
          <li key={e.rueckmeldung} className="rounded-md border border-navy-600 bg-navy-800 p-4">
            <p className="text-sm text-mist-300">{e.rueckmeldung}</p>
            <p className="mt-1 flex gap-2 text-sm text-paper-50">
              <span aria-hidden="true" className="text-brand-400">
                →
              </span>
              {e.folge}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
