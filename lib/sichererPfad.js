// ---------------------------------------------------------------------------
// Weiterleitungsziele prüfen – EINE Stelle für alle fünf Wege.
//
// WOFÜR (Befund Kai K4, 19.08.2026):
// `/login` und `/signup` nehmen ein `?next=` entgegen und schicken den Nutzer
// nach erfolgreicher Anmeldung dorthin. Ungeprüft ist das eine offene
// Weiterleitung: Jemand verschickt einen Link auf unsere ECHTE Anmeldeseite,
// der Nutzer meldet sich wirklich bei uns an – und landet danach auf einer
// nachgebauten Maske, die „aus Sicherheitsgründen noch einmal" nach dem
// Passwort fragt. Die Vertrauenswürdigkeit stammt dabei komplett von uns: Der
// Nutzer hat die Adresszeile geprüft, sie stand auf hoopsgermany.de, und die
// Anmeldung hat tatsächlich funktioniert.
//
// ⚠️ DIE BISHERIGE PRÜFUNG WAR UMGEHBAR – und sie stand an drei Stellen
// gleichlautend, was den Irrtum dreifach hielt statt ihn aufzudecken:
//
//     wert.startsWith("/") && !wert.startsWith("//")
//
// `"/\evil.com"` besteht beide Bedingungen. Der Browser normalisiert den
// Rückwärtsstrich nach WHATWG-URL für „besondere" Schemata (http/https) zu
// einem Schrägstrich, macht daraus `//evil.com` – und das ist eine
// protokoll-relative Adresse, also ein FREMDER HOST. Nachgemessen:
//     new URL("/\\evil.com", "https://pruef.invalid").origin
//       === "https://evil.com"
// Dasselbe gilt für ein führendes Steuerzeichen (`"\t/\evil.com"`), weil
// Browser führende C0-Zeichen entfernen, BEVOR sie die Adresse deuten. Wer nur
// `startsWith` prüft, prüft deshalb eine andere Zeichenkette, als der Browser
// später auflöst.
//
// DIE PRÜFUNG HAT DREI SCHICHTEN, und die dritte ist die eigentliche:
//   1. Steuerzeichen/Leerraum → sofort abweisen (statt sie wegzuschneiden:
//      wer schneidet, muss dieselbe Schnittregel treffen wie der Browser).
//   2. Prozent-Kodierung mehrfach auflösen und JEDE Zwischenstufe mitprüfen
//      (`%2f%2f`, `%5c`, und doppelt kodiert `%252f`).
//   3. Auflösen mit `new URL(wert, BASIS)` und den Ursprung vergleichen. Das
//      ist derselbe Algorithmus, den der Browser gleich anwenden wird – hier
//      wird nicht nachgebildet, was er tut, sondern gefragt.
//
// Schicht 1 und 2 sind streng genommen redundant zu Schicht 3. Sie bleiben
// trotzdem: Sie sind einzeln lesbar und einzeln prüfbar, und sie fangen den
// Fall ab, dass eine Umgebung ohne WHATWG-`URL` auskommen muss.
//
// ⚠️ WAS WEITER FUNKTIONIEREN MUSS: `components/landing/LandingCTA.js`
// verlinkt seit `bd99263` auf `/signup?next=/team/create&src=home-cta` – das
// ist Neles Entscheidung, Ausgeloggte NICHT in ein Anmeldeformular zu
// schicken. Eine Prüfung, die relative Pfade MIT Query abweist, bricht diesen
// Weg still: Der Nutzer registriert sich und landet im Newsfeed statt bei der
// Vereinsgründung. Deshalb steht dieser Fall in `tests/e2e/sicherer-pfad.spec.mjs`.
//
// ⚠️ ABWEISEN HEISST ZURÜCKFALLEN, NICHT SCHEITERN. Ein manipuliertes `next=`
// ist kein Grund, einem Nutzer die gelungene Anmeldung mit einer Fehlermeldung
// zu quittieren. Er landet still auf dem Standardziel.
// ---------------------------------------------------------------------------

/** Standardziel nach einer Anmeldung. Damit die Aufrufer nicht auseinanderlaufen. */
export const STANDARD_ZIEL = "/player/newsfeed";

// Wegwerf-Ursprung für die Auflösung. `.invalid` ist nach RFC 2606 dauerhaft
// reserviert und damit von niemandem registrierbar – dieselbe Überlegung wie
// bei den entwerteten Seed-Konten.
const BASIS = "https://pfadpruefung.invalid";

// C0-Steuerzeichen und DEL. **Ohne das Leerzeichen** (0x20) - s. formIstOk.
// Bewusst NICHT alles jenseits von ASCII: Pfade dürfen Umlaute tragen.
const STEUERZEICHEN = /[\u0000-\u001f\u007f]/;

