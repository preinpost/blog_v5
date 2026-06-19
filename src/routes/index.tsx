import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { listPosts } from '~/server/posts.fn'
import { PostList } from '~/components/PostList'
import { Pagination } from '~/components/Pagination'

export const Route = createFileRoute('/')({
  validateSearch: z.object({ page: z.number().int().min(1).catch(1).optional() }),
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: ({ deps }) => listPosts({ data: { page: deps.page } }),
  component: Home,
})

function Home() {
  const { items, total, page, pageSize } = Route.useLoaderData()
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">글</h1>
      <PostList posts={items} />
      <Pagination page={page} totalPages={totalPages} />
    </div>
  )
}
