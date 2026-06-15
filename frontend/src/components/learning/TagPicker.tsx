import { useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useGetArticlesQuery } from '@/services/learningApi'
import { cn } from '@/utils/cn'

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

  const toggle = (tag: string) =>
    onChange(
      value.includes(tag)
        ? value.filter((item) => item !== tag)
        : [...value, tag],
    )

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
          <button
            key={tag}
            type="button"
            aria-pressed={value.includes(tag)}
            onClick={() => toggle(tag)}
            className={cn(
              'rounded-full border px-3 py-1 text-sm transition-colors',
              value.includes(tag)
                ? 'border-accent bg-accent text-background'
                : 'border-edge text-body hover:border-accent hover:text-heading',
            )}
          >
            {tag}
          </button>
        ))}
        {catalogue.length === 0 && (
          <p className="text-sm text-muted">{t('admin.form.noTags')}</p>
        )}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <Input
          label={t('admin.form.addTag')}
          value={newTag}
          onChange={(event) => setNewTag(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              addTag()
            }
          }}
          placeholder={t('admin.form.addTagPlaceholder')}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={!newTag.trim()}
          onClick={addTag}
        >
          {t('admin.actions.add')}
        </Button>
      </div>
    </div>
  )
}
