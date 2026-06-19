import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { listPostsByTag } from '~/server/posts.fn'
import { PostList } from '~/components/PostList'
import { Pagination } from '~/components/Pagination'

export const Route = createFileRoute('/tags/$tag')({
  validateSearch: z.object({ page: z.number().int().min(1).catch(1).optional() }),
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: ({ params, deps }) =>
    listPostsByTag({ data: { tag: params.tag, page: deps.page } }),
  component: TagPage,
})

function TagPage() {
  const { items, total, page, pageSize } = Route.useLoaderData()
  const { tag } = Route.useParams()
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold tracking-tight">
        <span className="text-neutral-400">#</span>
        {tag}
      </h1>
      <PostList posts={items} />
      <Pagination page={page} totalPages={totalPages} />
    </div>
  )
}
