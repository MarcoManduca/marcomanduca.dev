import { useTranslation } from 'react-i18next'

import { EditorPanel } from '@/components/admin/EditorPanel'
import type { LearningArticleInput, LearningArticleSummary } from '@/types'

import { LearningForm } from './LearningForm'
import { LearningFormLoader } from './LearningFormLoader'
import type { Editing } from './useAdminEditor'

interface LearningEditorProps {
  editing: Editing<LearningArticleSummary>
  /** The live article list, so the form sees changes made while it is open. */
  articles: LearningArticleSummary[] | undefined
  error: unknown
  isSaving: boolean
  onSubmit: (input: LearningArticleInput) => void
  onCancel: () => void
  onDirty: () => void
}

/**
 * Editor panel for a new or an existing article. An existing article is
 * looked up in the live list rather than the snapshot taken when editing
 * started, and its full content is loaded by LearningFormLoader (the list
 * only carries excerpts), which also reloads the form after a rollback.
 */
export const LearningEditor = ({
  editing,
  articles,
  error,
  isSaving,
  onSubmit,
  onCancel,
  onDirty,
}: LearningEditorProps) => {
  const { t } = useTranslation()
  if (!editing) return null
  const formProps = { isSaving, onSubmit, onCancel, onDirty }

  const article =
    editing.mode === 'edit'
      ? (articles?.find(({ slug }) => slug === editing.item.slug) ??
        editing.item)
      : null

  return (
    <EditorPanel
      title={t(
        article ? 'admin.learning.editArticle' : 'admin.learning.newArticle',
      )}
      error={error}
    >
      {article ? (
        <LearningFormLoader
          key={article.slug}
          slug={article.slug}
          {...formProps}
        />
      ) : (
        <LearningForm key="new" initial={null} {...formProps} />
      )}
    </EditorPanel>
  )
}
