import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getBaseUrl, googleRedirectUri } from "@/lib/baseUrl";

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
  const safeNext =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : null;

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
  return res;
}
