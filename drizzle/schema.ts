import { sql } from 'drizzle-orm'
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

export const posts = sqliteTable(
  'posts',
  {
    id: text('id').primaryKey(), // crypto.randomUUID()
    // Short, stable, monotonically-increasing public number for share URLs
    // (/p/:no). Allocated from the `counters` table, so it is never reused —
    // deleting a post leaves a gap but never shifts other numbers.
    postNo: integer('post_no'),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    excerpt: text('excerpt'),
    content: text('content').notNull(), // markdown source, or full HTML doc when contentType === 'html'
    contentType: text('content_type', { enum: ['markdown', 'html'] })
      .notNull()
      .default('markdown'),
    tags: text('tags', { mode: 'json' })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
    status: text('status', { enum: ['draft', 'published'] })
      .notNull()
      .default('draft'),
    coverImage: text('cover_image'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    publishedAt: integer('published_at', { mode: 'timestamp_ms' }),
  },
  (t) => [
    uniqueIndex('posts_slug_unique').on(t.slug),
    uniqueIndex('posts_post_no_unique').on(t.postNo),
    index('posts_status_idx').on(t.status),
    index('posts_status_created_idx').on(t.status, t.createdAt),
  ],
)

/**
 * Named monotonic counters. Row `post_no` hands out the next public post
 * number via an atomic upsert (INSERT ... ON CONFLICT DO UPDATE ... RETURNING),
 * guaranteeing numbers are never reused even if the newest post is deleted.
 */
export const counters = sqliteTable('counters', {
  name: text('name').primaryKey(),
  value: integer('value').notNull().default(0),
})

export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
