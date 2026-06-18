import { useEffect, useRef } from 'react'

/**
 * Renders server-rendered post HTML and, after hydration, enhances each Shiki
 * code block with a header bar: language label (left) + copy button (right).
 */
export function Prose({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    root.querySelectorAll<HTMLPreElement>('pre.shiki').forEach((pre) => {
      if (pre.closest('.code-block')) return // already enhanced

      const lang = pre.dataset.language || 'text'

      const wrapper = document.createElement('div')
      wrapper.className = 'code-block'

      const header = document.createElement('div')
      header.className = 'code-header'

      const label = document.createElement('span')
      label.className = 'code-lang'
      label.textContent = lang

      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'code-copy'
      btn.textContent = '복사'
      btn.addEventListener('click', () => {
        const code = pre.querySelector('code')?.textContent ?? ''
        void navigator.clipboard?.writeText(code).then(() => {
          btn.textContent = '복사됨'
          window.setTimeout(() => {
            btn.textContent = '복사'
          }, 1500)
        })
      })

      header.appendChild(label)
      header.appendChild(btn)
      pre.replaceWith(wrapper)
      wrapper.appendChild(header)
      wrapper.appendChild(pre)
    })
  }, [html])

  return (
    <div
      ref={ref}
      className="prose prose-neutral max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
