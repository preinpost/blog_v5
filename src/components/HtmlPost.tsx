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
      const body = doc?.body
      if (!doc || !body) return
      // Measure the *content*, not the scroll viewport, and round up so a
      // sub-pixel remainder can't trigger the iframe's own scrollbar.
      const h = Math.max(
        body.scrollHeight,
        body.getBoundingClientRect().height,
        doc.documentElement.scrollHeight,
      )
      iframe.style.height = `${Math.ceil(h) + 1}px`
    }

    fit()

    const doc = iframe.contentDocument
    let ro: ResizeObserver | undefined
    // NOTE: observe <body> — inside an iframe <html> is the viewport box and
    // never changes size, so observing it would never fire.
    if (doc?.body && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(fit)
      ro.observe(doc.body)
    }
    // Webfonts / late images reflow the document after load.
    doc?.fonts?.ready.then(fit).catch(() => {})
    const t = setTimeout(fit, 300)
    window.addEventListener('resize', fit)
    return () => {
      ro?.disconnect()
      clearTimeout(t)
      window.removeEventListener('resize', fit)
    }
  }, [html])

  function onLoad() {
    const iframe = ref.current
    const doc = iframe?.contentDocument
    const body = doc?.body
    if (!iframe || !doc || !body) return
    const apply = () => {
      iframe.style.height = `${Math.ceil(Math.max(body.scrollHeight, doc.documentElement.scrollHeight)) + 1}px`
    }
    apply()
    doc.fonts?.ready.then(apply).catch(() => {})
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
        scrolling="no"
        className="block w-full border-0"
        style={{ minHeight: '60vh', overflow: 'hidden' }}
      />
    </div>
  )
}
