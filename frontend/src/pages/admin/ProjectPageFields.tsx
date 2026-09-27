import { useTranslation } from 'react-i18next'

import { BilingualFields } from '@/components/admin/BilingualFields'
import { FormSection } from '@/components/admin/FormSection'
import { JsonField } from '@/components/admin/JsonField'
import { Input } from '@/components/ui/Input'
import type { Project } from '@/types'

import { ProjectBriefFields } from './ProjectBriefFields'
import { ProjectLinksFields } from './ProjectLinksFields'

interface ProjectPageFieldsProps {
  initial: Project | null
}

/** What only the project page shows: brief, body, gallery and links. */
export const ProjectPageFields = ({ initial }: ProjectPageFieldsProps) => {
  const { t } = useTranslation()
  const listHint = t('admin.form.jsonListHint')

  return (
    <FormSection legend={t('admin.form.pageSection')}>
      <ProjectBriefFields brief={initial?.brief} />
      <BilingualFields
        name="content"
        rows={8}
        defaultValue={initial?.content_markdown}
      />
      <JsonField name="topics" value={initial?.topics ?? []} hint={listHint} />
      <JsonField name="media" value={initial?.media ?? []} hint={listHint} />
      <ProjectLinksFields links={initial?.links ?? []} />
      <Input
        label={t('admin.form.license')}
        name="license"
        required
        defaultValue={initial?.license ?? ''}
      />
      <Input
        label={t('admin.form.quest')}
        name="quest"
        defaultValue={initial?.quest ?? ''}
      />
    </FormSection>
  )
}
