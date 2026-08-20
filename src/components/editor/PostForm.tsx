import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ClientOnly, useRouter } from '@tanstack/react-router'
import type { Crepe } from '@milkdown/crepe'
import type { Post } from '../../../drizzle/schema'
import { createPost, updatePost } from '~/server/admin.fn'
import { Button } from '~/components/ui/Button'
import { Field, Input, Textarea, Checkbox } from '~/components/ui/controls'

const CrepeEditor = lazy(() => import('./CrepeEditor'))

function EditorSkeleton() {
  return (
    <div className="h-80 animate-pulse rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900" />
  )
}

/** Format a Date as `YYYY-MM-DD` in local time (avoids UTC shifting the day). */
function toLocalDateInput(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Crepe ImageBlock upload hook → POST to the R2 upload route → return public URL. */
async function uploadImage(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch('/api/media/upload', { method: 'POST', body: fd })
  if (!res.ok) throw new Error(`업로드 실패 (${res.status})`)
  const { url } = (await res.json()) as { url: string }
  return url
}

const iconBase = 'size-4 shrink-0'

function AlertIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={iconBase}>
      <path d="M10 1.5A8.5 8.5 0 1 0 10 18.5 8.5 8.5 0 0 0 10 1.5Zm-.75 5.5a.75.75 0 1 1 1.5 0v4a.75.75 0 1 1-1.5 0v-4Zm.75 8.25a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75Z" />
    </svg>
  )
}

