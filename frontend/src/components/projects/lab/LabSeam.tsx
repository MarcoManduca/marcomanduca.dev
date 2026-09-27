import type { KeyboardEvent } from 'react'

import { useTranslation } from 'react-i18next'

import { SPLIT_ICON } from '@/components/projects/detail/icons'
import { StrokeIcon } from '@/components/ui/StrokeIcon'

/** How far an arrow key moves the divider, in percent of the width. */
export const SEAM_STEP = 5

const clampPercent = (value: number) => Math.min(100, Math.max(0, value))

/** New split for a key, or `null` for a key the divider ignores. */
const splitForKey = (key: string, split: number): number | null => {
  if (key === 'ArrowLeft' || key === 'ArrowDown') return split - SEAM_STEP
  if (key === 'ArrowRight' || key === 'ArrowUp') return split + SEAM_STEP
  if (key === 'Home') return 0
  if (key === 'End') return 100
  return null
}

interface LabSeamProps {
  split: number
  onSplit: (split: number) => void
}

/**
 * The divider between the two images: its handle is dragged with the
 * stage, and is the keyboard and screen reader control (a slider moved
 * with the arrow keys, Home and End).
 */
export const LabSeam = ({ split, onSplit }: LabSeamProps) => {
  const { t } = useTranslation()
  const at = { left: `${split}%` }

  const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    const next = splitForKey(event.key, split)
    if (next === null) return
    event.preventDefault()
    onSplit(clampPercent(next))
  }

  return (
    <>
      <span
        aria-hidden="true"
        className="absolute inset-y-0 -ml-px w-0.5 bg-highlight"
        style={at}
      />
      <span
        role="slider"
        tabIndex={0}
        aria-label={t('projects.lab.compare')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={split}
        aria-valuetext={`${split}%`}
        onKeyDown={onKeyDown}
        className="absolute top-1/2 -ml-6 -mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-highlight text-background shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-heading"
        style={at}
      >
        <StrokeIcon paths={SPLIT_ICON} className="h-5 w-5" />
      </span>
    </>
  )
}
