import type { Language } from '@/types'

/** "2020-11" → "novembre 2020" / "November 2020". */
export const formatMonthYear = (month: string, language: Language): string =>
  new Intl.DateTimeFormat(language, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${month}-01T00:00:00Z`))
