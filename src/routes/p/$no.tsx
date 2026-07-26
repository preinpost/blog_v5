import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { getSlugByPostNo } from '~/server/posts.fn'

/**
 * Short, shareable post URL: /p/:no → 301 redirect to the canonical
 * /posts/:slug. Keeps shared links compact (no percent-encoded Korean) while
 * the slug URL stays the single canonical address for SEO.
 */
export const Route = createFileRoute('/p/$no')({
  loader: async ({ params }) => {
    const no = Number(params.no)
    if (!Number.isInteger(no) || no <= 0) throw notFound()
    const result = await getSlugByPostNo({ data: { no } })
    if (!result) throw notFound()
    throw redirect({
      to: '/posts/$slug',
      params: { slug: result.slug },
      statusCode: 301,
    })
  },
})
