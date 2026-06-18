import { createFileRoute } from '@tanstack/react-router'
import { listPostsByTag } from '~/server/posts.fn'
import { PostList } from '~/components/PostList'

export const Route = createFileRoute('/tags/$tag')({
  component: TagPage,
  loader: ({ params }) => listPostsByTag({ data: { tag: params.tag } }),
})

function TagPage() {
  const posts = Route.useLoaderData()
  const { tag } = Route.useParams()
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold tracking-tight">
        <span className="text-neutral-400">#</span>
        {tag}
      </h1>
      <PostList posts={posts} />
    </div>
  )
}
