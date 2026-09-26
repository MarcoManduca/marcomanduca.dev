import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'

interface FormActionsProps {
  isSaving: boolean
  onCancel: () => void
}

/** Save / Cancel buttons spanning the full width of an admin form grid. */
export const FormActions = ({ isSaving, onCancel }: FormActionsProps) => {
  const { t } = useTranslation()

  return (
    <div className="flex gap-3 sm:col-span-2">
      <Button type="submit" disabled={isSaving}>
        {isSaving ? t('admin.actions.saving') : t('admin.actions.save')}
      </Button>
      <Button type="button" variant="secondary" onClick={onCancel}>
        {t('admin.actions.cancel')}
      </Button>
    </div>
  )
}
