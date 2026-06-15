import type { Language } from '@/types'

const LOCALE_BY_LANGUAGE: Record<Language, string> = {
  en: 'en-GB',
  it: 'it-IT',
}

// Intl.DateTimeFormat is expensive to construct, so cache one per language
// instead of rebuilding it on every render of a list item.
const formatterCache = new Map<Language, Intl.DateTimeFormat>()

const getFormatter = (language: Language): Intl.DateTimeFormat => {
  let formatter = formatterCache.get(language)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(LOCALE_BY_LANGUAGE[language], {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    formatterCache.set(language, formatter)
  }
  return formatter
}

/** Format an ISO date string for the given UI language (e.g. "12 June 2026"). */
export const formatDate = (isoDate: string, language: Language): string => {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ''

  return getFormatter(language).format(date)
}
