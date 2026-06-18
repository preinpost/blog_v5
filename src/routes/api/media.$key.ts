import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'

// Streams an uploaded object from R2. Used when R2_PUBLIC_BASE is not set
// (no public bucket / custom domain). Public read is fine — these are blog images.
export const Route = createFileRoute('/api/media/$key')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const obj = await env.MEDIA.get(params.key)
        if (!obj) return new Response('Not found', { status: 404 })
        const headers = new Headers()
        headers.set(
          'Content-Type',
          obj.httpMetadata?.contentType ?? 'application/octet-stream',
        )
        headers.set('Cache-Control', 'public, max-age=31536000, immutable')
        headers.set('ETag', obj.httpEtag)
        return new Response(obj.body, { headers })
      },
    },
  },
})
