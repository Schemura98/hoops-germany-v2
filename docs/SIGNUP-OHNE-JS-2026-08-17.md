# `/signup` liefert ohne JavaScript eine leere Seite

**Befund vom 17.08.2026**, aufgefallen als Nebenbefund bei der Sprungmarken-Arbeit (`72a4fe9`).
Live gemessen gegen `https://hoopsgermany.de`, nicht am Server.

**Adressaten: Vivien** (Gestaltung des Ladezustands) **und Nora** (Rechtsflächen auf der
Registrierungsseite). **Kein Blocker, nichts ist kaputt** – für jeden Besucher mit aktivem
JavaScript funktioniert die Seite vollständig. Es geht um das, was **davor** ausgeliefert wird.

---

## Was gemessen wurde

Rohes, vom Server geliefertes HTML (`curl`, ohne JavaScript-Ausführung):

| Route | `<main>` | Formularfelder | Link „Datenschutz" | Link „Impressum" |
|---|---|---|---|---|
| **`/signup`** | **0** | **0** | **0** | **0** |
| `/login` | 1 | 2 | 1 | 1 |

Nachstellen:

```bash
curl -s https://hoopsgermany.de/signup | grep -c '<input'
```

`/signup` liefert rund 15,5 KB HTML, und darin steht vom eigentlichen Inhalt **nichts**: kein
Formular, keine Überschrift, keine Rechtsverweise. Ausgeliefert werden nur der Testphase-Banner und
die Sprungmarke. Im Browser ist nach der Hydration alles da und korrekt – geprüft, inkl.
`main#hauptinhalt` und funktionierender Sprungmarke.

## Warum – die technische Ursache

`app/signup/page.js` nutzt in Zeile 32 `useSearchParams()` (für die Parameter `src` und
`error=min_age_required`). Bei einer **statisch vorgerenderten** Seite lässt Next 14 deshalb die
nächste `<Suspense>`-Grenze im Prerender auf ihren **Fallback** zurückfallen. Und dieser Fallback
ist leer:

```jsx
// app/signup/page.js, Z. 291 ff.
export default function SignupPage() {
  return (
    <Suspense>          {/* ← kein fallback */}
      <SignupForm />
    </Suspense>
  );
}
```

`/login` hat dieselbe fallback-lose `<Suspense>`-Grenze, nutzt aber **kein** `useSearchParams()` –
deshalb rendert es serverseitig vollständig. Der Unterschied liegt also **nicht** am `Suspense`
allein, sondern an der Kombination. Das ist wichtig für die Bewertung: Es reicht nicht,
„Suspense-Grenzen zu suchen".

> ⚠️ **Nicht verwechseln:** `/reset-password` liefert serverseitig ebenfalls kaum Inhalt, aber aus
> einem **anderen** Grund – die Seite liest ihren Token bewusst erst im Client und rendert bis dahin
> einen eigenen Ladezustand. Das ist beabsichtigt und nicht Teil dieses Befundes.

---

## Für Vivien – der Ladezustand

Ein `<Suspense>` ohne `fallback` bedeutet: **kein gestalteter Ladezustand**. Zwischen dem ersten
Bild und der Hydration sieht der Besucher den Testphase-Banner auf leerem navy-Grund – sonst nichts.

Das trifft ausgerechnet die Seite, die laut Kommentar in `components/layout/AuthShell.js` der
**QR-Landepunkt** ist, also typischerweise auf einem Telefon in einer Halle geöffnet wird – oft bei
schlechtem Netz, wo die Lücke am längsten ist.

Zu entscheiden ist **nicht**, ob das ein Fehler ist, sondern was dort stehen soll:

- **(a)** Ein gestalteter Fallback im Anzeigetafel-Stil (Logo + Titel + Feldgerüst), damit die Seite
  von Anfang an wie die spätere Seite aussieht und nicht wie ein Abbruch.
- **(b)** Bewusst nichts – wenn die Lücke auf realen Geräten so kurz ist, dass ein Zwischenbild mehr
  flackert als hilft.

Für eine belastbare Entscheidung fehlt eine Messung, **wie lang** die Lücke auf einem echten
Mittelklasse-Telefon im Mobilfunknetz ist. Die habe ich **nicht** gemacht – ohne sie ist jede
Aussage zur Dauer geraten.

---

## Für Nora – die Rechtsflächen

Das ist der Teil, der über Gestaltung hinausgeht.

Am **13.08.2026** wurde festgehalten (`docs/RECHT-LEISTUNGSKARTE-2026-08-13.md`, Fund Nora): Auf
`/signup` war die Datenschutzerklärung **nirgends** verlinkt. Behoben wurde das über
`RechtsLinks` in `components/layout/AuthShell.js` – ausdrücklich dort, „damit Login, Registrierung
und Passwort-Zurücksetzen ihn gemeinsam tragen".

Auf `/login` trägt er. **Auf `/signup` erreicht genau dieser Hinweis das vom Server gelieferte HTML
nicht** – er entsteht erst mit der Hydration. Die Abhilfe von damals greift auf der Seite, für die
sie gebaut wurde, also nur mit JavaScript.

Praktisch heißt das: Auf der Seite, auf der personenbezogene Daten erhoben werden (Registrierung),
sind Datenschutz- und Impressumsverweis nicht Bestandteil der ausgelieferten Seite, sondern eines
nachgeladenen Skripts.

**Offene Fragen an Nora – ausdrücklich keine Rechtsauffassung von mir:**

1. Genügt ein Datenschutzhinweis, der erst nach Ausführung von JavaScript im Dokument steht?
2. Gilt für den Impressumsverweis („leicht erkennbar, unmittelbar erreichbar, ständig verfügbar")
   etwas anderes als für den Datenschutzhinweis?
3. Ändert es die Bewertung, dass die Seite **ohne** JavaScript gar kein Formular zeigt – dass also
   ohne JavaScript auch keine Daten erhoben werden können?

Frage 3 ist vermutlich der Kern und könnte den Punkt entschärfen: Wo nichts erhoben wird, ist
womöglich auch nichts aufzuklären. Das zu beurteilen ist aber nicht meine Aufgabe.

---

## Technische Abhilfe, falls gewünscht

Zwei Wege, beide klein:

1. **Fallback ergänzen** – löst Viviens Punkt, löst Noras Punkt **nicht** (der Fallback ist zwar
   sichtbar, das Formular und die echten Rechtsverweise entstehen weiter erst im Client). Man könnte
   die Rechtsverweise allerdings **in den Fallback** aufnehmen; dann stehen sie im Server-HTML.
2. **`useSearchParams()` enger fassen** – die Parameter-Auswertung in eine eigene, kleine
   Client-Komponente mit eigener Suspense-Grenze ziehen, sodass Formular und `AuthShell` normal
   vorgerendert werden. Löst **beide** Punkte, ist aber der größere Eingriff.

Empfehlung, falls Nora Handlungsbedarf sieht: **Weg 2**. Er stellt den Zustand her, den alle
Beteiligten ohnehin angenommen hatten.

---

## Abgrenzung

- Dieser Befund ist **nicht** durch die Sprungmarken-Arbeit entstanden; er bestand vorher. Aufgefallen
  ist er nur, weil bei der Live-Prüfung das rohe HTML von 14 Routen auf `id="hauptinhalt"` gezählt
  wurde und `/signup` als einzige Route mit `0` herausfiel.
- Die Sprungmarke selbst funktioniert auf `/signup` im Browser einwandfrei (geprüft).
- Nicht gemessen: die tatsächliche Dauer der Lücke auf echten Geräten (s. o.).
