import { createFileRoute, notFound } from '@tanstack/react-router'
import { getRenderedPost } from '~/server/posts.fn'
import { ArticleLayout } from '~/components/ArticleLayout'
import { Prose } from '~/components/Prose'
import { HtmlPost } from '~/components/HtmlPost'

export const Route = createFileRoute('/posts/$slug')({
  component: PostPage,
  loader: async ({ params }) => {
    const result = await getRenderedPost({ data: { slug: params.slug } })
    if (!result) throw notFound()
    return result
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData?.post.title ?? 'blog v5' }],
  }),
  notFoundComponent: () => (
    <p className="py-12 text-center text-neutral-500">글을 찾을 수 없습니다.</p>
  ),
})

function PostPage() {
  const { post, html } = Route.useLoaderData()
  // HTML posts render the uploaded document whole (no site article header).
  if (post.contentType === 'html') {
    return <HtmlPost html={html} draft={post.status === 'draft'} />
  }
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
