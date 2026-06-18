import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { and, desc, eq } from 'drizzle-orm'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeShikiFromHighlighter from '@shikijs/rehype/core'
import { getDb } from './db'
import { posts } from '../../drizzle/schema'
import { getHighlighter } from '~/lib/shiki'

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
      transformers: [
        {
          // expose the language so the client can render a label
          pre(node) {
            node.properties['data-language'] = this.options.lang
          },
        },
      ],
    })
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

/** Public: single published post by slug, with markdown rendered to HTML. */
export const getRenderedPost = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const db = getDb()
    const post = await db.query.posts.findFirst({
      where: and(eq(posts.slug, data.slug), eq(posts.status, 'published')),
    })
    if (!post) return null
    const html = await renderMarkdown(post.content)
    return { post, html }
  })
