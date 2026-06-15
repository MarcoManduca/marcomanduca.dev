import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Seo } from '@/components/seo/Seo'

export const NotFound = () => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <Seo title={t('notFound.title')} description={t('notFound.message')} />
      <h1 className="font-mono text-6xl font-bold text-accent">
        {t('notFound.title')}
      </h1>
      <p className="text-muted">{t('notFound.message')}</p>
      <Link
        to="/"
        className="rounded-lg bg-warm px-5 py-2.5 text-sm font-medium text-background hover:bg-warm-hover"
      >
        {t('notFound.backHome')}
      </Link>
    </div>
  )
}
