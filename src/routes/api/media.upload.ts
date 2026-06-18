import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { verifyAccessFromRequest } from '~/server/middleware/access.server'

const MAX_BYTES = 10 * 1024 * 1024 // 10MB

export const Route = createFileRoute('/api/media/upload')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await verifyAccessFromRequest(request) // admin only

        const form = await request.formData()
        const file = form.get('file')
        if (!(file instanceof File)) {
          return new Response('No file', { status: 400 })
        }
        if (!file.type.startsWith('image/')) {
          return new Response('Only images allowed', { status: 415 })
        }
        if (file.size > MAX_BYTES) {
          return new Response('File too large', { status: 413 })
        }

        const ext = (file.name.split('.').pop() || 'bin')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
        const key = `${crypto.randomUUID()}.${ext}`
        await env.MEDIA.put(key, await file.arrayBuffer(), {
          httpMetadata: { contentType: file.type },
        })

        const base = env.R2_PUBLIC_BASE
        const url = base ? `${base}/${key}` : `/api/media/${key}`
        return Response.json({ url })
      },
    },
  },
})
