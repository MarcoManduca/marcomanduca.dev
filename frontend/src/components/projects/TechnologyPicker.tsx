import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  useCreateTechnologyMutation,
  useGetTechnologiesQuery,
} from '@/services/technologiesApi'
import { cn } from '@/utils/cn'

interface TechnologyPickerProps {
  /** Selected technology names. */
  value: string[]
  onChange: (value: string[]) => void
}

/**
 * Multi-select of technologies rendered as toggleable chips. A technology that
 * does not exist yet can be created inline (persisted to the catalogue) and is
 * selected automatically.
 */
export const TechnologyPicker = ({
  value,
  onChange,
}: TechnologyPickerProps) => {
  const { t } = useTranslation()
  const { data: technologies = [] } = useGetTechnologiesQuery()
  const [createTechnology, { isLoading }] = useCreateTechnologyMutation()
  const [newName, setNewName] = useState('')

  const toggle = (name: string) =>
    onChange(
      value.includes(name)
        ? value.filter((item) => item !== name)
        : [...value, name],
    )

  const addTechnology = async () => {
    const name = newName.trim()
    if (!name) return
    const existing = technologies.find(
      (tech) => tech.name.toLowerCase() === name.toLowerCase(),
    )
    if (existing) {
      if (!value.includes(existing.name)) onChange([...value, existing.name])
    } else {
      const created = await createTechnology({
        name,
        icon: name.toLowerCase(),
        category: 'other',
      }).unwrap()
      onChange([...value, created.name])
    }
    setNewName('')
  }

  return (
    <div className="sm:col-span-2">
      <span className="mb-1.5 block text-sm font-medium text-heading">
        {t('admin.form.technologies')}
      </span>
      <div className="flex flex-wrap gap-2">
        {technologies.map((tech) => (
          <button
            key={tech.id}
            type="button"
            aria-pressed={value.includes(tech.name)}
            onClick={() => toggle(tech.name)}
            className={cn(
              'rounded-full border px-3 py-1 text-sm transition-colors',
              value.includes(tech.name)
                ? 'border-accent bg-accent text-white'
                : 'border-edge text-body hover:border-accent hover:text-heading',
            )}
          >
            {tech.name}
          </button>
        ))}
        {technologies.length === 0 && (
          <p className="text-sm text-muted">{t('admin.form.noTechnologies')}</p>
        )}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <Input
          label={t('admin.form.addTechnology')}
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              void addTechnology()
            }
          }}
          placeholder={t('admin.form.addTechnologyPlaceholder')}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={isLoading || !newName.trim()}
          onClick={() => void addTechnology()}
        >
          {t('admin.actions.add')}
        </Button>
      </div>
    </div>
  )
}
