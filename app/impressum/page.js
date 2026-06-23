import LegalShell, { LegalHeading } from "@/components/layout/LegalShell";

export const metadata = { title: "Impressum – Hoops Germany" };

export default function ImpressumPage() {
  return (
    <LegalShell title="Impressum">
      <p className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-amber-700">
        Hinweis: Bitte die mit <code>[…]</code> markierten Platzhalter vor dem Go-Live durch
        die echten Angaben des Betreibers ersetzen.
      </p>

      <LegalHeading>Angaben gemäß § 5 TMG</LegalHeading>
      <p>
        [Vor- und Nachname / Firmenname]
        <br />
        [Straße und Hausnummer]
        <br />
        [PLZ und Ort]
      </p>

      <LegalHeading>Kontakt</LegalHeading>
      <p>
        Telefon: [Telefonnummer]
        <br />
        E-Mail: info@hoopsgermany.de
      </p>

      <LegalHeading>Vertreten durch</LegalHeading>
      <p>[Name der vertretungsberechtigten Person]</p>

      <LegalHeading>Umsatzsteuer-ID</LegalHeading>
      <p>
        Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
        <br />
        [USt-IdNr., falls vorhanden]
      </p>

      <LegalHeading>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</LegalHeading>
      <p>
        [Vor- und Nachname]
        <br />
        [Anschrift wie oben]
      </p>

      <LegalHeading>Streitschlichtung</LegalHeading>
      <p>
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
        bereit:{" "}
        <a
          href="https://ec.europa.eu/consumers/odr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-600 hover:underline"
        >
          https://ec.europa.eu/consumers/odr
        </a>
        . Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor
        einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    </LegalShell>
  );
}
