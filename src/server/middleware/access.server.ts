import { getRequestHeader } from '@tanstack/react-start/server'
import { env } from 'cloudflare:workers'
import { createRemoteJWKSet, jwtVerify } from 'jose'

export type AdminUser = { email: string }

// Module-scope JWKS cache (per isolate). Does not touch `env` until first call.
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null
function getJwks(teamDomain: string) {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${teamDomain}/cdn-cgi/access/certs`))
  }
  return jwks
}

/**
 * Core check: validate a Cloudflare Access JWT and return the admin user.
 *
 * The real security boundary is the edge Access policy (which blocks
 * unauthenticated users before they reach the Worker); this re-validates the
 * signed JWT it injects so server code can trust the identity.
 *
 * DEV BYPASS: `vite dev` has no Access in front of it, so we short-circuit.
 * Gated strictly on `import.meta.env.DEV` so it can never be true in the
 * production Worker bundle.
 */
async function verifyToken(token: string | null): Promise<AdminUser> {
  if (import.meta.env.DEV) {
    return { email: 'dev@localhost' }
  }
  if (!token) throw new Response('Unauthorized', { status: 401 })

  const teamDomain = env.TEAM_DOMAIN
  const aud = env.ACCESS_AUD
  if (!teamDomain || !aud) {
    throw new Response('Access not configured', { status: 500 })
  }

  try {
    const { payload } = await jwtVerify(token, getJwks(teamDomain), {
      issuer: teamDomain,
      audience: aud,
    })
    return { email: String(payload.email ?? '') }
  } catch {
    throw new Response('Forbidden', { status: 403 })
  }
}

// Cloudflare Access injects the `Cf-Access-Jwt-Assertion` header only on paths
// covered by the Access app (e.g. /admin*). Server-function RPC calls hit
// /_serverFn/* which is NOT covered, so we also read the domain-wide
// `CF_Authorization` cookie that Access sets after login.
function tokenFromCookie(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null
  const m = cookieHeader.match(/(?:^|;\s*)CF_Authorization=([^;]+)/)
  return m ? decodeURIComponent(m[1]) : null
}

/**
 * For server functions. Call only inside `.handler()` bodies so the bundler
 * strips it (and its server-only imports) from the client.
 */
export function verifyAccess(): Promise<AdminUser> {
  if (import.meta.env.DEV) return verifyToken(null)
  const token =
    getRequestHeader('cf-access-jwt-assertion') ??
    tokenFromCookie(getRequestHeader('cookie'))
  return verifyToken(token)
}

/** For server routes, whose handler receives the raw `request`. */
export function verifyAccessFromRequest(request: Request): Promise<AdminUser> {
  const token =
    request.headers.get('cf-access-jwt-assertion') ??
    tokenFromCookie(request.headers.get('cookie'))
  return verifyToken(token)
}

/** Soft check: true if the current request is an authenticated admin (never throws). */
export async function isAdmin(): Promise<boolean> {
  try {
    await verifyAccess()
    return true
  } catch {
    return false
  }
}
