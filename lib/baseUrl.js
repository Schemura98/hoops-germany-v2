// Liefert die Basis-URL der App – bevorzugt NEXTAUTH_URL, sonst der Origin
// der eingehenden Anfrage (für lokale Entwicklung auf localhost).
export function getBaseUrl(req) {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  }
  try {
    return new URL(req.url).origin;
  } catch {
    return "http://localhost:3000";
  }
}

export function googleRedirectUri(req) {
  return `${getBaseUrl(req)}/api/auth/google/callback`;
}
