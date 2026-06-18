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
}

function CrepeInner({ initialMarkdown, crepeRef, onUpload }: Props) {
  useEditor((root) => {
    const crepe = new Crepe({
      root,
      defaultValue: initialMarkdown,
      featureConfigs: onUpload
        ? { [Crepe.Feature.ImageBlock]: { onUpload } }
        : undefined,
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
