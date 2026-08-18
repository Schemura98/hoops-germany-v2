import { PiBasketballBold } from "react-icons/pi";
import LineChart from "@/components/admin/LineChart";

const nf = (n) => (n ?? 0).toLocaleString("de-DE");
const PERIOD_LABEL = { 7: "letzte 7 Tage", 30: "letzte 30 Tage", 90: "letzte 90 Tage", 365: "letztes Jahr" };

const AD_PLACEMENTS = [
  "Startseiten-Banner (oben)",
  "Newsfeed-Banner",
  "Liga-Seiten-Banner",
  "Teamseiten-Banner",
  "Spielerprofil-Banner",
  "Transfermarkt-Banner",
];

function Growth({ v }) {
  if (v === null || v === undefined) return null;
  const up = v >= 0;
  return (
    <span className={`text-xs font-semibold ${up ? "text-signal-ok" : "text-signal-error"}`}>
      {up ? "+" : ""}
      {v}%
    </span>
  );
}

function Section({ title, children }) {
  return (
    <section className="break-inside-avoid">
      <h2 className="text-base font-black text-paper-50 border-b border-navy-600 pb-1 mb-3">{title}</h2>
      {children}
    </section>
  );
}

// Präsentationsfertiges Report-Blatt (aggregierte Zahlen). Wird vom Admin-Report
// UND von der öffentlichen, passwortgeschützten Sponsor-Seite genutzt.
// Eine Zahl mit ihrem Satz. Der Satz ist Pflicht, nicht Schmuck: Genau sein
// Fehlen hat den alten Report unlesbar gemacht — „Aktive Nutzer 3" neben
// „Besucher 18.350" misst Verschiedenes, und ohne Erklärzeile nahm der Leser
// an, von 18.350 seien 3 aktiv (Befund Tobias).
function Zahl({ label, value, growth, zusatz, erklaerung }) {
  const nebenzahl = zusatz || wachstumsText(growth);
  return (
    <div className="break-inside-avoid">
      <p className="text-xs font-semibold uppercase tracking-wider text-mist-400">{label}</p>
      <p className="mt-1 flex items-baseline gap-2">
        <span className="text-3xl font-black text-paper-50 tabular-nums">{value}</span>
        {nebenzahl && (
          <span className="text-xs font-semibold text-signal-ok">{nebenzahl}</span>
        )}
      </p>
      <p className="mt-1 text-xs text-mist-400 leading-snug">{erklaerung}</p>
    </div>
  );
}

// ⚠️ WACHSTUM NUR AUF FLUSSGRÖSSEN – NIE auf einem Bestand.
// Seitenaufrufe und Besucher sind Größen, die IM Zeitraum entstehen; ihr
// Vorher/Nachher-Vergleich misst dieselbe Sache. Vereine und Spieler sind ein
// aufgelaufener Bestand, aber `entityStats` rechnet das Wachstum aus den NEUEN
// Anmeldungen der letzten 30 Tage gegen die 30 davor. Beides nebeneinander
// gestellt heißt für den Leser: „Die Zahl der Vereine hat sich verdoppelt.“
// Gemeint war: „Im Vormonat kam keiner dazu, in diesem einer.“
// Auf Prod steht dieser Fall heute nicht (0 neue Vereine → kein Abzeichen),
// er entsteht aber beim nächsten ruhigen Monat von selbst.
// Zweiter Grund: `entityStats` rechnet IMMER mit 30 Tagen, auch wenn oben
// „letztes Jahr“ gewählt ist – ein Prozentwert ohne erkennbaren Zeitraum.
// Deshalb tragen Bestandszahlen `zusatz` mit ausgeschriebenem Zeitraum.

// ⚠️ WACHSTUM WIRD GEDECKELT (Befund Tobias, 18.08.2026).
// Im alten Report standen „+4476 %" und „+76358 %" — groß, grün, ohne Deckel.
// Solche Zahlen bedeuten nur „vorher war fast nichts da". Ein Sponsor hält sie
// für einen Fehler oder für Angeberei; beides schadet. Ab 300 % sagen wir, was
// wirklich gemeint ist, statt eine Zahl zu zeigen, die niemand glaubt.
function wachstumsText(growth) {
  if (growth == null || !Number.isFinite(growth) || growth <= 0) return null;
  if (growth > 300) return "stark gewachsen";
  return `+${Math.round(growth)} %`;
}


