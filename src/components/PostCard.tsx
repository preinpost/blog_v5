import { Link } from '@tanstack/react-router'
import type { Post } from '../../drizzle/schema'
import { formatDate } from '~/lib/format'

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="border-b border-neutral-200 py-6 dark:border-neutral-800">
      <Link
        to="/posts/$slug"
        params={{ slug: post.slug }}
        className="group block"
      >
        <h2 className="text-xl font-semibold tracking-tight group-hover:underline">
          {post.title}
        </h2>
        {post.excerpt ? (
          <p className="mt-2 line-clamp-2 text-neutral-600 dark:text-neutral-400">
            {post.excerpt}
          </p>
        ) : null}
        <div className="mt-3 flex items-center gap-3 text-sm text-neutral-500">
          <time dateTime={new Date(post.createdAt).toISOString()}>
            {formatDate(post.createdAt)}
          </time>
        </div>
      </Link>
      {post.tags.length > 0 ? (
        <div className="mt-2 flex gap-2 text-sm">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              to="/tags/$tag"
              params={{ tag }}
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              #{tag}
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  )
}
