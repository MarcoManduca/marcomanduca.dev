import { useRef } from 'react'

import { useTranslation } from 'react-i18next'

import { useLanguage } from '@/hooks/useLanguage'
import { useSplitDrag } from '@/hooks/useSplitDrag'
import type { LabLayer, LabSample } from '@/types'
import { safeMediaUrl } from '@/utils/safeUrl'

import { LabSeam } from './LabSeam'
import { StageLabel } from './StageLabel'

interface LabStageProps {
  sample: LabSample
  layer: LabLayer
  /** Share of the width, from the left, that shows the base image. */
  split: number
  onSplit: (split: number) => void
}

/** The base image with a layer revealed right of a draggable divider. */
export const LabStage = ({ sample, layer, split, onSplit }: LabStageProps) => {
  const { t } = useTranslation()
  const { localize } = useLanguage()
  const stageRef = useRef<HTMLDivElement>(null)
  const drag = useSplitDrag(stageRef, onSplit)

  return (
    <div
      ref={stageRef}
      {...drag}
      className="relative aspect-[4/3] cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-xl border border-edge bg-background"
    >
      <img
        src={safeMediaUrl(sample.base.src)}
        alt={localize(sample.base.alt)}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <img
        src={safeMediaUrl(layer.src)}
        alt={localize(layer.alt)}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 0 0 ${split}%)` }}
      />
      <LabSeam split={split} onSplit={onSplit} />
      <StageLabel side="left">
        {sample.base.caption
          ? localize(sample.base.caption)
          : t('projects.lab.base')}
      </StageLabel>
      <StageLabel side="right">{localize(layer.label)}</StageLabel>
    </div>
  )
}
