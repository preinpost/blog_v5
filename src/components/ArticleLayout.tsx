import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { formatDate } from '~/lib/format'

export function ArticleLayout({
  title,
  createdAt,
  tags,
  children,
}: {
  title: string
  createdAt: Date | number | string
  tags: string[]
  children: ReactNode
}) {
  return (
    <article>
      <header className="mb-8 border-b border-neutral-200 pb-6 dark:border-neutral-800">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <div className="mt-3 flex items-center gap-3 text-sm text-neutral-500">
          <time dateTime={new Date(createdAt).toISOString()}>
            {formatDate(createdAt)}
          </time>
          {tags.length > 0 ? (
            <span className="flex gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag}
                  to="/tags/$tag"
                  params={{ tag }}
                  className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                >
                  #{tag}
                </Link>
              ))}
            </span>
          ) : null}
        </div>
      </header>
      {children}
    </article>
  )
}
