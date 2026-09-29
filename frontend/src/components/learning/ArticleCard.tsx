import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useLanguage } from '@/hooks/useLanguage'
import type { LearningArticleSummary } from '@/types'
import { formatDate } from '@/utils/formatDate'

interface ArticleCardProps {
  article: LearningArticleSummary
}

export const ArticleCard = ({ article }: ArticleCardProps) => {
  const { t } = useTranslation()
  const { language, localize } = useLanguage()

  return (
    <Card className="flex h-full flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-heading">
          <Link
            to={`/learning/${article.slug}`}
            className="hover:text-accent-hover"
          >
            {localize(article.title)}
          </Link>
        </h3>
        <Badge tone="green">
          {t(`learningCategories.${article.category}`)}
        </Badge>
      </div>
      {/* Only a signed-in admin is served unpublished articles: flag them. */}
      {article.status !== 'published' && (
        <StatusBadge status={article.status} className="self-start" />
      )}
      <p className="flex-1 text-sm text-body">{localize(article.excerpt)}</p>
      <p className="text-xs text-muted">
        {t('learning.updatedOn')} {formatDate(article.updated_at, language)}
      </p>
    </Card>
  )
}
