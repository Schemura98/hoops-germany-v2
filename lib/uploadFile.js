import crypto from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import convert from "heic-convert";

const MAX_MB = 4;
const MAX_BYTES = MAX_MB * 1024 * 1024; // 4 MB
const EXT_BY_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

// Erkennt iPhone-Fotos (HEIC/HEIF). Manche Browser senden HEIC OHNE MIME-Typ
// (file.type leer) → zusätzlich über die Dateiendung erkennen.
function isHeic(file) {
  const type = (file.type || "").toLowerCase();
  if (type === "image/heic" || type === "image/heif") return true;
  return /\.(heic|heif)$/i.test(file.name || "");
}

// Speichert eine hochgeladene Bilddatei unter public/<dir>/ und gibt die öffentliche URL zurück.
// HEIC/HEIF (iPhone) wird nach JPEG konvertiert, damit das Bild in ALLEN Browsern angezeigt
// werden kann (HEIC kann außerhalb von Safari nicht dargestellt werden).
// Rückgabe: { ok: true, url } oder { ok: false, message }
export async function saveImage(file, dir) {
  if (!file || typeof file.arrayBuffer !== "function") {
    return { ok: false, message: "Keine Datei empfangen" };
  }

  const heic = isHeic(file);
  let ext = EXT_BY_TYPE[file.type];
  if (!heic && !ext) {
    return { ok: false, message: "Nur JPG, PNG, WEBP, GIF oder HEIC erlaubt" };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: `Die Datei ist zu groß (max. ${MAX_MB} MB)` };
  }

  let buffer = Buffer.from(await file.arrayBuffer());

  if (heic) {
    try {
      const jpeg = await convert({ buffer, format: "JPEG", quality: 0.85 });
      buffer = Buffer.from(jpeg);
      ext = "jpg";
    } catch {
      return {
        ok: false,
        message:
          "Das iPhone-Foto (HEIC) konnte nicht verarbeitet werden. Bitte als JPG speichern und erneut versuchen.",
      };
    }
  }

  const filename = `${crypto.randomBytes(8).toString("hex")}.${ext}`;
  const targetDir = path.join(process.cwd(), "public", dir);

  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, filename), buffer);

  return { ok: true, url: `/${dir}/${filename}` };
}
