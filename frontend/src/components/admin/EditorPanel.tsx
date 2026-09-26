import type { ReactNode } from 'react'

import { useTranslation } from 'react-i18next'

import { AdminErrorAlert } from './AdminErrorAlert'

interface EditorPanelProps {
  title: string
  /** Last save error, shown above the form (which stays open). */
  error: unknown
  children: ReactNode
}

/** Bordered panel hosting a create/edit form and its save error. */
export const EditorPanel = ({ title, error, children }: EditorPanelProps) => {
  const { t } = useTranslation()

  return (
    <section className="mt-6 rounded-xl border border-edge bg-surface p-6">
      <h2 className="mb-4 text-lg font-semibold text-heading">{title}</h2>
      <AdminErrorAlert
        title={t('admin.errors.saveFailed')}
        error={error}
        className="mb-4"
      />
      {children}
    </section>
  )
}
