import { useCallback } from 'react'

import { useTranslation } from 'react-i18next'

import type { Language, LocalizedText } from '@/types'

export interface LanguageState {
  language: Language
  setLanguage: (language: Language) => void
  localize: (text: LocalizedText | null | undefined) => string
}

/** Current UI language plus a helper to pick bilingual backend fields. */
export const useLanguage = (): LanguageState => {
  const { i18n } = useTranslation()

  const language: Language = i18n.language.startsWith('it') ? 'it' : 'en'

  const setLanguage = useCallback(
    (next: Language) => void i18n.changeLanguage(next),
    [i18n],
  )

  const localize = useCallback(
    (text: LocalizedText | null | undefined): string => {
      if (!text) return ''
      return text[language] || text.en
    },
    [language],
  )

  return { language, setLanguage, localize }
}
