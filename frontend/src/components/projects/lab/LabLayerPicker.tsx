import { useId } from 'react'

import { useTranslation } from 'react-i18next'

import { LABEL } from '@/components/projects/detail/styles'
import { useLanguage } from '@/hooks/useLanguage'
import type { LabLayer } from '@/types'
import { cn } from '@/utils/cn'

interface LabLayerPickerProps {
  layers: LabLayer[]
  selected: LabLayer
  onSelect: (id: string) => void
}

/** Which image the seam reveals, with how to read it. */
export const LabLayerPicker = ({
  layers,
  selected,
  onSelect,
}: LabLayerPickerProps) => {
  const { t } = useTranslation()
  const { localize } = useLanguage()
  const labelId = useId()

  return (
    <div className="flex flex-col gap-2.5">
      <span id={labelId} className={LABEL}>
        {t('projects.lab.view')}
      </span>
      <div
        role="group"
        aria-labelledby={labelId}
        className="flex gap-1 rounded-xl bg-background p-1"
      >
        {layers.map((layer) => (
          <button
            key={layer.id}
            type="button"
            aria-pressed={layer.id === selected.id}
            onClick={() => onSelect(layer.id)}
            className={cn(
              'min-h-11 flex-1 rounded-[9px] px-2 font-display text-base font-bold uppercase leading-tight tracking-[0.04em] transition-colors sm:text-[17px]',
              layer.id === selected.id
                ? 'bg-highlight text-background'
                : 'text-body hover:text-heading',
            )}
          >
            {localize(layer.label)}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="mt-1 leading-relaxed text-body">
        {localize(selected.description)}
      </p>
    </div>
  )
}