/** Two-option segmented control (e.g. 초안/발행, 마크다운/HTML). */
function Segmented({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  label: string
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex shrink-0 gap-1 rounded-lg border border-neutral-300 bg-neutral-100/60 p-1 dark:border-neutral-700 dark:bg-neutral-900"
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`min-h-9 cursor-pointer rounded-md px-3.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-100 dark:text-neutral-900'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function PostForm({ post }: { post?: Post }) {
  const router = useRouter()
  const crepeRef = useRef<Crepe | null>(null)
  const errorRef = useRef<HTMLDivElement>(null)

  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [tagsInput, setTagsInput] = useState((post?.tags ?? []).join(', '))
  const [status, setStatus] = useState<'draft' | 'published'>(
    post?.status ?? 'draft',
  )
  const [date, setDate] = useState(
    toLocalDateInput(post ? new Date(post.createdAt) : new Date()),
  )
  const [contentType, setContentType] = useState<'markdown' | 'html'>(
    post?.contentType ?? 'markdown',
  )
  const [htmlContent, setHtmlContent] = useState(
    post?.contentType === 'html' ? post.content : '',
  )
  const [aiGenerated, setAiGenerated] = useState(post?.aiGenerated ?? false)
  const [htmlFileName, setHtmlFileName] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const markDirty = () => setDirty(true)

  // Move focus to the error summary on a failed save (keyboard/SR discoverable).
  useEffect(() => {
    if (error) errorRef.current?.focus()
  }, [error])

  // Warn before closing the tab if there are unsaved changes.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  async function save() {
    if (!title.trim()) {
      setError('제목을 입력하세요')
      return
    }
    const content =
      contentType === 'html'
        ? htmlContent
        : (crepeRef.current?.getMarkdown() ?? '')
    if (contentType === 'html' && !content.trim()) {
      setError('HTML 파일을 첨부하세요')
      return
    }
    setSaving(true)
    setError(null)
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      content,
      contentType,
      aiGenerated,
      excerpt: excerpt.trim() || undefined,
      tags,
      status,
      date,
    }
    try {
      if (post) {
        await updatePost({ data: { id: post.id, ...payload } })
      } else {
        await createPost({ data: payload })
      }
      await router.navigate({ to: '/admin' })
    } catch (e) {
      setError(`저장 실패: ${e instanceof Error ? e.message : String(e)}`)
      setSaving(false)
    }
  }

  function goToList() {
    if (
      dirty &&
      !window.confirm(
        '저장하지 않은 변경사항이 있어요. 목록으로 나가면 내용이 사라집니다. 그래도 나갈까요?',
      )
    ) {
      return
    }
    void router.navigate({ to: '/admin' })
  }

  const isNew = !post

  return (
    <div>
      {/* ── Sticky save/publish bar ─────────────────────────────── */}
      <div className="sticky top-0 z-20 -mx-4 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <button
            type="button"
            onClick={goToList}
            className="inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-lg px-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              className="size-4"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                clipRule="evenodd"
              />
            </svg>
            목록
          </button>
          <h1 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
            {isNew ? '새 글' : '글 편집'}
          </h1>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {/* Save status */}
            {saving ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                <span
                  className="size-3.5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600"
                  aria-hidden="true"
                />
                저장 중…
              </span>
            ) : dirty ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-amber-700 dark:text-amber-500">
                <span
                  className="size-2 rounded-full bg-amber-500"
                  aria-hidden="true"
                />
                저장하지 않은 변경사항
              </span>
            ) : null}

            <Segmented
              label="발행 상태"
              options={[
                { value: 'draft', label: '초안' },
                { value: 'published', label: '발행' },
              ]}
              value={status}
              onChange={(v) => {
                setStatus(v as 'draft' | 'published')
                markDirty()
              }}
            />

            <Button
              variant="primary"
              onClick={() => void save()}
              disabled={saving || !dirty}
            >
              {saving ? '저장 중…' : '저장'}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Error summary (announced + focusable) ─────────────────── */}
      {error ? (
        <div
          ref={errorRef}
          role="alert"
          tabIndex={-1}
          className="mt-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700 outline-none dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
        >
          <span className="mt-0.5 text-red-600 dark:text-red-400">
            <AlertIcon />
          </span>
          <span>{error}</span>
        </div>
      ) : null}

      {/* ── Focused writing surface ───────────────────────────────── */}
      <div className="mt-6">
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            markDirty()
          }}
          placeholder="제목을 입력하세요"
          aria-label="제목"
          className="block w-full bg-transparent text-3xl font-bold tracking-tight text-neutral-900 outline-none placeholder:font-semibold placeholder:text-neutral-300 dark:text-neutral-100 dark:placeholder:text-neutral-600"
        />
        <div className="mt-2 border-b border-neutral-200 pb-4 dark:border-neutral-800" />
      </div>

      <div className="mt-4">
        <Segmented
          label="콘텐츠 형식"
          options={[
            { value: 'markdown', label: '마크다운' },
            { value: 'html', label: 'HTML 첨부' },
          ]}
          value={contentType}
          onChange={(v) => {
            setContentType(v as 'markdown' | 'html')
            markDirty()
          }}
        />
      </div>

      {/* Crepe stays mounted (preserves state/ref); just hidden in HTML mode. */}
      <div
        className={`mt-4 overflow-hidden rounded-xl border border-neutral-200 shadow-sm dark:border-neutral-800 ${
          contentType === 'html' ? 'hidden' : ''
        }`}
      >
        <ClientOnly fallback={<EditorSkeleton />}>
          <Suspense fallback={<EditorSkeleton />}>
            <CrepeEditor
              initialMarkdown={
                post?.contentType === 'html' ? '' : (post?.content ?? '')
              }
              crepeRef={crepeRef}
              onUpload={uploadImage}
              onChange={markDirty}
            />
          </Suspense>
        </ClientOnly>
      </div>

      {contentType === 'html' ? (
        <div className="mt-4 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
          <label
            htmlFor="html-file"
            className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50/60 px-6 py-8 text-center transition-colors hover:border-neutral-400 hover:bg-neutral-100/60 dark:border-neutral-700 dark:bg-neutral-900/40 dark:hover:border-neutral-600"
          >
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              HTML 파일 선택
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              스타일까지 그대로 발행됩니다 (.html)
            </span>
          </label>
          <input
            id="html-file"
            type="file"
            accept=".html,text/html"
            className="sr-only"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              setHtmlFileName(file.name)
              setHtmlContent(await file.text())
              markDirty()
            }}
          />
          <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
            {htmlContent
              ? `현재 HTML: ${htmlFileName ? `${htmlFileName} · ` : ''}${htmlContent.length.toLocaleString()}자`
              : '선택한 파일의 내용이 여기에 반영돼요.'}
          </p>
        </div>
      ) : null}

      {/* ── Publication settings (progressive disclosure) ───────────── */}
      <details className="group mt-6 rounded-xl border border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/40">
        <summary className="flex cursor-pointer list-none items-center justify-between select-none px-4 py-3 text-sm font-medium text-neutral-700 marker:hidden dark:text-neutral-300">
          게시 설정
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className="size-4 text-neutral-400 transition-transform group-open:rotate-180"
          >
            <path
              fillRule="evenodd"
              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </summary>
        <div className="space-y-4 border-t border-neutral-200 p-4 dark:border-neutral-800">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="슬러그"
              htmlFor="field-slug"
              hint="비우면 제목에서 자동 생성돼요."
            >
              <Input
                id="field-slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value)
                  markDirty()
                }}
                placeholder="my-post-slug"
              />
            </Field>
            <Field
              label="태그"
              htmlFor="field-tags"
              hint="쉼표로 구분해 주세요."
            >
              <Input
                id="field-tags"
                value={tagsInput}
                onChange={(e) => {
                  setTagsInput(e.target.value)
                  markDirty()
                }}
                placeholder="react, dev, review"
              />
            </Field>
          </div>
          <Field
            label="요약"
            htmlFor="field-excerpt"
            hint="목록에 표시되는 한 줄 설명이에요."
          >
            <Textarea
              id="field-excerpt"
              value={excerpt}
              onChange={(e) => {
                setExcerpt(e.target.value)
                markDirty()
              }}
              placeholder="이 글을 한 문장으로 소개하면?"
              rows={2}
            />
          </Field>
          <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
            <Field label="작성일" htmlFor="field-date">
              <Input
                id="field-date"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value)
                  markDirty()
                }}
              />
            </Field>
            <Checkbox
              label="AI가 생성한 글"
              detail="목록에서 'AI 글 숨기기'로 숨길 수 있어요."
              checked={aiGenerated}
              onChange={(e) => {
                setAiGenerated(e.target.checked)
                markDirty()
              }}
            />
          </div>
        </div>
      </details>
    </div>
  )
}
