import { useTranslation } from 'react-i18next'

import { RowActions } from '@/components/admin/RowActions'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useLanguage } from '@/hooks/useLanguage'
import type { LearningArticleSummary } from '@/types'

interface ArticleRowProps {
  article: LearningArticleSummary
  onEdit: () => void
  onToggleVersions: () => void
  onDelete: () => void
}

export const ArticleRow = ({
  article,
  onEdit,
  onToggleVersions,
  onDelete,
}: ArticleRowProps) => {
  const { t } = useTranslation()
  const { localize } = useLanguage()
  const title = localize(article.title)

  return (
    <tr className="border-b border-edge/50">
      <td className="py-3 pr-4 font-medium text-heading">{title}</td>
      <td className="py-3 pr-4">
        {t(`learningCategories.${article.category}`)}
      </td>
      <td className="py-3 pr-4">
        <StatusBadge status={article.status} />
      </td>
      <td className="py-3 pr-4 font-mono">v{article.version}</td>
      <RowActions title={title} onEdit={onEdit} onDelete={onDelete}>
        <Button
          variant="secondary"
          aria-label={t('admin.learning.versionsFor', { title })}
          onClick={onToggleVersions}
        >
          {t('admin.learning.versions')}
        </Button>
      </RowActions>
    </tr>
  )
}
