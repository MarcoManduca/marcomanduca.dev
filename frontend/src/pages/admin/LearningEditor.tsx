import { useTranslation } from 'react-i18next'

import { EditorPanel } from '@/components/admin/EditorPanel'
import type { LearningArticle, LearningArticleInput } from '@/types'

import { LearningForm } from './LearningForm'
import type { Editing } from './useAdminEditor'

interface LearningEditorProps {
  editing: Editing<LearningArticle>
  /** The live article list, so the form sees changes made while it is open. */
  articles: LearningArticle[] | undefined
  error: unknown
  isSaving: boolean
  onSubmit: (input: LearningArticleInput) => void
  onCancel: () => void
}

/**
 * Editor panel for a new or an existing article. An existing article is read
 * from the live list rather than the snapshot taken when editing started, and
 * the form is keyed by its version: a rollback from the versions panel
 * reloads the form with the restored content, so a later save cannot
 * silently overwrite the rollback with the old text.
 */
export const LearningEditor = ({
  editing,
  articles,
  error,
  isSaving,
  onSubmit,
  onCancel,
}: LearningEditorProps) => {
  const { t } = useTranslation()
  if (!editing) return null

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
      <LearningForm
        key={article ? `${article.slug}:${article.version}` : 'new'}
        initial={article}
        isSaving={isSaving}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </EditorPanel>
  )
}
