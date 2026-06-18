/** Strip markdown to plain text for previews. */
function toPlain(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ') // fenced code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links → text
    .replace(/^#{1,6}\s+/gm, '') // headings
    .replace(/[#>*`_~]/g, '') // inline marks
    .replace(/\s+/g, ' ')
    .trim()
}

/** True if the text ends with sentence-final punctuation (looks complete). */
function endsClean(s: string): boolean {
  return /[.!?…。」』”’)]\s*$/.test(s.trim())
}

/** Truncate at a word boundary near `max` chars and append an ellipsis. */
function ellipsize(s: string, max = 150): string {
  if (s.length <= max) return s
  const cut = s.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  const base = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut
  return base.replace(/[\s.,;:·\-]+$/, '') + '…'
}

/**
 * Excerpt for list cards: keep a clean author-written excerpt as-is; otherwise
 * derive one from the content with a word-boundary cut + ellipsis.
 */
export function deriveExcerpt(post: {
  excerpt: string | null
  content: string
}): string {
  const e = post.excerpt?.trim()
  if (e && endsClean(e)) return e
  return ellipsize(toPlain(post.content))
}
