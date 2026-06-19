import { Link } from '@tanstack/react-router'

const linkClass =
  'rounded-md border border-neutral-300 px-3 py-1.5 hover:border-neutral-500 dark:border-neutral-700'
const disabledClass =
  'pointer-events-none rounded-md border border-neutral-200 px-3 py-1.5 text-neutral-300 dark:border-neutral-800 dark:text-neutral-700'

/**
 * Prev / next pager for list routes. Updates only the `page` search param on the
 * current route (preserving any other params), so it works on `/`, `/tags/$tag`
 * and `/admin` alike. Renders nothing when there is only one page.
 */
export function Pagination({
  page,
  totalPages,
}: {
  page: number
  totalPages: number
}) {
  if (totalPages <= 1) return null
  const hasPrev = page > 1
  const hasNext = page < totalPages
  return (
    <nav className="mt-8 flex items-center justify-center gap-4 text-sm">
      {hasPrev ? (
        <Link
          to="."
          search={(prev) => ({ ...prev, page: page - 1 })}
          className={linkClass}
        >
          이전
        </Link>
      ) : (
        <span className={disabledClass}>이전</span>
      )}
      <span className="text-neutral-500">
        {page} / {totalPages}
      </span>
      {hasNext ? (
        <Link
          to="."
          search={(prev) => ({ ...prev, page: page + 1 })}
          className={linkClass}
        >
          다음
        </Link>
      ) : (
        <span className={disabledClass}>다음</span>
      )}
    </nav>
  )
}
