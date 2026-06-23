import LegalShell, { LegalHeading } from "@/components/layout/LegalShell";

export const metadata = { title: "Über uns – Hoops Germany" };

export default function AboutPage() {
  return (
    <LegalShell title="Über uns">
      <p>
        <strong>Hoops Germany</strong> ist die Community-Plattform für Amateur-Basketball
        in Deutschland. Wir bringen Spielerinnen und Spieler, Teams und Ligen an einem Ort
        zusammen – abseits des Profibetriebs, mitten im Herz des deutschen Breitensports.
      </p>

      <LegalHeading>Was wir bieten</LegalHeading>
      <p>
        Erstelle dein Spielerprofil, zeige deine Statistiken und finde Anschluss an ein
        Team. Vereine verwalten ihren Kader, schreiben Tryouts aus und tragen Spiele sowie
        Ergebnisse ein. Über den Transfermarkt finden Spieler und Teams zueinander.
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
        <a href="/kontakt" className="text-brand-600 hover:underline">
          Kontaktformular
        </a>{" "}
        oder per E-Mail an{" "}
        <a href="mailto:info@hoopsgermany.de" className="text-brand-600 hover:underline">
          info@hoopsgermany.de
        </a>
        .
      </p>
    </LegalShell>
  );
}