/** Der Teil vor `?` und `#` - nur dort kann eine Host-Verwechslung entstehen. */
const pfadTeil = (wert) => wert.split(/[?#]/)[0];

// Wie oft die Prozent-Kodierung aufgelöst wird. Drei Runden decken einfach,
// doppelt und dreifach kodierte Formen ab; mehr ist kein realistischer
// Angriffsweg, und eine Schleife ohne Deckel wäre selbst eine Schwachstelle.
const DEKODIER_RUNDEN = 3;

/**
 * Prüft die Form einer EINZELNEN Stufe (roh oder dekodiert).
 * Bewusst ohne `URL` – diese Schicht ist von Hand lesbar.
 */
function formIstOk(wert) {
  // Steuerzeichen an JEDER Stelle: Browser entfernen Tabulator, Zeilenumbruch
  // und Wagenrücklauf auch MITTEN in einer Adresse, bevor sie sie deuten.
  if (STEUERZEICHEN.test(wert)) return false;
  // Führender/abschließender Leerraum wird vom Browser ebenfalls abgeschnitten,
  // kann also die Deutung ändern. Ein Leerzeichen MITTEN im Wert kann das
  // nicht - deshalb ein trim-Vergleich statt eines Verbots des Zeichens.
  // ⚠️ Das Verbot des Zeichens war ein echter Fehler (Befund code-review,
  // 20.08.2026): `URLSearchParams.get()` dekodiert `%20` bereits zu einem
  // echten Leerzeichen, also wurde `/spieler?q=max%20mustermann` abgewiesen -
  // der Nutzer landete still im Newsfeed statt bei seiner Suche.
  if (wert !== wert.trim()) return false;
  // Muss ein absoluter Pfad auf UNSERER Seite sein.
  if (!wert.startsWith("/")) return false;
  // Protokoll-relativ (`//host`) – der Klassiker.
  if (wert.startsWith("//")) return false;
  // Rückwärtsstrich an JEDER Stelle. Nicht nur an Position 1: Der Browser
  // ersetzt ihn im Pfad ohnehin durch `/`, ein Pfad, der ihn braucht, ist kein
  // echter Fall – und `/\/evil.com` wäre sonst durchgerutscht.
  if (wert.includes("\\")) return false;
  return true;
}

/**
 * Ist `roh` ein Ziel innerhalb dieser Seite?
 * @param {unknown} roh Wert aus `?next=` oder aus dem OAuth-Cookie.
 * @returns {boolean}
 */
export function istSichererPfad(roh) {
  if (typeof roh !== "string" || roh === "") return false;

  // Schicht 1: die Rohform, vollständig.
  if (!formIstOk(roh)) return false;

  // Schicht 2: die Prozent-Kodierung auflösen – aber NUR im PFADTEIL.
  // ⚠️ Warum nicht auf dem ganzen Wert (Befund code-review, 20.08.2026):
  // Eine Query darf alles enthalten. `/x?q=100%25` wird zu `/x?q=100%`, ein
  // weiterer Dekodierversuch wirft – und der ganze Wert flog raus, obwohl an
  // ihm nichts gefährlich ist. Eine Host-Verwechslung kann ausschließlich im
  // Pfadteil entstehen; alles ab `?` liest der Browser nie als Host.
  let stufe = pfadTeil(roh);
  for (let i = 0; i < DEKODIER_RUNDEN && stufe.includes("%"); i++) {
    let naechste;
    try {
      naechste = decodeURIComponent(stufe);
    } catch {
      // ⚠️ ABBRECHEN, NICHT ABWEISEN. Eine kaputte Kodierung ist KEIN
      // Sicherheitssignal: Der Browser lässt `%zz` unverändert stehen, der
      // Ursprung ändert sich dadurch nicht – und Schicht 3 prüft ihn ohnehin.
      // Sie abzuweisen kostete `/spieler/100%25rabatt`, einen gültigen Pfad.
      break;
    }
    if (naechste === stufe) break;
    stufe = naechste;
    if (!formIstOk(stufe)) return false;
  }

  // Schicht 3: den Browser selbst fragen.
  let aufgeloest;
  try {
    aufgeloest = new URL(roh, BASIS);
  } catch {
    return false;
  }
  // `javascript:` & Co. liefern hier Ursprung `"null"` (eine Zeichenkette!),
  // fremde Hosts ihren eigenen. Nur der unveränderte Wegwerf-Ursprung zählt.
  if (aufgeloest.origin !== BASIS) return false;

  return true;
}

/**
 * Liefert ein sicheres Weiterleitungsziel.
 * @param {unknown} roh Wert aus `?next=` oder aus dem OAuth-Cookie.
 * @param {string|null} standard Rückfall, wenn `roh` abgewiesen wird.
 * @returns {string|null}
 */
export function sichererPfad(roh, standard = null) {
  return istSichererPfad(roh) ? roh : standard;
}
