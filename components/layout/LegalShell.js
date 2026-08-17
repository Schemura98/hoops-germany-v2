import { Children, cloneElement, isValidElement } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";

// Gemeinsame Hülle für Inhalts-/Rechtsseiten.
//
// max-w-xl statt max-w-2xl: Die Zeilenlänge lag live bei 75–80 Zeichen, die
// gut lesbare Spanne endet bei ~75 (Design-Review 10.08.2026, Welle 4).
//
// Ab sechs Abschnitten rendert die Hülle zusätzlich ein kompaktes Sprungmenü.
// Sie liest die Überschriften dafür aus den eigenen Kindern aus und vergibt
// die `id`s selbst – die Seiten müssen nichts zusätzlich pflegen, und der
// Wortlaut der Rechtstexte bleibt unangetastet (der gehört der Rechtsprüfung,
// nicht der Gestaltung).

function textOf(node) {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) return textOf(node.props.children);
  return "";
}

// Präfix, weil die Abschnitte mit einer Zahl beginnen ("1. Verantwortlicher"):
// Eine ID, die mit einer Ziffer anfängt, ist als CSS-Selektor ungültig und
// bricht querySelector/Testwerkzeuge, auch wenn der Sprung im Browser klappt.
function slugOf(text) {
  return `abschnitt-${text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;
}

export default function LegalShell({ title, eyebrow = "Rechtliches", children }) {
  const abschnitte = [];
  const inhalt = Children.map(children, (child) => {
    if (!isValidElement(child) || child.type !== LegalHeading) return child;
    const text = textOf(child.props.children);
    const id = slugOf(text);
    abschnitte.push({ id, text });
    return cloneElement(child, { id });
  });

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar />
      <PageHeader eyebrow={eyebrow} title={title} />
      <main id="hauptinhalt" tabIndex={-1} className="flex-1 max-w-xl mx-auto w-full px-4 py-10">
        {abschnitte.length > 5 && (
          <nav
            aria-label="Abschnitte dieser Seite"
            className="mb-4 rounded-md border border-navy-600 bg-navy-800 p-4"
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-mist-400">
              Auf dieser Seite
            </p>
            {/* Als Chips statt als Fließliste: Bei zehn Abschnitten mit langen
                Titeln lesen sich umgebrochene Textlinks sonst wie ein Satz. */}
            <ol className="flex flex-wrap gap-1.5">
              {abschnitte.map((a) => (
                <li key={a.id}>
                  <a
                    href={`#${a.id}`}
                    className="inline-block rounded-full bg-navy-950 px-3 py-1.5 text-xs font-medium text-mist-400 transition-colors hover:bg-brand-500/10 hover:text-brand-400"
                  >
                    {a.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="bg-navy-800 rounded-md border border-navy-600 p-8 space-y-4 text-sm text-mist-400 leading-relaxed">
          {inhalt}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Wiederverwendbare Abschnitts-Überschrift innerhalb der Hülle.
// `id` setzt die Hülle selbst; scroll-mt-24 hält die Überschrift beim Sprung
// unter der klebenden Navbar sichtbar.
export function LegalHeading({ id, children }) {
  return (
    <h2 id={id} className="scroll-mt-24 text-base font-semibold text-paper-50 pt-2">
      {children}
    </h2>
  );
}
