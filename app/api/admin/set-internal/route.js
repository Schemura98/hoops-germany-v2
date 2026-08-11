import mongoose from "mongoose";
import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import Team from "@/models/Team";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/set-internal – markiert ein Team oder einen Spieler als
// internen Testaccount (oder hebt die Markierung auf).
//
// Zweck: Interne Konten sind real angelegt, gehören aber uns selbst
// („Test Baskets", Demo-Coach, Entwickler-Profile). Sie dürfen nicht in
// Beteiligungszahlen einfließen – sonst zählt sich das Projekt selbst
// (Neles Voraussetzung, docs/LANDING-COPY-2026-08-11.md §7).
//
// Ändert ausschließlich dieses eine Feld; nichts wird gelöscht oder verborgen.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  const { art, id } = body;
  const isInternal = !!body.isInternal;
  if (!id || (art !== "team" && art !== "spieler")) {
    return fail("Ungültige Angaben (art muss 'team' oder 'spieler' sein)", 400);
  }
  // Ohne diese Prüfung wirft Mongoose bei einer strukturell ungültigen ID einen
  // CastError, der als 500 herauskommt – fachlich ist es aber eine
  // Falscheingabe (Befund Kai, 12.08.2026).
  if (!mongoose.isValidObjectId(id)) {
    return fail("Ungültige ID", 400);
  }

  await connectDB();
  const Model = art === "team" ? Team : Player;
  const doc = await Model.findByIdAndUpdate(id, { isInternal }, { new: true }).select(
    art === "team" ? "teamName isInternal" : "firstName lastName isInternal"
  );
  if (!doc) return fail("Nicht gefunden", 404);

  return ok({
    id: String(doc._id),
    isInternal: !!doc.isInternal,
    name: art === "team" ? doc.teamName : `${doc.firstName} ${doc.lastName}`.trim(),
  });
}

export const POST = withErrorHandling(handler);
