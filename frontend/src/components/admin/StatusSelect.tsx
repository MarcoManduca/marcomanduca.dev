import { useTranslation } from 'react-i18next'

import { Select } from '@/components/ui/Select'
import type { ProjectStatus } from '@/types'
import { PROJECT_STATUSES } from '@/types'

interface StatusSelectProps {
  defaultValue?: ProjectStatus
}

/** Draft / published selector, submitted as the `status` form field. */
export const StatusSelect = ({ defaultValue = 'draft' }: StatusSelectProps) => {
  const { t } = useTranslation()

  return (
    <Select
      label={t('admin.form.status')}
      name="status"
      defaultValue={defaultValue}
      options={PROJECT_STATUSES.map((value) => ({
        value,
        label: t(`statuses.${value}`),
      }))}
    />
  )
}
