import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { formatDate } from '~/lib/format'

export function ArticleLayout({
  title,
  createdAt,
  tags,
  status,
  children,
}: {
  title: string
  createdAt: Date | number | string
  tags: string[]
  status?: 'draft' | 'published'
  children: ReactNode
}) {
  return (
    <article>
      {status === 'draft' ? (
        <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          초안 — 관리자에게만 보입니다 (아직 발행되지 않음)
        </p>
      ) : null}
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
