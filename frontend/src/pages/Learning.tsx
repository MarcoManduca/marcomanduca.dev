import { useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { ArticleCard } from '@/components/learning/ArticleCard'
import { Seo } from '@/components/seo/Seo'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { useGetArticlesQuery } from '@/services/learningApi'
import { LEARNING_CATEGORIES } from '@/types'

export const Learning = () => {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useGetArticlesQuery()
  const [category, setCategory] = useState('')

  const categoryOptions = [
    { value: '', label: t('learning.allCategories') },
    ...LEARNING_CATEGORIES.map((value) => ({
      value,
      label: t(`learningCategories.${value}`),
    })),
  ]

  const filtered = useMemo(() => {
    const items = data ?? []
    return category
      ? items.filter((article) => article.category === category)
      : items
  }, [data, category])

  return (
    <>
      <Seo title={t('learning.title')} description={t('learning.subtitle')} />
      <h1 className="text-3xl font-bold text-heading">{t('learning.title')}</h1>
      <p className="mt-2 text-muted">{t('learning.subtitle')}</p>
      <div className="mt-8 max-w-xs">
        <Select
          label={t('learning.categoryLabel')}
          options={categoryOptions}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>
      {isLoading && <Spinner />}
      {isError && <p className="mt-8 text-red-400">{t('common.error')}</p>}
      {data && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {filtered.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}
      {data && filtered.length === 0 && (
        <p className="mt-8 text-muted">{t('learning.empty')}</p>
      )}
    </>
  )
}
