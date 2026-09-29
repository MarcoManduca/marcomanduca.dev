import { useTranslation } from 'react-i18next'

import { FormSection } from '@/components/admin/FormSection'
import { JsonField } from '@/components/admin/JsonField'
import type { Project } from '@/types'

interface ProjectLabFieldsProps {
  lab: Project['lab'] | null
}

/** The optional interactive lab of a project, edited as JSON. */
export const ProjectLabFields = ({ lab }: ProjectLabFieldsProps) => {
  const { t } = useTranslation()

  return (
    <FormSection legend={t('admin.form.labSection')}>
      <JsonField
        name="lab"
        value={lab}
        hint={t('admin.form.labHint')}
        rows={6}
      />
    </FormSection>
  )
}
