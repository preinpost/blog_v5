import { createFileRoute } from '@tanstack/react-router'
import { listPosts } from '~/server/posts.fn'
import { PostList } from '~/components/PostList'

export const Route = createFileRoute('/')({
  component: Home,
  loader: () => listPosts(),
})

function Home() {
  const posts = Route.useLoaderData()
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">글</h1>
      <PostList posts={posts} />
    </div>
  )
}
