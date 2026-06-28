import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import { getTeamForCapability } from "@/lib/serverAuth";
import { saveImage } from "@/lib/uploadFile";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/upload/team-image – Logo oder Banner hochladen (multipart, Dual-Auth).
async function handler(req) {
  const formData = await req.formData();
  const token = formData.get("token");
  const file = formData.get("file");
  const type = formData.get("type"); // "logo" | "banner"

  const team = await getTeamForCapability(token, "einstellungen");
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }
  if (!["logo", "banner"].includes(type)) {
    return fail("Ungültiger Bildtyp", 400);
  }

  const result = await saveImage(file, "team");
  if (!result.ok) {
    return fail(result.message, 400);
  }

  await connectDB();
  await Team.findByIdAndUpdate(team._id, { $set: { [type]: result.url } });

  return ok({ url: result.url, type });
}

export const POST = withErrorHandling(handler);
