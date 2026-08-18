"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { PiGoogleLogoBold } from "react-icons/pi";
import { setPlayerToken, setStoredPlayer } from "@/lib/clientAuth";
import AuthShell from "@/components/layout/AuthShell";
import Button from "@/components/ui/Button";
import FormAlert from "@/components/ui/FormAlert";
import { inputClass } from "@/lib/ui";
import {
  SIGNUP_SOURCE_KEY,
  SIGNUP_SOURCE_RE as SRC_RE,
  MINDESTALTER_HINWEIS,
  MINDESTALTER_HINWEIS_GOOGLE,
} from "@/lib/constants";

// Kampagnen-Quellen-Tracking (?src=, z.B. Flyer-QR-Codes): serverseitige Regel ist
// verbindlich, hier nur ein leichter Client-Filter vor dem Puffern in sessionStorage.
//
// Schluessel und Muster liegen seit 13.08.2026 in lib/constants.js, weil
// components/AnalyticsTracker.js die Quelle jetzt auf JEDER Route auffaengt —
// zwei Stellen, die denselben sessionStorage-Schluessel schreiben, duerfen ihn
// nicht getrennt buchstabieren. Diese Seite ueberschreibt einen gepufferten
// Wert bewusst: Wer mit ?src= direkt auf der Registrierung landet, macht die
// gezieltere Angabe.

