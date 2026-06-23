// Erzeugt URL-freundliche Slugs (mit deutscher Umlaut-Behandlung).
export function slugify(str) {
  return (
    String(str || "")
      .toLowerCase()
      .trim()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "team"
  );
}

// Liefert einen für das Model garantiert eindeutigen Slug
// (hängt -1, -2, … an, falls der Basis-Slug schon existiert).
export async function uniqueSlug(Model, base) {
  const slug = slugify(base);
  let candidate = slug;
  let i = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Model.exists({ slug: candidate })) {
    candidate = `${slug}-${i++}`;
  }
  return candidate;
}
