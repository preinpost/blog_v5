import { createFileRoute, notFound } from '@tanstack/react-router'
import { getRenderedPost } from '~/server/posts.fn'
import { ArticleLayout } from '~/components/ArticleLayout'
import { Prose } from '~/components/Prose'

export const Route = createFileRoute('/posts/$slug')({
  component: PostPage,
  loader: async ({ params }) => {
    const result = await getRenderedPost({ data: { slug: params.slug } })
    if (!result) throw notFound()
    return result
  },
  notFoundComponent: () => (
    <p className="py-12 text-center text-neutral-500">글을 찾을 수 없습니다.</p>
  ),
})

function PostPage() {
  const { post, html } = Route.useLoaderData()
  return (
    <ArticleLayout
      title={post.title}
      createdAt={post.createdAt}
      tags={post.tags}
      status={post.status}
    >
      <Prose html={html} />
    </ArticleLayout>
  )
}
