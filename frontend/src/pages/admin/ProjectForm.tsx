import type { FormEvent } from 'react'
import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { BilingualFields } from '@/components/admin/BilingualFields'
import { FormActions } from '@/components/admin/FormActions'
import { FormSection } from '@/components/admin/FormSection'
import { JsonField } from '@/components/admin/JsonField'
import { SlugField } from '@/components/admin/SlugField'
import { StatusSelect } from '@/components/admin/StatusSelect'
import { TechnologyPicker } from '@/components/projects/TechnologyPicker'
import type { Project, ProjectInput } from '@/types'

import { ProjectClassificationFields } from './ProjectClassificationFields'
import { ProjectCoverFields } from './ProjectCoverFields'
import { ProjectLabFields } from './ProjectLabFields'
import { InvalidJsonError, toProjectInput } from './projectFormInput'
import { ProjectPageFields } from './ProjectPageFields'

export interface ProjectFormProps {
  initial: Project | null
  isSaving: boolean
  onSubmit: (input: ProjectInput) => void
  onCancel: () => void
  /** Called on every edit, to guard unsaved changes. */
  onDirty?: () => void
}

/** Create / edit form of a project: its card, its page and its lab. */
export const ProjectForm = ({
  initial,
  isSaving,
  onSubmit,
  onCancel,
  onDirty,
}: ProjectFormProps) => {
  const { t } = useTranslation()
  const [technologies, setTechnologies] = useState(initial?.technologies ?? [])
  const [jsonError, setJsonError] = useState<string | null>(null)
  const listHint = t('admin.form.jsonListHint')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const input = toProjectInput(
        new FormData(event.currentTarget),
        technologies,
      )
      setJsonError(null)
      onSubmit(input)
    } catch (error) {
      if (!(error instanceof InvalidJsonError)) throw error
      const field = t(`admin.form.${error.field}`)
      setJsonError(t('admin.form.invalidJson', { field }))
    }
  }

  return (
    <form onSubmit={handleSubmit} onInput={onDirty} className="grid gap-6">
      <FormSection legend={t('admin.form.cardSection')}>
        {initial && (
          <div className="sm:col-span-2">
            <SlugField slug={initial.slug} />
          </div>
        )}
        <ProjectClassificationFields initial={initial} />
        <BilingualFields name="title" defaultValue={initial?.title} required />
        <BilingualFields
          name="description"
          rows={3}
          defaultValue={initial?.description}
        />
        <ProjectCoverFields cover={initial?.cover ?? null} />
        <JsonField
          name="metrics"
          value={initial?.metrics ?? []}
          hint={listHint}
        />
        <TechnologyPicker
          value={technologies}
          onChange={(next) => {
            setTechnologies(next)
            onDirty?.()
          }}
        />
      </FormSection>
      <ProjectPageFields initial={initial} />
      <ProjectLabFields lab={initial?.lab ?? null} />
      <StatusSelect defaultValue={initial?.status} />
      {jsonError && (
        <p role="alert" className="text-sm text-danger">
          {jsonError}
        </p>
      )}
      <FormActions isSaving={isSaving} onCancel={onCancel} />
    </form>
  )
}