// „davon 1 neu in 30 Tagen" ist wahr, hat einen benannten Zeitraum und ist für
// einen Sponsor die nützlichere Angabe als ein Prozentwert: Sie zeigt Bewegung,
// ohne einen Bestand als Wachstumsrate zu verkleiden. Bei 0 steht nichts – eine
// aufgeschriebene Null ist eine Aussage, die hier niemand treffen will.
function neuText(neu) {
  const n = Number(neu);
  if (!Number.isFinite(n) || n <= 0) return null;
  return `davon ${n} neu in 30 Tagen`;
}

export default function SponsorReportView({ summary, period, generatedAt, label }) {
  if (!summary) return null;
  const p = summary.platform;
  const d = summary.devices || {};
  const geraeteGesamt = (d.mobile || 0) + (d.desktop || 0) + (d.tablet || 0);
  // Kein Anteil ohne Grundgesamtheit — sonst steht dort „0 %“, was etwas
  // anderes behauptet als „wir wissen es nicht“.
  const mobilAnteil = geraeteGesamt ? Math.round(((d.mobile || 0) / geraeteGesamt) * 100) : null;
  return (
    <div className="max-w-3xl mx-auto bg-navy-800 print:shadow-none rounded-md print:rounded-none border border-navy-600 print:border-0 p-8 space-y-7">
      <header className="flex items-start justify-between gap-4 border-b border-navy-600 pb-4">
        <div>
          <div className="flex items-center gap-2 text-paper-50">
            <span className="h-9 w-9 rounded-md bg-brand-500 flex items-center justify-center text-navy-950">
              <PiBasketballBold />
            </span>
            <span className="font-black text-lg">Hoops Germany</span>
          </div>
          <p className="mt-2 text-xl font-black text-paper-50">Sponsoring-Report</p>
          {label && <p className="text-sm text-mist-400">für {label}</p>}
        </div>
        <div className="text-right text-xs text-mist-400">
          <p>Zeitraum: {PERIOD_LABEL[period] || `${period} Tage`}</p>
          {generatedAt && <p>Erstellt am {generatedAt}</p>}
        </div>
      </header>

      <p className="text-sm text-mist-400">
        Hoops Germany ist die Community-Plattform für Amateur-Basketball in NRW. Dieser Report zeigt
        sechs Zahlen zu Reichweite und Bestand – bewusst wenige, dafür jede mit ihrer Herkunft.
        Alle Angaben sind aggregiert; es werden keine Namen und keine personenbezogenen Daten genannt.
      </p>

      {/* ⚠️ SECHS ZAHLEN, NICHT DREISSIG (Auftrag Patrick nach Tobias' Gate,
          18.08.2026). Sein Satz war die Vorgabe: „Ein Sponsorendokument
          braucht sechs starke Zahlen mit je einem erklärenden Satz, nicht
          dreißig."

          Vorher standen hier acht Abschnitte mit rund dreißig Kennzahlen. Sein
          Urteil auf die Frage, ob er den Report einem Sponsor zeigen würde:
          „in dieser Form nein" – nicht wegen eines Fehlers, sondern weil er
          gegen sich selbst arbeitete.

          ⚠️ WAS ENTFERNT WURDE UND WARUM – jede Zeile hat einen Grund:

          · „Beliebteste Inhalte · Spielerprofile" — enthielt FÜNF KLARNAMEN,
            vier Absätze unter der Zusage, der Report enthalte keine
            personenbezogenen Daten. Der teilbare Link filterte sie bereits
            aus; der PDF-Weg aus dem Backoffice nicht. Zwei Wege nach draußen,
            nur einer geschützt (Befund Tobias). Damit ist der Widerspruch an
            der Wurzel weg statt nur an einem der beiden Wege.

          · „Regionale Stärke" — rechnete über ALLE Spieler ohne Echtheits-
            filter. Auf hoops_prod sind das 406 Spieler, davon 375 Seed (92 %).
            „Nutzer nach Bundesland: NRW" liest sich wie Marktanteil und wäre
            zu über neun Zehnteln erfunden (§ 5 UWG, s. Roadmap 2).

          · „Wiederkehrende: 0" neben „Neue Besucher: 18.350" — ein Sponsor
            liest: niemand kommt zurück. Die Null ist ein Datenartefakt, stand
            aber ohne jede Einordnung in einem Dokument, das Reichweite
            verkaufen soll.

          · „Ø Sitzungsdauer 4 s" neben „Seiten/Sitzung 2,3" — zwei Seiten in
            vier Sekunden ist Maschinenverkehr. Für einen Sponsor das Argument
            GEGEN ein Sponsoring.

          · „Aktive Nutzer (30T)" — ungefiltert, stand aber neben gefilterten
            Zahlen und unter einem Satz, der Bereinigung zusichert.

          · „Beliebteste Seiten" — rohe Adressen, darunter
            `/player/update-password`. Gehört nicht in ein Außendokument.

          · „Spiele inkl. Beispieldaten" — die Beschriftung sagt selbst, dass
            die Zahl nicht trägt.

          ⚠️ WAS BLEIBT, ist genau das, was ohne Einschränkung belastbar ist:
          Reichweite und Geräte kommen aus echten Seitenaufrufen, Vereine und
          Spieler aus der bereits gefilterten Zählung, Ligen aus dem offiziellen
          Katalog. Wer hier etwas ergänzt, muss sagen können, aus welcher
          Grundgesamtheit es stammt. */}
      <Section title="Die Plattform in sechs Zahlen">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <Zahl
            label="Seitenaufrufe"
            value={nf(summary.reach.views.current)}
            growth={summary.reach.views.growth}
            erklaerung={`Alle Aufrufe im Zeitraum ${PERIOD_LABEL[period] || `${period} Tage`}.`}
          />
          <Zahl
            label="Besucher"
            value={nf(summary.reach.visitors.current)}
            growth={summary.reach.visitors.growth}
            erklaerung="Unterschiedliche Geräte, nicht Aufrufe."
          />
          <Zahl
            label="Vereine auf der Plattform"
            value={nf(p.externeTeams.total)}
            zusatz={neuText(p.externeTeams.newLast30)}
            erklaerung="Echte Vereine — Beispieldaten und interne Testkonten sind herausgerechnet."
          />
          <Zahl
            label="Spieler mit Profil"
            value={nf(p.externeUsers.total)}
            zusatz={neuText(p.externeUsers.newLast30)}
            erklaerung="Ebenfalls ohne Beispieldaten und Testkonten."
          />
          <Zahl
            label="Ligen im Katalog"
            value={nf(p.leagues.total)}
            erklaerung="Offizieller WBV-Katalog Nordrhein-Westfalen."
          />
          <Zahl
            label="Anteil Mobil"
            value={mobilAnteil == null ? "—" : `${mobilAnteil} %`}
            erklaerung="Aufrufe von Telefonen, gemessen am Gerät."
          />
        </div>
      </Section>

      <Section title="Verlauf">
        <LineChart data={summary.timeseries} height={180} />
        <p className="mt-2 text-xs text-mist-400">
          Seitenaufrufe je Tag im gewählten Zeitraum.
        </p>
      </Section>

      <Section title="Werbemöglichkeiten">
        <p className="text-sm text-mist-400 mb-2">Verfügbare Werbeflächen für Sponsoren:</p>
        <div className="flex flex-wrap gap-2">
          {AD_PLACEMENTS.map((a) => (
            <span key={a} className="text-xs bg-navy-700 text-mist-300 rounded-sm px-3 py-1">
              {a}
            </span>
          ))}
        </div>
      </Section>

      <footer className="border-t border-navy-600 pt-3 text-[11px] text-mist-400">
        Hoops Germany · hoopsgermany.de · Aggregierte Statistiken{generatedAt ? `, Stand ${generatedAt}` : ""}
      </footer>
    </div>
  );
}
