import type { ProjectArea } from '@/types'
import { cn } from '@/utils/cn'

import { AreaChip } from './AreaChip'

interface AreaChipsProps {
  areas: ProjectArea[]
  className?: string
}

/** Every area of a project, main one first, wrapping when short of room. */
export const AreaChips = ({ areas, className }: AreaChipsProps) => (
  <ul className={cn('flex flex-wrap items-center gap-1.5', className)}>
    {areas.map((area) => (
      <li key={area}>
        <AreaChip area={area} />
      </li>
    ))}
  </ul>
)
