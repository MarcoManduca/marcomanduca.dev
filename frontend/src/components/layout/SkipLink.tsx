import { useTranslation } from 'react-i18next'

export const MAIN_CONTENT_ID = 'main-content'

/** Keyboard shortcut past the header, visible only while focused. */
export const SkipLink = () => {
  const { t } = useTranslation()

  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-warm focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-background"
    >
      {t('nav.skipToContent')}
    </a>
  )
}
