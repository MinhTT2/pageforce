const FALLBACK_RANDOM_LENGTH = 6;

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 64);
}

export function fallbackSlug(input: string) {
  const slug = slugify(input);
  const random = Math.random().toString(36).slice(2, 2 + FALLBACK_RANDOM_LENGTH) || "random";

  return slug || `page-${Date.now()}-${random}`;
}
