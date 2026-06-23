import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;

function getSecret() {
  if (!SECRET_KEY) {
    throw new Error("SECRET_KEY ist nicht gesetzt (siehe .env.example).");
  }
  return SECRET_KEY;
}

// ----- Token erstellen -----
export function signPlayerToken(payload, expiresIn = "30d") {
  // payload sollte mindestens { id / playerId } enthalten
  return jwt.sign({ ...payload, type: "player" }, getSecret(), { expiresIn });
}

export function signTeamToken(payload, expiresIn = "30d") {
  // payload sollte mindestens { teamId } enthalten
  return jwt.sign({ ...payload, type: "team" }, getSecret(), { expiresIn });
}

export function signToken(payload, expiresIn = "30d") {
  return jwt.sign(payload, getSecret(), { expiresIn });
}

// ----- Token verifizieren -----
export function verifyToken(token) {
  try {
    return jwt.verify(token, getSecret());
  } catch (err) {
    return null;
  }
}

// ----- Token aus Request lesen -----
// Akzeptiert sowohl Authorization-Header ("Bearer ...") als auch
// einen im Body übergebenen Token (Frontend nutzt häufig localStorage + Body).
export function getTokenFromRequest(req, bodyToken) {
  const authHeader = req?.headers?.get?.("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return bodyToken || null;
}
