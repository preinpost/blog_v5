import { lazy, Suspense, useRef, useState } from 'react'
import { ClientOnly, useRouter } from '@tanstack/react-router'
import type { Crepe } from '@milkdown/crepe'
import type { Post } from '../../../drizzle/schema'
import { createPost, updatePost } from '~/server/admin.fn'

const CrepeEditor = lazy(() => import('./CrepeEditor'))

function EditorSkeleton() {
  return (
    <div className="h-80 animate-pulse rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900" />
  )
}

const fieldClass =
  'w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700'

/** Crepe ImageBlock upload hook → POST to the R2 upload route → return public URL. */
async function uploadImage(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch('/api/media/upload', { method: 'POST', body: fd })
  if (!res.ok) throw new Error(`업로드 실패 (${res.status})`)
  const { url } = (await res.json()) as { url: string }
  return url
}

export function PostForm({ post }: { post?: Post }) {
  const router = useRouter()
  const crepeRef = useRef<Crepe | null>(null)

  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [tagsInput, setTagsInput] = useState((post?.tags ?? []).join(', '))
  const [status, setStatus] = useState<'draft' | 'published'>(
    post?.status ?? 'draft',
  )
  const [date, setDate] = useState(
    (post ? new Date(post.createdAt) : new Date()).toISOString().slice(0, 10),
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    if (!title.trim()) {
      setError('제목을 입력하세요')
      return
    }
    setSaving(true)
    setError(null)
    const content = crepeRef.current?.getMarkdown() ?? ''
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      content,
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {post ? '글 편집' : '새 글'}
        </h1>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
            className="rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 text-sm dark:border-neutral-700"
          >
            <option value="draft">초안</option>
            <option value="published">발행</option>
          </select>
          <button
            type="button"
            onClick={() => router.navigate({ to: '/admin' })}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700"
          >
            취소
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-md bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
          >
            {saving ? '저장 중…' : '저장'}
          </button>
        </div>
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      ) : null}

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목"
        className={`${fieldClass} text-lg font-semibold`}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="슬러그 (비우면 제목에서 자동 생성)"
          className={fieldClass}
        />
        <input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="태그 (쉼표로 구분)"
          className={fieldClass}
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-neutral-600">
        <span className="shrink-0">작성일</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </label>
      <textarea
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        placeholder="요약 (목록에 표시)"
        rows={2}
        className={fieldClass}
      />

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800">
        <ClientOnly fallback={<EditorSkeleton />}>
          <Suspense fallback={<EditorSkeleton />}>
            <CrepeEditor
              initialMarkdown={post?.content ?? ''}
              crepeRef={crepeRef}
              onUpload={uploadImage}
            />
          </Suspense>
        </ClientOnly>
      </div>
    </div>
  )
}
