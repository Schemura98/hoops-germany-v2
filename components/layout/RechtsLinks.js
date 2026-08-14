import Link from "next/link";

// ---------------------------------------------------------------------------
// Verweis auf Datenschutzerklärung und Impressum – EINE Stelle für alle
// Flächen, auf denen ein Konto entsteht.
//
// Herkunft (Nora, 14.08.2026, `docs/RECHT-MINDESTALTER-2026-08-14.md` P-1 –
// der einzige echte Pflicht-Punkt ihrer Prüfung): `/signup` trug den Verweis
// über `AuthShell`. Die beiden anderen kontoerzeugenden Wege,
// `/team/join/[token]` und `/team/claim/[token]`, bringen eine eigene Hülle
// mit, importieren weder `AuthShell` noch `Footer` – und `Footer` steht nicht
// im Wurzel-Layout. Auf zwei von drei Wegen, über die jemand ein Konto anlegt,
// fehlte der Verweis damit vollständig (Art. 13 DSGVO, § 5 DDG).
//
// Als eigene Komponente und nicht als kopierter Block: Genau dieselbe Lage gab
// es am selben Tag beim Leerzustand der Glocke, wo zwei Kopien bereits
// auseinandergelaufen waren (einmal mit, einmal ohne Punkt). Bei einem
// Rechtsverweis wäre das teurer als bei einem Leerzustand.
//
// ⚠️ Bewusst ein reiner VERWEIS, keine Einwilligungserklärung. Der Wortlaut
// einer Zustimmung („mit der Registrierung willigst du ein…") ist ein
// Rechtstext und gehört zu Nora bzw. einem Anwalt, nicht in ein Bauteil. Hier
// steht nur, wo die Information liegt.
// ---------------------------------------------------------------------------
export default function RechtsLinks({ className = "" }) {
  return (
    <p className={`text-center text-xs text-mist-600 ${className}`}>
      <Link href="/datenschutz" className="hover:text-mist-400 underline underline-offset-2">
        Datenschutz
      </Link>
      <span className="mx-2" aria-hidden="true">
        ·
      </span>
      <Link href="/impressum" className="hover:text-mist-400 underline underline-offset-2">
        Impressum
      </Link>
    </p>
  );
}
