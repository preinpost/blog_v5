import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

const base =
  'inline-flex cursor-pointer select-none items-center justify-center gap-1.5 rounded-lg ' +
  'font-medium transition-colors disabled:pointer-events-none disabled:opacity-50'

const sizes: Record<Size, string> = {
  // 36px min-height for compact toolbars
  sm: 'min-h-9 px-3 text-sm',
  // 44px min-height (comfortable touch target)
  md: 'min-h-11 px-4 text-sm',
}

const variants: Record<Variant, string> = {
  primary:
    'bg-neutral-900 text-white hover:bg-neutral-700 active:bg-neutral-800 ' +
    'dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300',
  secondary:
    'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 ' +
    'hover:text-neutral-900 active:bg-neutral-200 ' +
    'dark:border-neutral-700 dark:bg-transparent dark:text-neutral-300 dark:hover:bg-neutral-800 ' +
    'dark:hover:text-neutral-100',
  ghost:
    'bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 ' +
    'dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
  danger:
    'bg-transparent text-red-600 hover:bg-red-50 hover:text-red-700 ' +
    'dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}) {
  return (
    <button
      type="button"
      className={`${base} ${sizes[size]} ${variants[variant]} ${className ?? ''}`}
      {...props}
    />
  )
}
