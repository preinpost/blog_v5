import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { useId } from 'react'

/** Shared field style: consistent border, radius, focus color. */
const fieldClass =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm ' +
  'text-neutral-900 shadow-sm transition-colors placeholder:text-neutral-400 ' +
  'hover:border-neutral-400 focus:border-neutral-500 ' +
  'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 ' +
  'dark:placeholder:text-neutral-500 dark:hover:border-neutral-600'

/** Labeled form field. Associate a real <label> so SRs + click-to-focus work. */
export function Field({
  label,
  hint,
  htmlFor,
  className,
  children,
}: {
  label: string
  hint?: string
  htmlFor?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
      >
        {label}
      </label>
      {children}
      {hint ? (
        <p className="mt-1.5 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClass} ${props.className ?? ''}`} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${fieldClass} ${props.className ?? ''}`} />
  )
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} className={`${fieldClass} ${props.className ?? ''}`} />
  )
}

/** Small labeled checkbox row (keeps label + box visually united). */
export function Checkbox({
  label,
  detail,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  detail?: string
}) {
  const id = useId()
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-2.5 text-sm text-neutral-700 dark:text-neutral-300"
    >
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 size-4 cursor-pointer accent-neutral-900"
        {...props}
      />
      <span>
        {label}
        {detail ? (
          <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
            {detail}
          </span>
        ) : null}
      </span>
    </label>
  )
}
