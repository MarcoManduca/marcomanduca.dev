import { useTranslation } from 'react-i18next'

import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { Technology } from '@/types'
import { PROJECT_AREAS, PROJECT_CONTEXTS } from '@/types'
import type { ProjectFiltersValue } from '@/utils/filterProjects'

interface ProjectFiltersProps {
  value: ProjectFiltersValue
  technologies: Technology[]
  onChange: (value: ProjectFiltersValue) => void
}

export const ProjectFilters = ({
  value,
  technologies,
  onChange,
}: ProjectFiltersProps) => {
  const { t } = useTranslation()

  /** "All …" first, then one option per value, labelled from `prefix`. */
  const options = (values: readonly string[], prefix: string, all: string) => [
    { value: '', label: t(all) },
    ...values.map((item) => ({ value: item, label: t(`${prefix}.${item}`) })),
  ]
  const select = (field: keyof ProjectFiltersValue) => ({
    value: value[field],
    onChange: (e: { target: { value: string } }) =>
      onChange({ ...value, [field]: e.target.value }),
  })

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Input
        label={t('projects.searchLabel')}
        type="search"
        placeholder={t('projects.searchPlaceholder')}
        {...select('search')}
      />
      <Select
        label={t('projects.areaLabel')}
        options={options(PROJECT_AREAS, 'projectAreas', 'projects.allAreas')}
        {...select('area')}
      />
      <Select
        label={t('projects.contextLabel')}
        options={options(
          PROJECT_CONTEXTS,
          'projectContexts',
          'projects.allContexts',
        )}
        {...select('context')}
      />
      <Select
        label={t('projects.technologyLabel')}
        options={[
          { value: '', label: t('projects.allTechnologies') },
          ...technologies.map(({ name }) => ({ value: name, label: name })),
        ]}
        {...select('technology')}
      />
    </div>
  )
}
