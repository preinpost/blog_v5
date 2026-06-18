import { defineConfig } from 'drizzle-kit'

// Migrations are authored here (drizzle-kit generate) and applied to D1 via
// `wrangler d1 migrations apply` (see package.json db:migrate:* scripts).
export default defineConfig({
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
})
