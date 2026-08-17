// Deploy-Gate 15.08.2026: `update-profile` prüft den WERT von `position`.
//
// Befund Kai. Die Doku behauptete, ein Kürzel wie „SF" könne auf Prod „nur
// entstehen, wenn jemand direkt in die DB schreibt". Falsch – und in der
// gefährlichen Richtung falsch, weil es wie eine Garantie klang:
//   · `update-profile` führte `position` in einer FELD-Weißliste,
//     der Wert wurde nie geprüft,
//   · `models/Player.js` hat `position: String` ohne Enum.
// Dass das Profilformular ein `select` benutzt, ist eine Aussage über den
// Browser, nicht über die API.
//
// Dieser Test greift die API direkt an – im Browser ließe sich der Fall gar
// nicht herstellen, denn genau das war ja die falsche Annahme.
//
// Läuft gegen die Dev-DB `hoopsgermany` (Guard in global-setup). Er ändert die
// Position eines Seed-Kontos und setzt sie am Ende zurück.
import { test, expect } from "@playwright/test";

const KONTO = { email: "max@test.de", password: "test123" };

async function anmelden(request) {
  const antwort = await request.post("/api/player/playerlogin", {
    data: { email: KONTO.email, password: KONTO.password },
  });
  expect(
    antwort.ok(),
    "Seed-Konto max@test.de fehlt – seed-demo.mjs laufen lassen",
  ).toBe(true);
  const koerper = await antwort.json();
  return koerper.data?.token || koerper.token;
}

async function positionLesen(request, token) {
  const antwort = await request.post("/api/player/getmyinfo", {
    data: { token },
  });
  const koerper = await antwort.json();
  return (koerper.data?.player || koerper.player)?.position || "";
}

async function ortLesen(request, token) {
  const antwort = await request.post("/api/player/getmyinfo", {
    data: { token },
  });
  const koerper = await antwort.json();
  return (koerper.data?.player || koerper.player)?.hometown || "";
}

async function positionSetzen(request, token, position) {
  return request.post("/api/player/update-profile", {
    data: { token, position },
  });
}

// ⚠️ Jeder Test stellt seinen Ausgangszustand SELBST her.
//
// Ohne das war diese Datei beim zweiten Lauf rot – und zwar zu Recht: Meine
// eigene Gegenprobe hatte die Prüfung testweise ausgebaut, wodurch der Test
// „beliebiger Text wird abgewiesen" seinen ungültigen Wert echt in die Dev-DB
// schrieb. Beim nächsten Lauf war derselbe Wert schon gespeichert, das Setzen
// also UNVERÄNDERT – und unverändert ist nach der neuen Regel absichtlich
// erlaubt. Der Test maß danach nicht mehr die Ablehnung, sondern die Ausnahme
// für Altbestand.
//
// Das ist dieselbe Falle wie beim Chip-Layout-Test am 14.08.: Ein Test, der
// seinen eigenen Ausgangszustand verändert, ist beim ZWEITEN Lauf rot. Höhere
// Timeouts helfen dagegen nie – nur ein definierter Startwert.
const START = "Point Guard";

async function startZustand(request) {
  const token = await anmelden(request);
  const antwort = await positionSetzen(request, token, START);
  expect(
    antwort.status(),
    `Ausgangszustand ${START} ließ sich nicht setzen – steht im Konto ein ` +
      `ungültiger Altwert? (tmp/dev-position-pruefen.mjs zeigt ihn an)`,
  ).toBe(200);
  expect(await positionLesen(request, token)).toBe(START);
  return token;
}

