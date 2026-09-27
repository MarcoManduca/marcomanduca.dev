import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { LAB_ID, SECTION_TITLE } from '@/components/projects/detail/styles'
import type { ProjectLab } from '@/types'

import { LabLayerPicker } from './LabLayerPicker'
import { LabSamplePicker } from './LabSamplePicker'
import { LabStage } from './LabStage'

interface LabSectionProps {
  lab: ProjectLab
}

/**
 * The project's lab: precomputed samples where a divider, dragged across
 * the image, compares the base image with what the model produced.
 */
export const LabSection = ({ lab }: LabSectionProps) => {
  const { t } = useTranslation()
  const [sampleId, setSampleId] = useState(lab.samples[0].id)
  const [layerId, setLayerId] = useState(lab.samples[0].layers[0].id)
  const [split, setSplit] = useState(50)
  const sample = lab.samples.find(({ id }) => id === sampleId) ?? lab.samples[0]
  // A layer id missing from the new sample falls back to its first layer.
  const layer =
    sample.layers.find(({ id }) => id === layerId) ?? sample.layers[0]

  return (
    <section
      id={LAB_ID}
      aria-labelledby={`${LAB_ID}-title`}
      className="flex scroll-mt-24 flex-col gap-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 id={`${LAB_ID}-title`} className={SECTION_TITLE}>
            {t('projects.lab.title')}
          </h2>
          <p className="text-body">{t('projects.lab.intro')}</p>
        </div>
        {lab.model && (
          <span className="rounded-lg bg-surface px-3 py-1.5 font-mono text-[13px] text-muted">
            <span className="sr-only">{t('projects.lab.model')}: </span>
            {lab.model}
          </span>
        )}
      </div>
      <div className="grid gap-8 rounded-[20px] bg-surface p-4 sm:p-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <LabStage
          sample={sample}
          layer={layer}
          split={split}
          onSplit={setSplit}
        />
        <div className="flex flex-col gap-6">
          {lab.samples.length > 1 && (
            <LabSamplePicker
              samples={lab.samples}
              selected={sample.id}
              onSelect={setSampleId}
            />
          )}
          <LabLayerPicker
            layers={sample.layers}
            selected={layer}
            onSelect={setLayerId}
          />
        </div>
      </div>
    </section>
  )
}
