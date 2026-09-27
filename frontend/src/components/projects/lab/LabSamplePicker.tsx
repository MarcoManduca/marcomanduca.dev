import { useId } from 'react'

import { useTranslation } from 'react-i18next'

import { LABEL } from '@/components/projects/detail/styles'
import { useLanguage } from '@/hooks/useLanguage'
import type { LabSample } from '@/types'
import { cn } from '@/utils/cn'
import { safeMediaUrl } from '@/utils/safeUrl'

interface LabSamplePickerProps {
  samples: LabSample[]
  selected: string
  onSelect: (id: string) => void
}

/** Thumbnails of the lab's samples, to switch between them. */
export const LabSamplePicker = ({
  samples,
  selected,
  onSelect,
}: LabSamplePickerProps) => {
  const { t } = useTranslation()
  const { localize } = useLanguage()
  const labelId = useId()

  return (
    <div className="flex flex-col gap-2.5">
      <span id={labelId} className={LABEL}>
        {t('projects.lab.samples')}
      </span>
      <div
        role="group"
        aria-labelledby={labelId}
        className="flex flex-wrap gap-3"
      >
        {samples.map((sample) => (
          <button
            key={sample.id}
            type="button"
            aria-pressed={sample.id === selected}
            aria-label={localize(sample.label)}
            onClick={() => onSelect(sample.id)}
            className={cn(
              'h-20 w-[104px] overflow-hidden rounded-[10px] border-[3px] bg-background transition-opacity',
              sample.id === selected
                ? 'border-highlight'
                : 'border-transparent opacity-70 hover:opacity-100',
            )}
          >
            <img
              src={safeMediaUrl(sample.base.src)}
              alt=""
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
