import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { desc, eq } from 'drizzle-orm'
import { getDb } from './db'
import { posts } from '../../drizzle/schema'
import { verifyAccess } from './middleware/access.server'
import { slugify } from '~/lib/slug'

// verifyAccess() is called inside every handler below. Because it is only
// referenced inside .handler() bodies (never as a top-level/middleware value),
// the bundler strips it — and its server-only imports — from the client bundle.

/** Returns the authenticated admin user (used to gate the /admin layout). */
export const requireAdmin = createServerFn({ method: 'GET' }).handler(
  async () => {
    return verifyAccess()
  },
)

/** Admin: all posts (incl. drafts), most recently updated first. */
export const listAllPosts = createServerFn({ method: 'GET' }).handler(
  async () => {
    await verifyAccess()
    const db = getDb()
    return db.query.posts.findMany({ orderBy: [desc(posts.createdAt)] })
  },
)

/** Admin: a single post by id (incl. drafts) for editing. */
export const getPostById = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await verifyAccess()
    const db = getDb()
    const row = await db.query.posts.findFirst({ where: eq(posts.id, data.id) })
    return row ?? null
  })

const PostInput = z.object({
  title: z.string().min(1, '제목을 입력하세요'),
  slug: z.string().optional(),
  content: z.string(),
  excerpt: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published']).default('draft'),
  coverImage: z.string().optional(),
  date: z.string().optional(), // YYYY-MM-DD — controls the displayed (created) date
})

export const createPost = createServerFn({ method: 'POST' })
  .validator(PostInput)
  .handler(async ({ data }) => {
    await verifyAccess()
    const db = getDb()
    const id = crypto.randomUUID()
    const slug = data.slug?.trim() || slugify(data.title)
    const now = new Date()
    const createdAt = data.date ? new Date(data.date) : now
    await db.insert(posts).values({
      id,
      slug,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      tags: data.tags,
      status: data.status,
      coverImage: data.coverImage,
      createdAt,
      updatedAt: now,
      publishedAt: data.status === 'published' ? createdAt : null,
    })
    return { id, slug }
  })

export const updatePost = createServerFn({ method: 'POST' })
  .validator(PostInput.extend({ id: z.string() }))
  .handler(async ({ data }) => {
    await verifyAccess()
    const db = getDb()
    const existing = await db.query.posts.findFirst({
      where: eq(posts.id, data.id),
    })
    if (!existing) throw new Response('Not found', { status: 404 })

    const now = new Date()
    const slug = data.slug?.trim() || slugify(data.title)
    const createdAt = data.date ? new Date(data.date) : existing.createdAt
    // Preserve the original publish date; only stamp it on first publish.
    const publishedAt =
      data.status === 'published' ? (existing.publishedAt ?? createdAt) : null

    await db
      .update(posts)
      .set({
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        tags: data.tags,
        status: data.status,
        coverImage: data.coverImage,
        createdAt,
        updatedAt: now,
        publishedAt,
      })
      .where(eq(posts.id, data.id))
    return { id: data.id, slug }
  })

export const deletePost = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await verifyAccess()
    const db = getDb()
    await db.delete(posts).where(eq(posts.id, data.id))
    return { ok: true }
  })
