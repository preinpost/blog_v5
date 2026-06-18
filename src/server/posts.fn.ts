import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { desc, eq } from 'drizzle-orm'
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

/** Public: published posts, newest first. */
export const listPosts = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb()
  return db.query.posts.findMany({
    where: eq(posts.status, 'published'),
    orderBy: [desc(posts.createdAt)],
  })
})

/** Public: published posts that include a given tag, newest first. */
export const listPostsByTag = createServerFn({ method: 'GET' })
  .validator(z.object({ tag: z.string().min(1) }))
  .handler(async ({ data }) => {
    const db = getDb()
    const all = await db.query.posts.findMany({
      where: eq(posts.status, 'published'),
      orderBy: [desc(posts.createdAt)],
    })
    return all.filter((p) => p.tags.includes(data.tag))
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
