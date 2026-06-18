import { createFileRoute, Outlet, redirect, Link } from '@tanstack/react-router'
import { requireAdmin } from '~/server/admin.fn'

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
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4 dark:border-neutral-800">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="font-semibold" activeOptions={{ exact: true }}>
            관리
          </Link>
          <Link
            to="/admin/new"
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
          >
            + 새 글
          </Link>
        </div>
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <span>{user.email}</span>
          <Link to="/" className="hover:text-neutral-900 dark:hover:text-neutral-100">
            ← 블로그
          </Link>
        </div>
      </div>
      <Outlet />
    </div>
  )
}
