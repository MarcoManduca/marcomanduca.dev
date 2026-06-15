import { useTranslation } from 'react-i18next'

import { useLanguage } from '@/hooks/useLanguage'
import type { Language } from '@/types'
import { cn } from '@/utils/cn'

const LANGUAGES: { code: Language; flag: string }[] = [
  { code: 'en', flag: '🇬🇧' },
  { code: 'it', flag: '🇮🇹' },
]

export const LanguageSwitcher = () => {
  const { t } = useTranslation()
  const { language, setLanguage } = useLanguage()

  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className="flex items-center gap-1 rounded-lg border border-edge p-0.5"
    >
      {LANGUAGES.map(({ code, flag }) => (
        <button
          key={code}
          type="button"
          aria-pressed={language === code}
          onClick={() => setLanguage(code)}
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold uppercase transition-colors',
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
