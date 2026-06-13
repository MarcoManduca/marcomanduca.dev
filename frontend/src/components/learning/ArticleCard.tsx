import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { useLanguage } from '@/hooks/useLanguage'
import type { LearningArticle } from '@/types'
import { excerpt } from '@/utils/excerpt'
import { formatDate } from '@/utils/formatDate'

interface ArticleCardProps {
  article: LearningArticle
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
      <p className="flex-1 text-sm text-body">
        {excerpt(localize(article.content_markdown))}
      </p>
      <p className="text-xs text-muted">
        {t('learning.updatedOn')} {formatDate(article.updated_at, language)}
      </p>
    </Card>
  )
}
