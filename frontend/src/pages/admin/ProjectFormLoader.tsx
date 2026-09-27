import { useTranslation } from 'react-i18next'

import { Spinner } from '@/components/ui/Spinner'
import { useGetProjectBySlugQuery } from '@/services/projectsApi'

import { ProjectForm, type ProjectFormProps } from './ProjectForm'

interface ProjectFormLoaderProps extends Omit<ProjectFormProps, 'initial'> {
  slug: string
}

/** The edit form, once the full project behind a list card has loaded. */
export const ProjectFormLoader = ({
  slug,
  ...formProps
}: ProjectFormLoaderProps) => {
  const { t } = useTranslation()
  const { data, isError } = useGetProjectBySlugQuery(slug)

  if (isError) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('common.error')}
      </p>
    )
  }
  if (!data) return <Spinner />
  return <ProjectForm initial={data} {...formProps} />
}
