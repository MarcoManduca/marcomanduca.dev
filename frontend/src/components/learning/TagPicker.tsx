import { useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { ChipButton } from '@/components/admin/ChipButton'
import { InlineAddField } from '@/components/admin/InlineAddField'
import { useGetArticlesQuery } from '@/services/learningApi'
import { toggleItem } from '@/utils/toggleItem'

interface TagPickerProps {
  /** Selected tags. */
  value: string[]
  onChange: (value: string[]) => void
}

/**
 * Multi-select of tags rendered as toggleable chips. The catalogue is the set
 * of tags already used across existing articles; a brand-new tag can be typed
 * in and is persisted when the article itself is saved (tags are free-form,
 * with no dedicated table).
 */
export const TagPicker = ({ value, onChange }: TagPickerProps) => {
  const { t } = useTranslation()
  const { data: articles = [] } = useGetArticlesQuery()
  const [newTag, setNewTag] = useState('')

  const catalogue = useMemo(() => {
    const tags = new Set<string>(value)
    articles.forEach((article) => article.tags.forEach((tag) => tags.add(tag)))
    return [...tags].sort((a, b) => a.localeCompare(b))
  }, [articles, value])

  const addTag = () => {
    const tag = newTag.trim()
    if (tag && !value.includes(tag)) onChange([...value, tag])
    setNewTag('')
  }

  return (
    <div className="sm:col-span-2">
      <span className="mb-1.5 block text-sm font-medium text-heading">
        {t('admin.form.tags')}
      </span>
      <div className="flex flex-wrap gap-2">
        {catalogue.map((tag) => (
          <ChipButton
            key={tag}
            selected={value.includes(tag)}
            onClick={() => onChange(toggleItem(value, tag))}
          >
            {tag}
          </ChipButton>
        ))}
        {catalogue.length === 0 && (
          <p className="text-sm text-muted">{t('admin.form.noTags')}</p>
        )}
      </div>
      <InlineAddField
        label={t('admin.form.addTag')}
        placeholder={t('admin.form.addTagPlaceholder')}
        value={newTag}
        onChange={setNewTag}
        onAdd={addTag}
      />
    </div>
  )
}
