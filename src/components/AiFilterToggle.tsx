import { Link } from '@tanstack/react-router'

/**
 * "AI 글 숨기기" switch for list routes.
 *
 * The state lives in the URL (`?ai=hide`) rather than local/localStorage state so
 * it survives reloads, is shareable, and is applied during SSR. Toggling resets
 * `page` to 1 because the total result count changes.
 */
export function AiFilterToggle({ hidden }: { hidden: boolean }) {
  return (
    <Link
      to="."
      search={(prev: Record<string, unknown>) => ({
        ...prev,
        page: undefined,
        ai: hidden ? undefined : ('hide' as const),
      })}
      aria-pressed={hidden}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        hidden
          ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
          : 'border-neutral-300 text-neutral-500 hover:border-neutral-500 hover:text-neutral-800 dark:border-neutral-700 dark:hover:text-neutral-200'
      }`}
    >
      AI 글 숨기기
    </Link>
  )
}
