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
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    excerpt: text('excerpt'),
    content: text('content').notNull(), // raw markdown (source of truth)
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
    index('posts_status_idx').on(t.status),
    index('posts_status_created_idx').on(t.status, t.createdAt),
  ],
)

export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
