import { useEffect, useRef } from 'react'

/**
 * Renders server-rendered post HTML. The code-block header (language label +
 * copy button) is already in the HTML (rendered server-side), so it shows
 * instantly. Here we only wire the copy button via event delegation.
 */
export function Prose({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest('.code-copy')
      if (!btn) return
      const code =
        btn.closest('.code-block')?.querySelector('pre code')?.textContent ?? ''
      void navigator.clipboard?.writeText(code).then(() => {
        btn.textContent = '복사됨'
        window.setTimeout(() => {
          btn.textContent = '복사'
        }, 1500)
      })
    }

    root.addEventListener('click', onClick)
    return () => root.removeEventListener('click', onClick)
  }, [])

  return (
    <div
      ref={ref}
      className="prose prose-neutral max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