test.describe("Position: Werteprüfung in update-profile", () => {
  test("ein Kürzel wird abgewiesen und NICHT gespeichert", async ({
    request,
  }) => {
    const token = await startZustand(request);
    const vorher = START;

    const antwort = await positionSetzen(request, token, "SF");
    expect(
      antwort.status(),
      "SF ist kein Wert aus ALL_ROLES und muss abgelehnt werden",
    ).toBe(400);

    // ⚠️ Der eigentliche Punkt: nicht nur die Antwort prüfen, sondern den
    // gespeicherten Zustand. Eine Route kann 400 melden und vorher trotzdem
    // geschrieben haben.
    expect(
      await positionLesen(request, token),
      "abgelehnt, aber trotzdem gespeichert – das wäre schlimmer als gar keine Prüfung",
    ).toBe(vorher);
  });

  test("beliebiger Text wird abgewiesen", async ({ request }) => {
    const token = await startZustand(request);
    expect(
      (await positionSetzen(request, token, "Kapitän der Herzen")).status(),
    ).toBe(400);
    expect(await positionLesen(request, token)).toBe(START);
  });

  test("ein gültiger Wert geht weiterhin durch", async ({ request }) => {
    // Gegenprobe. Ohne sie wäre eine Route, die JEDE Position ablehnt,
    // ebenfalls grün – und das Profil praktisch kaputt.
    const token = await startZustand(request);

    expect(
      (await positionSetzen(request, token, "Small Forward")).status(),
    ).toBe(200);
    expect(await positionLesen(request, token)).toBe("Small Forward");

    // Auch eine Funktion aus PLAYER_ROLES ist gültig, nicht nur eine Spielposition.
    expect((await positionSetzen(request, token, "Coach")).status()).toBe(200);
    expect(await positionLesen(request, token)).toBe("Coach");

    await positionSetzen(request, token, START);
    expect(
      await positionLesen(request, token),
      "Ausgangszustand nicht wiederhergestellt",
    ).toBe(START);
  });

  test("ein unveränderter Wert blockiert das Profil nicht", async ({
    request,
  }) => {
    // ⚠️ Das ist die Falle, in die die erste Fassung der Altersprüfung gelaufen
    // ist (Fund von Kai): Das Formular schickt beim Speichern IMMER alle Felder
    // mit, auch unveränderte. Eine strenge Prüfung hätte jedes Bestandskonto
    // mit Altwert komplett unbedienbar gemacht – Position ändern konnte man ja
    // gerade nicht mehr.
    //
    // Hier ohne DB-Zugriff nachgestellt: derselbe Wert wird erneut geschickt.
    // Der zweite Aufruf ist aus Sicht der Route „unverändert" und muss
    // durchgehen, auch wenn ein anderes Feld mitkommt.
    //
    // ⚠️ Was dieser Test NICHT belegt: den Fall eines gespeicherten UNGÜLTIGEN
    // Altwerts. Dafür müsste er an der API vorbei in die DB schreiben. Die
    // Route behandelt beide Fälle über denselben Vergleich („neuer Wert ==
    // gespeicherter Wert?"), belegt ist hier aber nur der gültige Zweig.
    const token = await startZustand(request);

    // ⚠️ Das mitgeschickte Zweitfeld muss wiederhergestellt werden.
    //
    // Die erste Fassung schickte hart `hometown: "Köln"` und stellte es nie
    // zurück. In der Dev-DB stand danach dauerhaft Köln bei Bundesland Berlin –
    // ein widersprüchliches Paar, das kein Test rot macht, aber jede spätere
    // Prüfung an dieser Stelle verwirrt. Gefunden im zweiten Review-Durchlauf.
    // Der Kopfkommentar behauptete „setzt sie am Ende zurück" und meinte nur
    // die Position.
    const vorherOrt = await ortLesen(request, token);
    const antwort = await request.post("/api/player/update-profile", {
      data: { token, position: START, hometown: "Köln" },
    });
    expect(
      antwort.status(),
      "unveränderte Position + anderes Feld muss speicherbar bleiben",
    ).toBe(200);

    // Zweitfeld zurückstellen und das auch nachweisen – ein Aufräumschritt,
    // der nicht geprüft wird, ist keiner.
    await request.post("/api/player/update-profile", {
      data: { token, position: START, hometown: vorherOrt },
    });
    expect(await ortLesen(request, token), "Wohnort nicht zurückgestellt").toBe(
      vorherOrt,
    );
  });
});
