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

/** Decode the handful of entities that survive tag-stripping. */
function decodeEntities(s: string): string {
  return s
    .replace(/&(nbsp|#160|#xa0);/gi, ' ')
    .replace(/&(lt|#60);/gi, '<')
    .replace(/&(gt|#62);/gi, '>')
    .replace(/&(quot|#34);/gi, '"')
    .replace(/&(apos|#39);/gi, "'")
    .replace(/&(amp|#38);/gi, '&')
}

/**
 * Strip a full HTML document to plain text for previews.
 * <head> (title/meta/style) and <script>/<style>/<svg> are dropped entirely so
 * CSS text never leaks into the card; block tags become spaces so words don't
 * glue together.
 */
function htmlToPlain(html: string): string {
  return decodeEntities(
    html
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<!DOCTYPE[^>]*>/gi, ' ')
      .replace(
        /<(head|script|style|noscript|svg|template|iframe)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
        ' ',
      )
      .replace(/<[^>]+>/g, ' '),
  )
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
  contentType?: 'markdown' | 'html' | null
  title?: string
}): string {
  const e = post.excerpt?.trim()
  if (e && endsClean(e)) return e
  let plain =
    post.contentType === 'html'
      ? htmlToPlain(post.content)
      : toPlain(post.content)
  // The document usually opens with its own headline — drop it so the card
  // doesn't repeat the title right under the title.
  const t = post.title?.trim()
  if (t && plain.startsWith(t)) plain = plain.slice(t.length).trim()
  return ellipsize(plain)
}
