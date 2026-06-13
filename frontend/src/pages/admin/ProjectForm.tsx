import type { FormEvent } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import type { Project, ProjectInput, ProjectStatus } from '@/types'
import { PROJECT_CATEGORIES, PROJECT_STATUSES } from '@/types'
import { parseCsv, parseLines } from '@/utils/parseList'

interface ProjectFormProps {
  initial: Project | null
  isSaving: boolean
  onSubmit: (input: ProjectInput) => void
  onCancel: () => void
}

const toInput = (data: FormData): ProjectInput => ({
  title: { it: String(data.get('titleIt')), en: String(data.get('titleEn')) },
  description: {
    it: String(data.get('descriptionIt')),
    en: String(data.get('descriptionEn')),
  },
  content_markdown: {
    it: String(data.get('contentIt')),
    en: String(data.get('contentEn')),
  },
  category: String(data.get('category')),
  status: String(data.get('status')) as ProjectStatus,
  technologies: parseCsv(String(data.get('technologies'))),
  images: parseLines(String(data.get('images'))),
  github_url: String(data.get('githubUrl')),
  demo_url: String(data.get('demoUrl')) || null,
})

export const ProjectForm = ({
  initial,
  isSaving,
  onSubmit,
  onCancel,
}: ProjectFormProps) => {
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
        options={PROJECT_CATEGORIES.map((value) => ({
          value,
          label: t(`projectCategories.${value}`),
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
        label={t('admin.form.descriptionIt')}
        name="descriptionIt"
        rows={3}
        defaultValue={initial?.description.it}
      />
      <Textarea
        label={t('admin.form.descriptionEn')}
        name="descriptionEn"
        rows={3}
        defaultValue={initial?.description.en}
      />
      <Textarea
        label={t('admin.form.contentIt')}
        name="contentIt"
        rows={8}
        defaultValue={initial?.content_markdown.it}
      />
      <Textarea
        label={t('admin.form.contentEn')}
        name="contentEn"
        rows={8}
        defaultValue={initial?.content_markdown.en}
      />
      <Input
        label={t('admin.form.technologies')}
        name="technologies"
        defaultValue={initial?.technologies.join(', ')}
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
      <Input
        label={t('admin.form.githubUrl')}
        name="githubUrl"
        type="url"
        defaultValue={initial?.github_url ?? ''}
        required
      />
      <Input
        label={t('admin.form.demoUrl')}
        name="demoUrl"
        type="url"
        defaultValue={initial?.demo_url ?? ''}
      />
      <div className="sm:col-span-2">
        <Textarea
          label={t('admin.form.images')}
          name="images"
          rows={3}
          defaultValue={initial?.images.join('\n')}
        />
      </div>
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
