import { createFileRoute, Outlet, redirect, Link } from '@tanstack/react-router'
import { requireAdmin } from '~/server/admin.fn'
import { Button } from '~/components/ui/Button'

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    // In prod, Cloudflare Access has already blocked unauthenticated users at
    // the edge; this re-validates the signed identity. In dev it returns the
    // bypass user. A thrown error means a misconfigured/invalid token.
    try {
      const user = await requireAdmin()
      return { user }
    } catch {
      throw redirect({ to: '/' })
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  const { user } = Route.useRouteContext()
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-4 dark:border-neutral-800">
        <div className="flex items-center gap-4">
          <Link
            to="/admin"
            className="font-semibold"
            activeOptions={{ exact: true }}
          >
            관리
          </Link>
          <Link to="/admin/new">
            <Button variant="primary" size="sm">
              <span aria-hidden="true" className="text-base leading-none">+</span>
              새 글
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
          <span>{user.email}</span>
          <Link
            to="/"
            className="hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            ← 블로그
          </Link>
        </div>
      </div>
      <Outlet />
    </div>
  )
}
