import { NextResponse } from "next/server";

// Einheitliche API-Antworten für alle Route-Handler.
export function ok(data = {}, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function fail(message = "Ein Fehler ist aufgetreten", status = 400, extra = {}) {
  return NextResponse.json({ success: false, message, ...extra }, { status });
}

// Wrapper für Route-Handler: fängt unerwartete Fehler einheitlich ab.
export function withErrorHandling(handler) {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      console.error("[API ERROR]", err);
      return fail("Interner Serverfehler", 500);
    }
  };
}
