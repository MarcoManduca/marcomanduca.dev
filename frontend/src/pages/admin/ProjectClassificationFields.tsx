import { useTranslation } from 'react-i18next'

import { Select } from '@/components/ui/Select'
import type { Project } from '@/types'
import { PROJECT_AREAS, PROJECT_CONTEXTS } from '@/types'

interface ProjectClassificationFieldsProps {
  initial: Project | null
}

/** Up to three areas (the main one first) and the context of the project. */
export const ProjectClassificationFields = ({
  initial,
}: ProjectClassificationFieldsProps) => {
  const { t } = useTranslation()
  const options = (values: readonly string[], prefix: string) =>
    values.map((value) => ({ value, label: t(`${prefix}.${value}`) }))
  const areas = options(PROJECT_AREAS, 'projectAreas')

  return (
    <>
      <Select
        label={t('admin.form.mainArea')}
        name="mainArea"
        defaultValue={initial?.areas[0]}
        options={areas}
      />
      <Select
        label={t('admin.form.secondArea')}
        name="secondArea"
        defaultValue={initial?.areas[1] ?? ''}
        options={[{ value: '', label: t('admin.form.noArea') }, ...areas]}
      />
      <Select
        label={t('admin.form.thirdArea')}
        name="thirdArea"
        defaultValue={initial?.areas[2] ?? ''}
        options={[{ value: '', label: t('admin.form.noArea') }, ...areas]}
      />
      <Select
        label={t('admin.form.context')}
        name="context"
        defaultValue={initial?.context}
        options={options(PROJECT_CONTEXTS, 'projectContexts')}
      />
    </>
  )
}
