import { useTranslation } from 'react-i18next'

import { AdminErrorAlert } from '@/components/admin/AdminErrorAlert'
import { ChipButton } from '@/components/admin/ChipButton'
import { InlineAddField } from '@/components/admin/InlineAddField'
import { useAddTechnology } from '@/hooks/useAddTechnology'
import { toggleItem } from '@/utils/toggleItem'

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
  const { technologies, name, setName, add, isAdding, error } =
    useAddTechnology((added) => {
      if (!value.includes(added)) onChange([...value, added])
    })

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
            onClick={() => onChange(toggleItem(value, tech.name))}
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
        value={name}
        onChange={setName}
        onAdd={() => void add()}
        isPending={isAdding}
      />
      <AdminErrorAlert
        title={t('admin.errors.createTechnologyFailed')}
        error={error}
        className="mt-3"
      />
    </div>
  )
}
