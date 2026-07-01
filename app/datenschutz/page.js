import LegalShell, { LegalHeading } from "@/components/layout/LegalShell";

export const metadata = { title: "Datenschutz – Hoops Germany" };

export default function DatenschutzPage() {
  return (
    <LegalShell title="Datenschutzerklärung">
      <LegalHeading>1. Verantwortlicher</LegalHeading>
      <p>
        Verantwortlich für die Datenverarbeitung auf dieser Website ist:
        <br />
        Patrick Schemura
        <br />
        Robend 116
        <br />
        41748 Viersen, Deutschland
        <br />
        E-Mail:{" "}
        <a href="mailto:info@hoopsgermany.de" className="text-brand-600 hover:underline">
          info@hoopsgermany.de
        </a>
      </p>

      <LegalHeading>2. Erhebung und Verarbeitung personenbezogener Daten</LegalHeading>
      <p>
        Wir verarbeiten personenbezogene Daten, die du uns bei der Registrierung und Nutzung
        aktiv bereitstellst – insbesondere Name, E-Mail-Adresse sowie freiwillige
        Profilangaben (z. B. Position, Verein, Statistiken). Diese Daten werden zur
        Bereitstellung der Plattformfunktionen verarbeitet (Art. 6 Abs. 1 lit. b DSGVO).
      </p>

      <LegalHeading>3. Registrierung &amp; Anmeldung</LegalHeading>
      <p>
        Bei der Registrierung speichern wir die angegebenen Daten. Passwörter werden
        ausschließlich verschlüsselt (gehasht) gespeichert. Optional kannst du dich über
        Google anmelden; dabei werden Name, E-Mail-Adresse und Profilbild von Google an uns
        übermittelt.
      </p>

      <LegalHeading>4. Öffentliche Profildaten</LegalHeading>
      <p>
        Bestimmte Profilangaben (z. B. Name, Position, Statistiken, Teamzugehörigkeit) sind
        für andere Nutzer öffentlich sichtbar. Du kannst diese Angaben jederzeit in deinem
        Profil bearbeiten.
      </p>

      <LegalHeading>5. E-Mail-Versand</LegalHeading>
      <p>
        Wir versenden transaktionale E-Mails (z. B. Passwort-Zurücksetzen, Einladungen,
        Benachrichtigungen) über unseren E-Mail-Dienstleister. Hierbei wird deine
        E-Mail-Adresse verarbeitet.
      </p>

      <LegalHeading>6. Cookies &amp; lokale Speicherung</LegalHeading>
      <p>
        Zur Anmeldung speichern wir ein Authentifizierungs-Token im lokalen Speicher deines
        Browsers (localStorage). Dieses ist technisch notwendig, um dich eingeloggt zu
        halten.
      </p>

      <LegalHeading>7. Deine Rechte</LegalHeading>
      <p>
        Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
        Verarbeitung, Datenübertragbarkeit sowie Widerspruch. Wende dich dazu an{" "}
        <a href="mailto:info@hoopsgermany.de" className="text-brand-600 hover:underline">
          info@hoopsgermany.de
        </a>
        . Zudem steht dir ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde zu.
      </p>

      <LegalHeading>8. Löschung des Kontos</LegalHeading>
      <p>
        Du kannst die Löschung deines Kontos und der zugehörigen Daten jederzeit per E-Mail
        beantragen. Bestimmte Daten können aufgrund gesetzlicher Aufbewahrungspflichten für
        einen begrenzten Zeitraum erhalten bleiben.
      </p>

      <LegalHeading>9. Auftragsverarbeiter &amp; eingebundene Dienste</LegalHeading>
      <p>
        Zur Bereitstellung der Plattform setzen wir sorgfältig ausgewählte Dienstleister ein:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Hosting unseres Servers (VPS)</li>
        <li>MongoDB Atlas (Datenbank)</li>
        <li>E-Mail-Versand (transaktionale E-Mails)</li>
        <li>Sportschau-RSS-Feed (Anzeige aktueller Basketball-News)</li>
      </ul>
      <p>
        Server-Logs werden zur Sicherheit kurzfristig gespeichert und anschließend
        automatisch anonymisiert bzw. gelöscht.
      </p>

      <LegalHeading>10. Eingebettete Inhalte Dritter (YouTube, Link-Vorschauen)</LegalHeading>
      <p>
        Nutzer können in Beiträgen Links teilen. Enthält ein Beitrag einen YouTube-Link,
        kann das Video als eingebetteter Player von YouTube (Google Ireland Limited, Gordon
        House, Barrow Street, Dublin 4, Irland) angezeigt werden. Enthält ein Beitrag einen
        sonstigen Link, kann eine Vorschaukarte mit einem Vorschaubild angezeigt werden, das
        vom jeweiligen Zielserver stammt.
      </p>
      <p>
        Diese Inhalte von Drittanbietern werden <strong>nicht automatisch geladen</strong>,
        sondern erst, nachdem du sie durch einen Klick („Video von YouTube laden“ bzw.
        „Vorschaubild laden“) aktiv freigibst. Bis dahin wird keine Verbindung zu den Servern
        der Anbieter hergestellt. Klickst du auf „Laden“, stellt dein Browser eine Verbindung
        zum jeweiligen Anbieter her und übermittelt technisch notwendige Daten – insbesondere
        deine IP-Adresse. Auf die weitere Verarbeitung durch diese Anbieter haben wir keinen
        Einfluss; YouTube/Google kann dabei Cookies setzen. Wir binden YouTube-Videos im
        erweiterten Datenschutzmodus (youtube-nocookie.com) ein. Informationen zur
        Datenverarbeitung durch Google findest du unter{" "}
        <a href="https://policies.google.com/privacy" className="text-brand-600 hover:underline">
          policies.google.com/privacy
        </a>
        .
      </p>
      <p>
        Die Vorschau-Metadaten eines Links (Titel, Beschreibung, Adresse des Vorschaubilds)
        rufen wir einmalig serverseitig ab, wenn ein Beitrag erstellt wird – dein Browser
        übermittelt dabei keine Daten an den Ziel-Anbieter. Rechtsgrundlage für das Laden der
        eingebetteten Inhalte ist deine Einwilligung durch den Klick (Art. 6 Abs. 1 lit. a
        DSGVO).
      </p>

      <p className="text-xs text-gray-400 pt-2">
        Stand: Juli 2026. Diese Datenschutzerklärung ersetzt keine Rechtsberatung.
      </p>
    </LegalShell>
  );
}
