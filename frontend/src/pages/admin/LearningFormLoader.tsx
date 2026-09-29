import { useTranslation } from 'react-i18next'

import { Spinner } from '@/components/ui/Spinner'
import { useGetArticleBySlugQuery } from '@/services/learningApi'

import { LearningForm, type LearningFormProps } from './LearningForm'

interface LearningFormLoaderProps extends Omit<LearningFormProps, 'initial'> {
  slug: string
}

/**
 * The edit form, once the full article behind a list row has loaded. The
 * form is keyed by the loaded version: after a rollback the article is
 * refetched and the form reloads with the restored content, so a later save
 * cannot silently overwrite the rollback with the old text.
 */
export const LearningFormLoader = ({
  slug,
  ...formProps
}: LearningFormLoaderProps) => {
  const { t } = useTranslation()
  const { data, isError } = useGetArticleBySlugQuery(slug)

  if (isError) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('common.error')}
      </p>
    )
  }
  if (!data) return <Spinner />
  return (
    <LearningForm
      key={`${data.slug}:${data.version}`}
      initial={data}
      {...formProps}
    />
  )
}
