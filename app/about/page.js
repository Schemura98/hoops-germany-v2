import LegalShell, { LegalHeading } from "@/components/layout/LegalShell";

export const metadata = { title: "Über uns – Hoops Germany" };

export default function AboutPage() {
  return (
    <LegalShell title="Über uns">
      <p>
        <strong>Hoops Germany</strong> ist die Community-Plattform für Amateur-Basketball
        in NRW. Wir bringen Spielerinnen und Spieler, Teams und Ligen an einem Ort
        zusammen – abseits des Profibetriebs, mitten im Herz des deutschen Breitensports.
      </p>

      <LegalHeading>Was wir bieten</LegalHeading>
      <p>
        Erstelle dein Spielerprofil, zeige deine Statistiken und finde Anschluss an ein
        Team. Vereine verwalten ihren Kader, schreiben Tryouts aus und tragen Spiele sowie
        Ergebnisse ein. Über den Transfermarkt finden Spieler und Teams zueinander.
        {/* Die Altersgrenze und ihr Grund, seit 14.08.2026 (Befund Lina: /about
            enthielt „16" nicht, gemessen; Wortlaut Nele). Die Grenze ist eine
            Bedingung des Angebots und steht deshalb hier, nicht als eigener
            Abschnitt – sonst wäre sie eines von vier Dingen, die diese Seite
            über uns sagt.
            Der Schlusssatz sagt dem Jüngeren, dass er nichts verpasst, ohne
            zuzusagen, dass es die Plattform in zwei Jahren noch gibt oder die
            Grenze dann noch bei 16 liegt. Mehr geht hier ehrlich nicht. */}{" "}
        Mitmachen kannst du ab 16 Jahren. Der Grund ist die Öffentlichkeit der Profile:
        Name, Verein und Statistiken kann hier jeder sehen, auch ohne Konto – und diese
        Entscheidung wollen wir niemandem unter 16 abverlangen. Bist du jünger: Der
        Basketball läuft dir nicht weg.
      </p>

      <LegalHeading>Unsere Mission</LegalHeading>
      <p>
        Amateur-Basketball lebt von seiner Community. Wir wollen es so einfach wie möglich
        machen, sich zu vernetzen, Spiele zu organisieren und die eigene Entwicklung
        sichtbar zu machen – vom ersten Tryout bis zur Topscorer-Liste.
      </p>

      <LegalHeading>Kontakt</LegalHeading>
      <p>
        Fragen, Ideen oder Feedback? Schreib uns über das{" "}
        <a href="/kontakt" className="text-brand-400 hover:underline">
          Kontaktformular
        </a>{" "}
        oder per E-Mail an{" "}
        <a href="mailto:info@hoopsgermany.de" className="text-brand-400 hover:underline">
          info@hoopsgermany.de
        </a>
        .
      </p>
    </LegalShell>
  );
}
