import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'
import appCss from '~/styles/app.css?url'
import { Nav } from '~/components/Nav'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'blog v5' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <HeadContent />
      </head>
      <body>
        <Nav />
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
        <Scripts />
      </body>
    </html>
  )
}
