import { defineConfig } from 'vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    // Vite 8 resolves tsconfig `paths` (e.g. ~/*) natively
    tsconfigPaths: true,
  },
  plugins: [
    // cloudflare plugin first so the SSR environment targets workerd
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    // tailwind right after cloudflare (avoids the "Cannot create proxy" combo issue)
    tailwindcss(),
    tanstackStart(),
    // react's vite plugin must come after start's vite plugin
    viteReact(),
  ],
})
