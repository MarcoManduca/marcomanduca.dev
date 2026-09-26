import type { ReactNode } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'

interface RowActionsProps {
  /** Item title, included in each button's accessible name. */
  title: string
  onEdit: () => void
  onDelete: () => void
  /** Extra actions rendered between Edit and Delete. */
  children?: ReactNode
}

/**
 * Edit / Delete cell of an admin table row. The accessible names carry the
 * item title ("Edit Data pipeline") so screen-reader users know which row
 * each button acts on.
 */
export const RowActions = ({
  title,
  onEdit,
  onDelete,
  children,
}: RowActionsProps) => {
  const { t } = useTranslation()

  return (
    <td className="flex flex-wrap gap-2 py-3">
      <Button
        variant="secondary"
        aria-label={t('admin.actions.editItem', { title })}
        onClick={onEdit}
      >
        {t('admin.actions.edit')}
      </Button>
      {children}
      <Button
        variant="danger"
        aria-label={t('admin.actions.deleteItem', { title })}
        onClick={onDelete}
      >
        {t('admin.actions.delete')}
      </Button>
    </td>
  )
}
