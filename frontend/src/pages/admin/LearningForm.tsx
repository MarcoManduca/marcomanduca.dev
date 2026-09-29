import type { FormEvent } from 'react'
import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { BilingualFields } from '@/components/admin/BilingualFields'
import { FormActions } from '@/components/admin/FormActions'
import { readBilingual } from '@/components/admin/readBilingual'
import { StatusSelect } from '@/components/admin/StatusSelect'
import { TagPicker } from '@/components/learning/TagPicker'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type {
  ArticleStatus,
  LearningArticle,
  LearningArticleInput,
  LearningCategory,
} from '@/types'
import { LEARNING_CATEGORIES } from '@/types'

export interface LearningFormProps {
  initial: LearningArticle | null
  isSaving: boolean
  onSubmit: (input: LearningArticleInput) => void
  onCancel: () => void
  /** Called on every edit, to guard unsaved changes. */
  onDirty?: () => void
}

const toInput = (data: FormData, tags: string[]): LearningArticleInput => ({
  title: readBilingual(data, 'title'),
  content_markdown: readBilingual(data, 'content'),
  category: String(data.get('category')) as LearningCategory,
  status: String(data.get('status')) as ArticleStatus,
  tags,
})

export const LearningForm = ({
  initial,
  isSaving,
  onSubmit,
  onCancel,
  onDirty,
}: LearningFormProps) => {
  const { t } = useTranslation()
  const [tags, setTags] = useState<string[]>(initial?.tags ?? [])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(toInput(new FormData(event.currentTarget), tags))
  }

  return (
    <form
      onSubmit={handleSubmit}
      onInput={onDirty}
      className="grid gap-4 sm:grid-cols-2"
    >
      {initial && (
        <Input
          label={t('admin.form.slug')}
          name="slug"
          defaultValue={initial.slug}
          disabled
        />
      )}
      <Select
        label={t('admin.form.category')}
        name="category"
        defaultValue={initial?.category}
        options={LEARNING_CATEGORIES.map((value) => ({
          value,
          label: t(`learningCategories.${value}`),
        }))}
      />
      <BilingualFields name="title" defaultValue={initial?.title} required />
      <BilingualFields
        name="content"
        rows={10}
        defaultValue={initial?.content_markdown}
      />
      <TagPicker
        value={tags}
        onChange={(next) => {
          setTags(next)
          onDirty?.()
        }}
      />
      <StatusSelect defaultValue={initial?.status} />
      <FormActions isSaving={isSaving} onCancel={onCancel} />
    </form>
  )
}
