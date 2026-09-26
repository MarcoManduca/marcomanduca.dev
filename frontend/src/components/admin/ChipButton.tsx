import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

interface ChipButtonProps {
  selected: boolean
  onClick: () => void
  children: ReactNode
}

/** Toggleable pill used by the technology and tag pickers. */
export const ChipButton = ({
  selected,
  onClick,
  children,
}: ChipButtonProps) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={cn(
      'rounded-full border px-3 py-1 text-sm transition-colors',
      selected
        ? 'border-accent bg-accent text-background'
        : 'border-edge text-body hover:border-accent hover:text-heading',
    )}
  >
    {children}
  </button>
)
