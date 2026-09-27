import type { Language } from '@/types'

/** "2020-11" → "Novembre 2020" / "November 2020" (month capitalised). */
export const formatMonthYear = (month: string, language: Language): string => {
  const formatted = new Intl.DateTimeFormat(language, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${month}-01T00:00:00Z`))
  return formatted.charAt(0).toLocaleUpperCase(language) + formatted.slice(1)
}
