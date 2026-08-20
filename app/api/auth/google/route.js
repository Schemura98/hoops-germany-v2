import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getBaseUrl, googleRedirectUri } from "@/lib/baseUrl";
import { sichererPfad } from "@/lib/sichererPfad";

// GET /api/auth/google – leitet zum Google-Consent-Screen weiter.
export async function GET(req) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { success: false, message: "Google OAuth ist nicht konfiguriert" },
      { status: 500 }
    );
  }

  const base = getBaseUrl(req);
  const state = randomUUID();

  // Zielort nach dem Login merken (nur interne Pfade zulassen).
  const nextParam = new URL(req.url).searchParams.get("next");
  const safeNext = sichererPfad(nextParam);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: googleRedirectUri(req),
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state,
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  const res = NextResponse.redirect(authUrl);
  // State-Cookie zur CSRF-Absicherung (10 Minuten gültig)
  res.cookies.set("g_oauth_state", state, {
    httpOnly: true,
    secure: base.startsWith("https"),
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  if (safeNext) {
    res.cookies.set("g_oauth_next", safeNext, {
      httpOnly: true,
      secure: base.startsWith("https"),
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
  }
  // Mindestalter-Selbstauskunft mitnehmen (13.08.2026). /signup hängt
  // `?minAge=1` an, sobald der Nutzer bestätigt hat. Der Callback legt NEUE
  // Konten nur an, wenn dieses Cookie da ist – sonst wäre die Altersabfrage
  // über „Mit Google registrieren" mit einem Klick umgangen.
  // Anmeldungen BESTEHENDER Konten sind davon unberührt.
  if (new URL(req.url).searchParams.get("minAge") === "1") {
    res.cookies.set("g_oauth_minage", "1", {
      httpOnly: true,
      secure: base.startsWith("https"),
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
  } else {
    // Ohne Bestätigung das Cookie aktiv löschen (Kai): Der Callback löscht es
    // nur auf dem Erfolgspfad. Sonst könnte eine Bestätigung aus einem
    // abgebrochenen Anlauf bis zu zehn Minuten später einen Anlauf von /login
    // aus mittragen, bei dem nie jemand ein Häkchen gesetzt hat.
    res.cookies.delete("g_oauth_minage");
  }
  return res;
}
