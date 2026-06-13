import { useTranslation } from 'react-i18next'

import { useLanguage } from '@/hooks/useLanguage'
import type { Language } from '@/types'
import { cn } from '@/utils/cn'

const LANGUAGES: Language[] = ['en', 'it']

export const LanguageSwitcher = () => {
  const { t } = useTranslation()
  const { language, setLanguage } = useLanguage()

  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className="flex items-center gap-1 rounded-lg border border-edge p-0.5"
    >
      {LANGUAGES.map((lng) => (
        <button
          key={lng}
          type="button"
          aria-pressed={language === lng}
          onClick={() => setLanguage(lng)}
          className={cn(
            'rounded-md px-2 py-0.5 text-xs font-semibold uppercase transition-colors',
            language === lng
              ? 'bg-accent text-white'
              : 'text-muted hover:text-heading',
          )}
        >
          {lng}
        </button>
      ))}
    </div>
  )
}