function SignupForm() {
  const router = useRouter();
  // KEIN Adresszeilen-Haken (useSearchParams) AUF DIESER SEITE - er machte
  // die ausgelieferte Seite LEER (Roadmap 22, behoben 19.08.2026).
  // Next rendert /signup statisch vor. Sobald der Haken irgendwo steht, faellt
  // beim Vorrendern die naechste Suspense-Grenze auf ihren Ersatzinhalt
  // zurueck - und der war hier leer. Ergebnis: Das ausgelieferte HTML trug
  // 0 Eingabefelder, 0 <main> und 0 Verweise auf Datenschutz und Impressum -
  // letztere hatte Nora am 13.08. fuer genau diese Seite verlangt.
  // Im Browser war nach dem Nachladen alles da, deshalb fiel es nie auf.
  // Beide Auswertungen unten laufen ohnehin erst im Browser und lesen die
  // Adresszeile jetzt direkt - so, wie es der Google-Effekt hier immer tat.
  // Bewacht durch tests/e2e/signup-ohne-js.spec.mjs.
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Selbstauskunft Mindestalter (13.08.2026). Voreinstellung bewusst NICHT
  // angehakt: Eine vorausgefuellte Bestaetigung ist keine Bestaetigung.
  const [abTZ, setAbTZ] = useState(false);
  const [googleHref, setGoogleHref] = useState("/api/auth/google");

  // Die Bestaetigung muss den Google-Weg mitgehen, sonst waere sie in zehn
  // Sekunden umgangen: Der Callback legt Konten ohne Formular an.
  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get("next");
    const p = new URLSearchParams();
    if (next) p.set("next", next);
    if (abTZ) p.set("minAge", "1");
    const q = p.toString();
    setGoogleHref(q ? `/api/auth/google?${q}` : "/api/auth/google");
  }, [abTZ]);

  // ?src= puffern, damit die Quelle einen Wechsel Login↔Signup überlebt (z.B.
  // Flyer-Link landet auf /signup?src=flyer-koeln, Nutzer wechselt kurz zu /login
  // und zurück zu /signup ohne Query-Param).
  useEffect(() => {
    const src = new URLSearchParams(window.location.search)
      .get("src")
      ?.toLowerCase()
      .trim();
    if (src && SRC_RE.test(src)) {
      window.sessionStorage.setItem(SIGNUP_SOURCE_KEY, src);
    }
  }, []);

  // Rückmeldung vom Google-Weg: Der Callback schickt hierher zurück, wenn die
  // Mindestalter-Bestätigung fehlte. Ohne diese Auswertung wäre der Abbruch
  // stumm und der Nutzer stünde ohne Erklärung wieder am Anfang.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("error") === "min_age_required") {
      setError(
        MINDESTALTER_HINWEIS_GOOGLE,
      );
    }
  }, []);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }
    if (!abTZ) {
      setError(MINDESTALTER_HINWEIS);
      return;
    }

    setLoading(true);
    try {
      const signupSource = window.sessionStorage.getItem(SIGNUP_SOURCE_KEY) || undefined;
      const sessionId = window.localStorage.getItem("analyticsSessionId") || undefined;
      const { data } = await axios.post("/api/player/playerregister", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        signupSource,
        sessionId,
        minAgeConfirmed: abTZ,
      });
      setPlayerToken(data.token);
      setStoredPlayer(data.player);
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(next || "/player/newsfeed");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registrierung fehlgeschlagen. Bitte erneut versuchen."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      image="/images/signup-halle-1880.jpg"
      imageAlt="Wurf in einer Vereinshalle mit Sprossenwänden"
      // Der Werfer steht links der Bildmitte; ein mittiger Beschnitt im hohen
      // Halbbild würde ihn abschneiden.
      imagePosition="35% center"
      title="Registrieren"
      // Die Altersgrenze steht seit 14.08.2026 VOR den Feldern, nicht erst am
      // Häkchen darunter (Befund Lina, Wortlaut Nele). Vorher füllte ein
      // 14-Jähriger das ganze Formular aus und erfuhr erst beim Absenden, dass
      // er nicht darf.
      // Der genannte Grund ist eine Tatsache über das Produkt, keine
      // Rechtsaussage: `fetchsingleplayerinfo` verlangt keinen Token und gibt
      // Name, Verein und Werte heraus, `/spieler` und `/topscorer` sind
      // ungeschützt. Deshalb „auch ohne Konto" – geprüft, nicht behauptet.
      // ⚠️ Bewusst NICHT „gesetzlich vorgeschrieben" (es gibt keine solche
      // Norm, es ist eine Betreiberentscheidung) und NICHT „wir prüfen dein
      // Alter" (wird nicht geprüft) – Noras rote Linien.
      subtitle="Dein kostenloses Spielerprofil – ab 16 Jahren. Der Grund: Name, Verein und deine Zahlen sieht hier jeder, auch ohne Konto."
      footer={
        <>
          Bereits ein Konto?{" "}
          <Link href="/login" className="text-brand-400 font-medium hover:underline">
            Jetzt anmelden
          </Link>
        </>
      }
    >
      {error && <FormAlert className="mb-4">{error}</FormAlert>}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-mist-300 mb-1">Vorname</label>
            <input
              name="firstName"
              autoComplete="given-name"
              required
              value={form.firstName}
              onChange={onChange}
              className={inputClass}
              placeholder="Max"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-mist-300 mb-1">Nachname</label>
            <input
              name="lastName"
              autoComplete="family-name"
              required
              value={form.lastName}
              onChange={onChange}
              className={inputClass}
              placeholder="Mustermann"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-mist-300 mb-1">E-Mail</label>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={onChange}
            className={inputClass}
            placeholder="name@beispiel.de"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-mist-300 mb-1">Passwort</label>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={onChange}
            className={inputClass}
            placeholder="Mind. 6 Zeichen"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-mist-300 mb-1">
            Passwort bestätigen
          </label>
          <input
            type="password"
            name="confirm"
            autoComplete="new-password"
            required
            value={form.confirm}
            onChange={onChange}
            className={inputClass}
            placeholder="••••••••"
          />
        </div>

        {/* Mindestalter-Selbstauskunft. Bewusst KEIN Geburtsdatum: `age` und
            `birthdate` sind über die öffentliche Profil-API einsehbar – ein
            Pflichtfeld dafür würde die Datenmenge vergrößern, statt sie zu
            begrenzen. Serverseitig erzwungen in playerregister. */}
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={abTZ}
            onChange={(e) => setAbTZ(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-brand-500"
          />
          <span className="text-sm text-mist-300">
            Ich bin mindestens 16 Jahre alt.
          </span>
        </label>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Konto wird erstellt…" : "Konto erstellen"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-navy-700" />
        <span className="text-xs text-mist-400">oder</span>
        <div className="h-px flex-1 bg-navy-700" />
      </div>

      {/* Ohne Bestätigung führt der Google-Weg nicht weiter – sonst wäre die
          Altersabfrage mit einem Klick daneben umgangen. Bewusst kein
          ausgegrauter Knopf ohne Erklärung: Der Fehlertext sagt, was fehlt. */}
      <a
        href={abTZ ? googleHref : undefined}
        role={abTZ ? undefined : "button"}
        aria-disabled={abTZ ? undefined : "true"}
        tabIndex={0}
        onClick={(e) => {
          if (abTZ) return;
          e.preventDefault();
          setError(MINDESTALTER_HINWEIS_GOOGLE);
        }}
        // Tastatur: Ein `a` ohne `href` löst bei Enter kein Klick-Ereignis aus.
        // Ohne das hier bekäme nur die Maus die Erklärung, und wer per Tastatur
        // bedient, drückt ins Leere (Fund von Tobias).
        onKeyDown={(e) => {
          if (abTZ) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setError(MINDESTALTER_HINWEIS_GOOGLE);
          }
        }}
        className={`w-full flex items-center justify-center gap-2 border rounded-sm px-4 py-2.5 font-medium transition-colors ${
          abTZ
            ? "border-navy-600 hover:border-brand-500 text-mist-300 cursor-pointer"
            : "border-navy-700 text-mist-600 cursor-not-allowed"
        }`}
      >
        <PiGoogleLogoBold className="text-brand-400" />
        Mit Google registrieren
      </a>
    </AuthShell>
  );
}

// Die Suspense-Grenze ist entfallen: Sie umschloss die GANZE Seite und hatte
// keinen Ersatzinhalt. Ohne den Adresszeilen-Haken gibt es nichts mehr, worauf
// sie warten muesste.
export default function SignupPage() {
  return <SignupForm />;
}
