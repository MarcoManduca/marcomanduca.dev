import { useTranslation } from 'react-i18next'

import type { ProjectArea } from '@/types'
import { cn } from '@/utils/cn'

import { areaStyle } from './areaStyles'
import { CHIP } from './chip'

interface AreaChipProps {
  area: ProjectArea
}

/** Area of a project, in its family colour, with its icon. */
export const AreaChip = ({ area }: AreaChipProps) => {
  const { t } = useTranslation()
  const { chip, icon } = areaStyle(area)

  return (
    <span className={cn(CHIP, chip)}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-3.5 w-3.5"
      >
        {icon.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
      {t(`projectAreas.${area}`)}
    </span>
  )
}
