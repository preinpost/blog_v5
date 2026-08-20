import { Link } from '@tanstack/react-router'

export function Nav({ isAdmin }: { isAdmin: boolean }) {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link
          to="/"
          className="inline-flex min-h-9 items-center text-lg font-bold tracking-tight"
          activeOptions={{ exact: true }}
        >
          blog v5
        </Link>
        <div className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
          <Link
            to="/"
            className="inline-flex min-h-9 items-center rounded-lg px-2.5 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
            activeProps={{ className: 'text-neutral-900 dark:text-neutral-100 font-medium' }}
            activeOptions={{ exact: true }}
          >
            Home
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex min-h-9 items-center rounded-lg px-2.5 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
              activeProps={{ className: 'text-neutral-900 dark:text-neutral-100 font-medium' }}
            >
              관리
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
