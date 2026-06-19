import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { count, desc, eq, sql } from 'drizzle-orm'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeShikiFromHighlighter from '@shikijs/rehype/core'
import { getDb } from './db'
import { posts } from '../../drizzle/schema'
import { getHighlighter } from '~/lib/shiki'
import { isAdmin } from './middleware/access.server'

// rehype plugin: wrap each Shiki <pre> in a header bar (language label + copy
// button) at RENDER time, so it's in the SSR HTML and appears instantly (the
// client only wires up the copy click). Avoids the "only after refresh" lag.
function rehypeWrapCode() {
  return (tree: any) => {
    const walk = (node: any) => {
      if (!node || !Array.isArray(node.children)) return
      node.children = node.children.map((child: any) => {
        if (
          child?.type === 'element' &&
          child.tagName === 'pre' &&
          child.properties?.['data-language'] != null
        ) {
          const lang = String(child.properties['data-language'] || 'text')
          return {
            type: 'element',
            tagName: 'div',
            properties: { className: ['code-block'] },
            children: [
              {
                type: 'element',
                tagName: 'div',
                properties: { className: ['code-header'] },
                children: [
                  el('span', { className: ['code-lang'] }, lang),
                  el('button', { type: 'button', className: ['code-copy'] }, '복사'),
                ],
              },
              child,
            ],
          }
        }
        walk(child)
        return child
      })
    }
    walk(tree)
  }
}
const el = (tagName: string, properties: any, text: string) => ({
  type: 'element',
  tagName,
  properties,
  children: [{ type: 'text', value: text }],
})

// Server-only: render markdown → HTML with GFM + Shiki syntax highlighting.
// Only called inside handlers, so it's stripped from the client bundle.
async function renderMarkdown(md: string): Promise<string> {
  const highlighter = await getHighlighter()
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeShikiFromHighlighter, highlighter, {
      theme: 'github-light',
      // No-language or unrecognized fences render as plain text — still
      // Shiki-styled (light surface + header), never an unstyled dark <pre>.
      defaultLanguage: 'text',
      fallbackLanguage: 'text',
      transformers: [
        {
          // expose the language so we can render a label
          pre(node) {
            node.properties['data-language'] = this.options.lang
          },
        },
      ],
    })
    .use(rehypeWrapCode)
    .use(rehypeStringify)
    .process(md)
  return String(file)
}

/** Number of posts shown per list page. */
export const PAGE_SIZE = 10

const pageInput = z.object({ page: z.number().int().min(1).default(1) })

/** Public: published posts, newest first, paginated 10 per page. */
export const listPosts = createServerFn({ method: 'GET' })
  .validator(pageInput)
  .handler(async ({ data }) => {
    const db = getDb()
    const where = eq(posts.status, 'published')
    const [items, [{ value: total }]] = await Promise.all([
      db.query.posts.findMany({
        where,
        // createdAt is day-granular, so same-day posts tie — break the tie by
        // rowid (insertion order) so ordering is deterministic & newest-first.
        orderBy: [desc(posts.createdAt), desc(sql`rowid`)],
        limit: PAGE_SIZE,
        offset: (data.page - 1) * PAGE_SIZE,
      }),
      db.select({ value: count() }).from(posts).where(where),
    ])
    return { items, total, page: data.page, pageSize: PAGE_SIZE }
  })

/** Public: published posts that include a given tag, newest first, paginated. */
export const listPostsByTag = createServerFn({ method: 'GET' })
  .validator(pageInput.extend({ tag: z.string().min(1) }))
  .handler(async ({ data }) => {
    const db = getDb()
    const all = await db.query.posts.findMany({
      where: eq(posts.status, 'published'),
      orderBy: [desc(posts.createdAt), desc(sql`rowid`)],
    })
    // tags are stored as JSON, so filter in memory then page the result.
    const filtered = all.filter((p) => p.tags.includes(data.tag))
    const start = (data.page - 1) * PAGE_SIZE
    return {
      items: filtered.slice(start, start + PAGE_SIZE),
      total: filtered.length,
      page: data.page,
      pageSize: PAGE_SIZE,
    }
  })

/**
 * Single post by slug, rendered to HTML. Published posts are public; drafts are
 * visible only to an authenticated admin (so they can preview before publishing).
 */
export const getRenderedPost = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const db = getDb()
    const post = await db.query.posts.findFirst({
      where: eq(posts.slug, data.slug),
    })
    if (!post) return null
    if (post.status !== 'published' && !(await isAdmin())) return null // hide drafts
    const html = await renderMarkdown(post.content)
    return { post, html }
  })
