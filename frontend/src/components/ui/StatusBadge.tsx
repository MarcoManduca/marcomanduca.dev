import { useTranslation } from 'react-i18next'

import type { ProjectStatus } from '@/types'

import { Badge } from './Badge'

interface StatusBadgeProps {
  status: ProjectStatus
  className?: string
}

/** Green badge for published content, gray for drafts. */
export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const { t } = useTranslation()

  return (
    <Badge
      tone={status === 'published' ? 'green' : 'gray'}
      className={className}
    >
      {t(`statuses.${status}`)}
    </Badge>
  )
}
