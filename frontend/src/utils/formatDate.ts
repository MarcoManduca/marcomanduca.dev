import type { Language } from '@/types'

const LOCALE_BY_LANGUAGE: Record<Language, string> = {
  en: 'en-GB',
  it: 'it-IT',
}

/** Format an ISO date string for the given UI language (e.g. "12 June 2026"). */
export const formatDate = (isoDate: string, language: Language): string => {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat(LOCALE_BY_LANGUAGE[language], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}
