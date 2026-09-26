import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/Badge'
import type { ProjectStatus } from '@/types'

interface StatusBadgeProps {
  status: ProjectStatus
}

/** Green badge for published content, gray for drafts. */
export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { t } = useTranslation()

  return (
    <Badge tone={status === 'published' ? 'green' : 'gray'}>
      {t(`statuses.${status}`)}
    </Badge>
  )
}
