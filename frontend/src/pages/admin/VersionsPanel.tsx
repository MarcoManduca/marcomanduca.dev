import { useTranslation } from 'react-i18next'

import { useLanguage } from '@/hooks/useLanguage'
import type { LearningArticleSummary } from '@/types'

import { VersionsList } from './VersionsList'

interface VersionsPanelProps {
  article: LearningArticleSummary
}

/** Version history of one article, below the admin learning table. */
export const VersionsPanel = ({ article }: VersionsPanelProps) => {
  const { t } = useTranslation()
  const { localize } = useLanguage()

  return (
    <section className="mt-6">
      <h2 className="mb-3 text-lg font-semibold text-heading">
        {t('admin.learning.versions')} — {localize(article.title)}
      </h2>
      <VersionsList slug={article.slug} currentVersion={article.version} />
    </section>
  )
}
