import { useTranslation } from 'react-i18next'

import { ConfirmDialog } from '@/components/admin/ConfirmDialog'

interface DeleteConfirmProps {
  /** Localized title of the item pending deletion; null hides the dialog. */
  title: string | null
  isPending: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Delete confirmation shared by the admin list pages. */
export const DeleteConfirm = ({
  title,
  isPending,
  onConfirm,
  onCancel,
}: DeleteConfirmProps) => {
  const { t } = useTranslation()
  if (title === null) return null

  return (
    <ConfirmDialog
      title={t('admin.confirm.deleteTitle', { title })}
      message={t('admin.confirm.deleteMessage')}
      confirmLabel={t('admin.actions.delete')}
      isPending={isPending}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
