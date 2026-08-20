import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { z } from 'zod'
import { listAllPosts, deletePost } from '~/server/admin.fn'
import { formatDate } from '~/lib/format'
import { Pagination } from '~/components/Pagination'
import { shortPostUrl } from '~/lib/site'

export const Route = createFileRoute('/admin/')({
  validateSearch: z.object({ page: z.number().int().min(1).catch(1).optional() }),
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: ({ deps }) => listAllPosts({ data: { page: deps.page } }),
  component: Dashboard,
})

function Dashboard() {
  const { items: posts, total, page, pageSize } = Route.useLoaderData()
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const router = useRouter()

  async function onCopyShortLink(postNo: number | null) {
    if (postNo == null) return
    const url = shortPostUrl(postNo)
    try {
      await navigator.clipboard.writeText(url)
      window.alert(`짧은 링크를 복사했어요:\n${url}`)
    } catch {
      window.prompt('짧은 링크', url)
    }
  }

  async function onDelete(id: string, title: string) {
    if (!window.confirm(`"${title}" 글을 삭제할까요?`)) return
    await deletePost({ data: { id } })
    await router.invalidate()
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold tracking-tight">글 관리</h1>
      {posts.length === 0 ? (
        <p className="py-12 text-center text-neutral-500">글이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <StatusBadge status={post.status} />
                  <Link
                    to="/admin/$id/edit"
                    params={{ id: post.id }}
                    className="truncate font-medium hover:underline"
                  >
                    {post.title}
                  </Link>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                  {post.postNo != null && (
                    <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                      #{post.postNo}
                    </span>
                  )}
                  <span className="truncate">
                    {formatDate(post.createdAt)} · /{post.slug}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1 text-sm">
                <Link
                  to="/posts/$slug"
                  params={{ slug: post.slug }}
                  className="inline-flex min-h-9 cursor-pointer items-center rounded-lg px-2.5 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                >
                  {post.status === 'published' ? '보기' : '미리보기'}
                </Link>
                {post.postNo != null && (
                  <button
                    type="button"
                    onClick={() => onCopyShortLink(post.postNo)}
                    className="inline-flex min-h-9 cursor-pointer items-center rounded-lg px-2.5 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                    title={shortPostUrl(post.postNo)}
                  >
                    링크
                  </button>
                )}
                <Link
                  to="/admin/$id/edit"
                  params={{ id: post.id }}
                  className="inline-flex min-h-9 cursor-pointer items-center rounded-lg px-2.5 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                >
                  편집
                </Link>
                <button
                  type="button"
                  onClick={() => onDelete(post.id, post.title)}
                  className="inline-flex min-h-9 cursor-pointer items-center rounded-lg px-2.5 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} totalPages={totalPages} />
    </div>
  )
}

function StatusBadge({ status }: { status: 'draft' | 'published' }) {
  return status === 'published' ? (
    <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">
      발행
    </span>
  ) : (
    <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
      초안
    </span>
  )
}
