import crypto from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const EXT_BY_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

// Speichert eine hochgeladene Bilddatei unter public/<dir>/ und gibt die öffentliche URL zurück.
// Rückgabe: { ok: true, url } oder { ok: false, message }
export async function saveImage(file, dir) {
  if (!file || typeof file.arrayBuffer !== "function") {
    return { ok: false, message: "Keine Datei empfangen" };
  }
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) {
    return { ok: false, message: "Nur JPG, PNG, WEBP oder GIF erlaubt" };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: "Die Datei ist zu groß (max. 4 MB)" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${crypto.randomBytes(8).toString("hex")}.${ext}`;
  const targetDir = path.join(process.cwd(), "public", dir);

  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, filename), buffer);

  return { ok: true, url: `/${dir}/${filename}` };
}
