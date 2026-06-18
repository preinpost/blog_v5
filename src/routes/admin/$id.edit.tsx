import { createFileRoute, notFound } from '@tanstack/react-router'
import { getPostById } from '~/server/admin.fn'
import { PostForm } from '~/components/editor/PostForm'

export const Route = createFileRoute('/admin/$id/edit')({
  loader: async ({ params }) => {
    const post = await getPostById({ data: { id: params.id } })
    if (!post) throw notFound()
    return post
  },
  component: EditPost,
})

function EditPost() {
  const post = Route.useLoaderData()
  return <PostForm post={post} />
}
