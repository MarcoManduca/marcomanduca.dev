import type { FormEvent } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import type {
  ArticleStatus,
  LearningArticle,
  LearningArticleInput,
  LearningCategory,
} from '@/types'
import { LEARNING_CATEGORIES, PROJECT_STATUSES } from '@/types'
import { parseCsv } from '@/utils/parseList'

interface LearningFormProps {
  initial: LearningArticle | null
  isSaving: boolean
  onSubmit: (input: LearningArticleInput) => void
  onCancel: () => void
}

const toInput = (data: FormData): LearningArticleInput => ({
  title: { it: String(data.get('titleIt')), en: String(data.get('titleEn')) },
  content_markdown: {
    it: String(data.get('contentIt')),
    en: String(data.get('contentEn')),
  },
  category: String(data.get('category')) as LearningCategory,
  status: String(data.get('status')) as ArticleStatus,
  tags: parseCsv(String(data.get('tags'))),
})

export const LearningForm = ({
  initial,
  isSaving,
  onSubmit,
  onCancel,
}: LearningFormProps) => {
  const { t } = useTranslation()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(toInput(new FormData(event.currentTarget)))
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
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
      <Input
        label={t('admin.form.titleIt')}
        name="titleIt"
        defaultValue={initial?.title.it}
        required
      />
      <Input
        label={t('admin.form.titleEn')}
        name="titleEn"
        defaultValue={initial?.title.en}
        required
      />
      <Textarea
        label={t('admin.form.contentIt')}
        name="contentIt"
        rows={10}
        defaultValue={initial?.content_markdown.it}
      />
      <Textarea
        label={t('admin.form.contentEn')}
        name="contentEn"
        rows={10}
        defaultValue={initial?.content_markdown.en}
      />
      <Input
        label={t('admin.form.tags')}
        name="tags"
        defaultValue={initial?.tags.join(', ')}
      />
      <Select
        label={t('admin.form.status')}
        name="status"
        defaultValue={initial?.status ?? 'draft'}
        options={PROJECT_STATUSES.map((value) => ({
          value,
          label: t(`statuses.${value}`),
        }))}
      />
      <div className="flex gap-3 sm:col-span-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? t('admin.actions.saving') : t('admin.actions.save')}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('admin.actions.cancel')}
        </Button>
      </div>
    </form>
  )
}
