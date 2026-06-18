import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { listAllPosts, deletePost } from '~/server/admin.fn'
import { formatDate } from '~/lib/format'

export const Route = createFileRoute('/admin/')({
  component: Dashboard,
  loader: () => listAllPosts(),
})

function Dashboard() {
  const posts = Route.useLoaderData()
  const router = useRouter()

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
                <div className="mt-1 text-xs text-neutral-500">
                  {formatDate(post.createdAt)} · /{post.slug}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-sm">
                {post.status === 'published' ? (
                  <Link
                    to="/posts/$slug"
                    params={{ slug: post.slug }}
                    className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    보기
                  </Link>
                ) : null}
                <Link
                  to="/admin/$id/edit"
                  params={{ id: post.id }}
                  className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  편집
                </Link>
                <button
                  type="button"
                  onClick={() => onDelete(post.id, post.title)}
                  className="text-red-600 hover:text-red-700"
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
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
