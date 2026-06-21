import { useEffect, useRef } from 'react'

/**
 * Renders an uploaded, self-contained HTML document "as-is" inside an isolated
 * iframe so its own <head>/<style>/layout apply without leaking into the site.
 *
 * `sandbox="allow-same-origin"` (no allow-scripts) keeps it same-origin — so the
 * parent can read contentDocument to auto-size the frame — while neutralizing any
 * <script> in the uploaded document.
 */
export function HtmlPost({ html, draft }: { html: string; draft?: boolean }) {
  const ref = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const iframe = ref.current
    if (!iframe) return

    const fit = () => {
      const doc = iframe.contentDocument
      if (doc) iframe.style.height = `${doc.documentElement.scrollHeight}px`
    }

    fit()

    const doc = iframe.contentDocument
    let ro: ResizeObserver | undefined
    if (doc?.documentElement && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(fit)
      ro.observe(doc.documentElement)
    }
    window.addEventListener('resize', fit)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', fit)
    }
  }, [html])

  function onLoad() {
    const iframe = ref.current
    const doc = iframe?.contentDocument
    if (iframe && doc) iframe.style.height = `${doc.documentElement.scrollHeight}px`
  }

  return (
    <div>
      {draft ? (
        <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          초안 — 관리자에게만 보입니다 (아직 발행되지 않음)
        </p>
      ) : null}
      <iframe
        ref={ref}
        srcDoc={html}
        sandbox="allow-same-origin"
        title="post"
        onLoad={onLoad}
        className="block w-full border-0"
        style={{ minHeight: '60vh' }}
      />
    </div>
  )
}
