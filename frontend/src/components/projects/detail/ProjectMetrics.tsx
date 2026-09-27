import { useTranslation } from 'react-i18next'

import { useLanguage } from '@/hooks/useLanguage'
import type { Metric } from '@/types'
import { cn } from '@/utils/cn'

/** Desktop columns by number of metrics (the API allows up to four). */
const COLUMNS = [
  '',
  'lg:grid-cols-1',
  'lg:grid-cols-2',
  'lg:grid-cols-3',
  'lg:grid-cols-4',
]

interface ProjectMetricsProps {
  metrics: Metric[]
}

/** The project's key numbers, in one row on desktop. */
export const ProjectMetrics = ({ metrics }: ProjectMetricsProps) => {
  const { t } = useTranslation()
  const { localize } = useLanguage()

  if (metrics.length === 0) return null

  return (
    <dl
      aria-label={t('projects.detail.metrics')}
      className={cn('grid grid-cols-2 gap-4', COLUMNS[metrics.length])}
    >
      {metrics.map((metric) => (
        <div
          key={metric.value + metric.label.en}
          className="flex flex-col-reverse justify-end gap-1 rounded-2xl border border-edge px-6 py-4"
        >
          <dt className="text-[15px] leading-snug text-muted">
            {localize(metric.label)}
          </dt>
          <dd className="font-display text-[40px] font-extrabold leading-none text-heading sm:text-[44px]">
            {metric.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
