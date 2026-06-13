import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useLanguage } from '@/hooks/useLanguage'
import {
  useCreateArticleMutation,
  useDeleteArticleMutation,
  useGetArticlesQuery,
  useUpdateArticleMutation,
} from '@/services/learningApi'
import type { LearningArticle, LearningArticleInput } from '@/types'

import { LearningForm } from './LearningForm'
import { VersionsList } from './VersionsList'

type Editing =
  | { mode: 'new' }
  | { mode: 'edit'; article: LearningArticle }
  | null

export const AdminLearning = () => {
  const { t } = useTranslation()
  const { localize } = useLanguage()
  const { data, isLoading } = useGetArticlesQuery()
  const [createArticle, { isLoading: isCreating }] = useCreateArticleMutation()
  const [updateArticle, { isLoading: isUpdating }] = useUpdateArticleMutation()
  const [deleteArticle] = useDeleteArticleMutation()
  const [editing, setEditing] = useState<Editing>(null)
  const [versionsFor, setVersionsFor] = useState<LearningArticle | null>(null)

  const handleSubmit = async (input: LearningArticleInput) => {
    if (editing?.mode === 'edit') {
      await updateArticle({ slug: editing.article.slug, body: input })
    } else {
      await createArticle(input)
    }
    setEditing(null)
  }

  if (isLoading) return <Spinner />

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-heading">
          {t('admin.learning.title')}
        </h1>
        <Button onClick={() => setEditing({ mode: 'new' })}>
          {t('admin.learning.newArticle')}
        </Button>
      </div>
      {editing && (
        <div className="mt-6 rounded-xl border border-edge bg-surface p-6">
          <LearningForm
            initial={editing.mode === 'edit' ? editing.article : null}
            isSaving={isCreating || isUpdating}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}
      <table className="mt-6 w-full text-left text-sm">
        <thead className="border-b border-edge text-muted">
          <tr>
            <th className="py-2 pr-4">{t('admin.table.title')}</th>
            <th className="py-2 pr-4">{t('admin.table.category')}</th>
            <th className="py-2 pr-4">{t('admin.table.status')}</th>
            <th className="py-2 pr-4">{t('admin.table.version')}</th>
            <th className="py-2">{t('admin.table.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((article) => (
            <tr key={article.slug} className="border-b border-edge/50">
              <td className="py-3 pr-4 font-medium text-heading">
                {localize(article.title)}
              </td>
              <td className="py-3 pr-4">
                {t(`learningCategories.${article.category}`)}
              </td>
              <td className="py-3 pr-4">
                <Badge tone={article.status === 'published' ? 'green' : 'gray'}>
                  {t(`statuses.${article.status}`)}
                </Badge>
              </td>
              <td className="py-3 pr-4 font-mono">v{article.version}</td>
              <td className="flex flex-wrap gap-2 py-3">
                <Button
                  variant="secondary"
                  onClick={() => setEditing({ mode: 'edit', article })}
                >
                  {t('admin.actions.edit')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setVersionsFor(
                      versionsFor?.slug === article.slug ? null : article,
                    )
                  }
                >
                  {t('admin.learning.versions')}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => void deleteArticle(article.slug)}
                >
                  {t('admin.actions.delete')}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {versionsFor && (
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-semibold text-heading">
            {t('admin.learning.versions')} — {localize(versionsFor.title)}
          </h2>
          <VersionsList
            slug={versionsFor.slug}
            currentVersion={versionsFor.version}
          />
        </div>
      )}
    </>
  )
}
