import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { listPosts } from '~/server/posts.fn'
import { PostList } from '~/components/PostList'
import { Pagination } from '~/components/Pagination'
import { AiFilterToggle } from '~/components/AiFilterToggle'

export const Route = createFileRoute('/')({
  validateSearch: z.object({
    page: z.number().int().min(1).catch(1).optional(),
    ai: z.literal('hide').optional().catch(undefined),
  }),
  loaderDeps: ({ search }) => ({
    page: search.page ?? 1,
    hideAi: search.ai === 'hide',
  }),
  loader: ({ deps }) =>
    listPosts({ data: { page: deps.page, hideAi: deps.hideAi } }),
  component: Home,
})

function Home() {
  const { items, total, page, pageSize } = Route.useLoaderData()
  const { ai } = Route.useSearch()
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">글</h1>
        <AiFilterToggle hidden={ai === 'hide'} />
      </div>
      <PostList posts={items} />
      <Pagination page={page} totalPages={totalPages} />
    </div>
  )
}
