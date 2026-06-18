import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import type { ReactNode } from 'react'

/**
 * Thin Tailwind-styled wrapper around Base UI's headless Dialog.
 * Styling is driven by Base UI's `data-*` state attributes (data-open / data-closed).
 */
export function Dialog({
  trigger,
  title,
  children,
}: {
  trigger: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <BaseDialog.Root>
      <BaseDialog.Trigger
        render={
          <button
            type="button"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          />
        }
      >
        {trigger}
      </BaseDialog.Trigger>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 bg-black/40 transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <BaseDialog.Popup className="fixed top-1/2 left-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-neutral-200 bg-white p-6 shadow-xl transition-all data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 dark:border-neutral-800 dark:bg-neutral-900">
          <BaseDialog.Title className="text-lg font-semibold">{title}</BaseDialog.Title>
          <div className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">{children}</div>
          <div className="mt-5 flex justify-end">
            <BaseDialog.Close
              render={
                <button
                  type="button"
                  className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
                />
              }
            >
              닫기
            </BaseDialog.Close>
          </div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}
