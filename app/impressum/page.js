import LegalShell, { LegalHeading } from "@/components/layout/LegalShell";

export const metadata = { title: "Impressum – Hoops Germany" };

export default function ImpressumPage() {
  return (
    <LegalShell title="Impressum">
      <LegalHeading>Angaben gemäß § 5 TMG</LegalHeading>
      <p>
        Patrick Schemura
        <br />
        Robend 116
        <br />
        41748 Viersen
        <br />
        Deutschland
      </p>

      <LegalHeading>Kontakt</LegalHeading>
      <p>
        Telefon: +49 176 62310523
        <br />
        E-Mail:{" "}
        <a href="mailto:info@hoopsgermany.de" className="text-brand-400 hover:underline">
          info@hoopsgermany.de
        </a>
        <br />
        Website:{" "}
        <a
          href="https://www.hoopsgermany.de"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-400 hover:underline"
        >
          www.hoopsgermany.de
        </a>
      </p>

      <LegalHeading>Umsatzsteuer</LegalHeading>
      <p>
        Gemäß § 19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung). Eine
        Umsatzsteuer-Identifikationsnummer liegt derzeit nicht vor.
      </p>

      <LegalHeading>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</LegalHeading>
      <p>
        Patrick Schemura
        <br />
        Robend 116
        <br />
        41748 Viersen
      </p>

      <LegalHeading>Haftung für Inhalte</LegalHeading>
      <p>
        Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten
        nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
        Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
        Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
        Tätigkeit hinweisen.
      </p>

      <LegalHeading>Haftung für Links</LegalHeading>
      <p>
        Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
        Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr
        übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder
        Betreiber der Seiten verantwortlich.
      </p>

      <LegalHeading>Streitschlichtung</LegalHeading>
      <p>
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
        bereit:{" "}
        <a
          href="https://ec.europa.eu/consumers/odr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-400 hover:underline"
        >
          https://ec.europa.eu/consumers/odr
        </a>
        . Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    </LegalShell>
  );
}
