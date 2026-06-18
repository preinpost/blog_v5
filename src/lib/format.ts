/** Format a post timestamp (Date, ms number, or ISO string) as a Korean date. */
export function formatDate(value: Date | number | string): string {
  const date = value instanceof Date ? value : new Date(value)
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}
