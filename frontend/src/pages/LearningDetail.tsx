import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer'
import { Seo } from '@/components/seo/Seo'
import { Badge } from '@/components/ui/Badge'
import { Prose } from '@/components/ui/Prose'
import { Spinner } from '@/components/ui/Spinner'
import { Tag } from '@/components/ui/Tag'
import { useLanguage } from '@/hooks/useLanguage'
import { useGetArticleBySlugQuery } from '@/services/learningApi'
import { excerpt } from '@/utils/excerpt'
import { formatDate } from '@/utils/formatDate'

import { NotFound } from './NotFound'

export const LearningDetail = () => {
  const { t } = useTranslation()
  const { language, localize } = useLanguage()
  const { slug = '' } = useParams()
  const { data: article, isLoading, isError } = useGetArticleBySlugQuery(slug)

  if (isLoading) return <Spinner />
  if (isError || !article) return <NotFound />

  return (
    <article>
      <Seo
        title={localize(article.title)}
        description={excerpt(localize(article.content_markdown))}
        type="article"
      />
      <Link
        to="/learning"
        className="text-sm text-accent hover:text-accent-hover"
      >
        ← {t('learning.backToLearning')}
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold text-heading">
          {localize(article.title)}
        </h1>
        <Badge tone="green">
          {t(`learningCategories.${article.category}`)}
        </Badge>
      </div>
      <p className="mt-2 text-xs text-muted">
        {t('learning.updatedOn')} {formatDate(article.updated_at, language)} · v
        {article.version}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {article.tags.map((tag) => (
          <Tag key={tag} label={tag} />
        ))}
      </div>
      <Prose className="mt-8">
        <MarkdownRenderer content={localize(article.content_markdown)} />
      </Prose>
    </article>
  )
}
