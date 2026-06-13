import { useTranslation } from 'react-i18next'

import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { Technology } from '@/types'
import { PROJECT_CATEGORIES } from '@/types'

export interface ProjectFiltersValue {
  search: string
  category: string
  technology: string
}

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

  const categoryOptions = [
    { value: '', label: t('projects.allCategories') },
    ...PROJECT_CATEGORIES.map((category) => ({
      value: category,
      label: t(`projectCategories.${category}`),
    })),
  ]

  const technologyOptions = [
    { value: '', label: t('projects.allTechnologies') },
    ...technologies.map(({ name }) => ({ value: name, label: name })),
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Input
        label={t('projects.searchLabel')}
        type="search"
        placeholder={t('projects.searchPlaceholder')}
        value={value.search}
        onChange={(e) => onChange({ ...value, search: e.target.value })}
      />
      <Select
        label={t('projects.categoryLabel')}
        options={categoryOptions}
        value={value.category}
        onChange={(e) => onChange({ ...value, category: e.target.value })}
      />
      <Select
        label={t('projects.technologyLabel')}
        options={technologyOptions}
        value={value.technology}
        onChange={(e) => onChange({ ...value, technology: e.target.value })}
      />
    </div>
  )
}
