import { useTranslation } from 'react-i18next'

import { useLanguage } from '@/hooks/useLanguage'
import { unlock } from '@/store/gameSlice'
import { useAppDispatch } from '@/store/hooks'
import type { Language } from '@/types'
import { cn } from '@/utils/cn'

const LANGUAGES: { code: Language; flag: string }[] = [
  { code: 'en', flag: '🇬🇧' },
  { code: 'it', flag: '🇮🇹' },
]

export const LanguageSwitcher = () => {
  const { t } = useTranslation()
  const { language, setLanguage } = useLanguage()
  const dispatch = useAppDispatch()

  const handleSelect = (code: Language) => {
    if (code === language) return
    setLanguage(code)
    dispatch(unlock('polyglot'))
  }

  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className="flex h-10 items-center gap-1 rounded-lg border-2 border-edge p-1"
    >
      {LANGUAGES.map(({ code, flag }) => (
        <button
          key={code}
          type="button"
          // The full language name, pronounced in that language: a screen
          // reader would read "it" as the English pronoun.
          aria-label={t(`language.${code}`)}
          lang={code}
          aria-pressed={language === code}
          onClick={() => handleSelect(code)}
          className={cn(
            'inline-flex h-full items-center gap-1 rounded-md px-2 font-display text-sm font-bold uppercase transition-colors',
            language === code
              ? 'bg-accent text-background'
              : 'text-muted hover:text-heading',
          )}
        >
          <span aria-hidden="true" className="text-sm leading-none">
            {flag}
          </span>
          {code}
        </button>
      ))}
    </div>
  )
}
