/**
 * Make a URL-friendly slug. Keeps Unicode letters (incl. Korean) and numbers,
 * so a Korean title yields a readable Korean slug.
 */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
