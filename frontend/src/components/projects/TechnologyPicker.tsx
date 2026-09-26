import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { AdminErrorAlert } from '@/components/admin/AdminErrorAlert'
import { ChipButton } from '@/components/admin/ChipButton'
import { InlineAddField } from '@/components/admin/InlineAddField'
import {
  useCreateTechnologyMutation,
  useGetTechnologiesQuery,
} from '@/services/technologiesApi'

interface TechnologyPickerProps {
  /** Selected technology names. */
  value: string[]
  onChange: (value: string[]) => void
}

/**
 * Multi-select of technologies rendered as toggleable chips. A technology that
 * does not exist yet can be created inline (persisted to the catalogue) and is
 * selected automatically; a failed creation is reported and the typed name is
 * kept so it can be retried.
 */
export const TechnologyPicker = ({
  value,
  onChange,
}: TechnologyPickerProps) => {
  const { t } = useTranslation()
  const { data: technologies = [] } = useGetTechnologiesQuery()
  const [createTechnology, { isLoading }] = useCreateTechnologyMutation()
  const [newName, setNewName] = useState('')
  const [error, setError] = useState<unknown>(null)

  const toggle = (name: string) =>
    onChange(
      value.includes(name)
        ? value.filter((item) => item !== name)
        : [...value, name],
    )

  const resolveName = async (name: string): Promise<string> => {
    const existing = technologies.find(
      (tech) => tech.name.toLowerCase() === name.toLowerCase(),
    )
    if (existing) return existing.name
    const created = await createTechnology({
      name,
      icon: name.toLowerCase(),
      category: 'other',
    }).unwrap()
    return created.name
  }

  const addTechnology = async () => {
    const name = newName.trim()
    if (!name) return
    setError(null)
    try {
      const resolved = await resolveName(name)
      if (!value.includes(resolved)) onChange([...value, resolved])
      setNewName('')
    } catch (caught) {
      setError(caught)
    }
  }

  return (
    <div className="sm:col-span-2">
      <span className="mb-1.5 block text-sm font-medium text-heading">
        {t('admin.form.technologies')}
      </span>
      <div className="flex flex-wrap gap-2">
        {technologies.map((tech) => (
          <ChipButton
            key={tech.id}
            selected={value.includes(tech.name)}
            onClick={() => toggle(tech.name)}
          >
            {tech.name}
          </ChipButton>
        ))}
        {technologies.length === 0 && (
          <p className="text-sm text-muted">{t('admin.form.noTechnologies')}</p>
        )}
      </div>
      <InlineAddField
        label={t('admin.form.addTechnology')}
        placeholder={t('admin.form.addTechnologyPlaceholder')}
        value={newName}
        onChange={setNewName}
        onAdd={() => void addTechnology()}
        isPending={isLoading}
      />
      <AdminErrorAlert
        title={t('admin.errors.createTechnologyFailed')}
        error={error}
        className="mt-3"
      />
    </div>
  )
}
