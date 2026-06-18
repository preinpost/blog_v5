import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '../../drizzle/schema'

/**
 * Build a Drizzle client bound to the request-scoped D1 binding.
 * IMPORTANT: only call this inside a server function / server route handler —
 * `env` from `cloudflare:workers` must be dereferenced at request time, never
 * at module top level.
 */
export function getDb() {
  return drizzle(env.DB, { schema })
}
