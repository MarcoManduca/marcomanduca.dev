import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { AdminErrorAlert } from '@/components/admin/AdminErrorAlert'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminTable } from '@/components/admin/AdminTable'
import { ErrorState } from '@/components/ui/ErrorState'
import { Spinner } from '@/components/ui/Spinner'
import { useLanguage } from '@/hooks/useLanguage'
import {
  useCreateArticleMutation,
  useDeleteArticleMutation,
  useGetArticlesQuery,
  useUpdateArticleMutation,
} from '@/services/learningApi'
import type { LearningArticleInput, LearningArticleSummary } from '@/types'

import { ArticleRow } from './ArticleRow'
import { DeleteConfirm } from './DeleteConfirm'
import { LearningEditor } from './LearningEditor'
import { VersionsPanel } from './VersionsPanel'
import { useAdminEditor } from './useAdminEditor'

export const AdminLearning = () => {
  const { t } = useTranslation()
  const { localize } = useLanguage()
  const { data, isLoading, isError, refetch } = useGetArticlesQuery()
  const [createArticle, { isLoading: isCreating }] = useCreateArticleMutation()
  const [updateArticle, { isLoading: isUpdating }] = useUpdateArticleMutation()
  const [deleteArticle, { isLoading: isDeleting }] = useDeleteArticleMutation()
  const editor = useAdminEditor<LearningArticleSummary, LearningArticleInput>({
    create: (body) => createArticle(body).unwrap(),
    update: (slug, body) => updateArticle({ slug, body }).unwrap(),
    remove: (slug) => deleteArticle(slug).unwrap(),
  })
  const { editing, pendingDelete } = editor
  // Only the slug is stored: the article (and its current version) is read
  // from the live query so the panel reflects rollbacks and deletions.
  const [versionsSlug, setVersionsSlug] = useState<string | null>(null)
  const versionsArticle = data?.find(({ slug }) => slug === versionsSlug)

  if (isLoading) return <Spinner />
  // Only without data: a failed refetch after a save keeps the open editor.
  if (isError && !data) return <ErrorState onRetry={() => void refetch()} />

  return (
    <>
      <AdminPageHeader
        title={t('admin.learning.title')}
        actionLabel={t('admin.learning.newArticle')}
        onAction={editor.startNew}
      />
      <LearningEditor
        editing={editing}
        articles={data}
        error={editor.saveError}
        isSaving={isCreating || isUpdating}
        onSubmit={editor.save}
        onCancel={editor.cancel}
        onDirty={editor.markDirty}
      />
      <AdminErrorAlert
        title={t('admin.errors.deleteFailed')}
        error={editor.deleteError}
        className="mt-6"
      />
      <AdminTable columns={['title', 'category', 'status', 'version']}>
        {data?.map((article) => (
          <ArticleRow
            key={article.slug}
            article={article}
            onEdit={() => editor.startEdit(article)}
            onToggleVersions={() =>
              setVersionsSlug((open) =>
                open === article.slug ? null : article.slug,
              )
            }
            onDelete={() => editor.requestDelete(article)}
          />
        ))}
      </AdminTable>
      {versionsArticle && <VersionsPanel article={versionsArticle} />}
      <DeleteConfirm
        title={pendingDelete && localize(pendingDelete.title)}
        isPending={isDeleting}
        onConfirm={() => void editor.confirmDelete()}
        onCancel={editor.cancelDelete}
      />
    </>
  )
}
