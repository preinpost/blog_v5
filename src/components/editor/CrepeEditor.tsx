import { Crepe } from '@milkdown/crepe'
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react'
import '@milkdown/crepe/theme/common/style.css'
import '@milkdown/crepe/theme/frame.css'

type Props = {
  initialMarkdown: string
  /** Parent-owned ref; receives the Crepe instance so it can call getMarkdown(). */
  crepeRef: { current: Crepe | null }
  /** Image upload handler (wired to R2 in step 7). */
  onUpload?: (file: File) => Promise<string>
  /** Fired whenever the document content actually changes (for dirty tracking). */
  onChange?: () => void
}

function CrepeInner({ initialMarkdown, crepeRef, onUpload, onChange }: Props) {
  useEditor((root) => {
    const crepe = new Crepe({
      root,
      defaultValue: initialMarkdown,
      featureConfigs: {
        [Crepe.Feature.Placeholder]: {
          text: '내용을 입력하세요. # 제목, **굵게**, - 목록 등 마크다운이 바로 반영돼요.',
        },
        ...(onUpload
          ? { [Crepe.Feature.ImageBlock]: { onUpload } }
          : {}),
      },
    })
    // `listener.markdownUpdated` fires on real content edits, not on focus.
    crepe.on((listener) => {
      listener.markdownUpdated((_ctx, markdown, prev) => {
        if (markdown !== prev) onChange?.()
      })
    })
    crepeRef.current = crepe
    return crepe
  }, [])

  return <Milkdown />
}

// Default export so it can be React.lazy()'d (keeps Milkdown out of the SSR/worker bundle).
export default function CrepeEditor(props: Props) {
  return (
    <MilkdownProvider>
      <CrepeInner {...props} />
    </MilkdownProvider>
  )
}
