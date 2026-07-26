/** Canonical site origin, used to build absolute URLs (canonical tags, OG). */
export const SITE_URL = 'https://blog.preinpost.in'

/** Absolute canonical URL for a post, given its slug. */
export function postUrl(slug: string): string {
  return `${SITE_URL}/posts/${encodeURIComponent(slug)}`
}

/** Absolute short/share URL for a post, given its public number. */
export function shortPostUrl(no: number): string {
  return `${SITE_URL}/p/${no}`
}
