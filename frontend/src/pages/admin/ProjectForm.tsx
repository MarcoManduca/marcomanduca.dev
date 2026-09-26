import type { FormEvent } from 'react'
import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { BilingualFields } from '@/components/admin/BilingualFields'
import { FormActions } from '@/components/admin/FormActions'
import { readBilingual } from '@/components/admin/readBilingual'
import { StatusSelect } from '@/components/admin/StatusSelect'
import { TechnologyPicker } from '@/components/projects/TechnologyPicker'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { Project, ProjectInput, ProjectStatus } from '@/types'
import { PROJECT_CATEGORIES } from '@/types'
import { parseLines } from '@/utils/parseList'

import { ProjectLinksFields } from './ProjectLinksFields'

interface ProjectFormProps {
  initial: Project | null
  isSaving: boolean
  onSubmit: (input: ProjectInput) => void
  onCancel: () => void
}

const toInput = (data: FormData, technologies: string[]): ProjectInput => ({
  title: readBilingual(data, 'title'),
  description: readBilingual(data, 'description'),
  content_markdown: readBilingual(data, 'content'),
  category: String(data.get('category')),
  status: String(data.get('status')) as ProjectStatus,
  technologies,
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
  const [technologies, setTechnologies] = useState<string[]>(
    initial?.technologies ?? [],
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(toInput(new FormData(event.currentTarget), technologies))
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
      <BilingualFields name="title" defaultValue={initial?.title} required />
      <BilingualFields
        name="description"
        rows={3}
        defaultValue={initial?.description}
      />
      <BilingualFields
        name="content"
        rows={8}
        defaultValue={initial?.content_markdown}
      />
      <TechnologyPicker value={technologies} onChange={setTechnologies} />
      <StatusSelect defaultValue={initial?.status} />
      <ProjectLinksFields initial={initial} />
      <FormActions isSaving={isSaving} onCancel={onCancel} />
    </form>
  )
}
