import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useLanguage } from '@/hooks/useLanguage'
import {
  useGetArticleVersionsQuery,
  useRollbackArticleMutation,
} from '@/services/learningApi'
import { formatDate } from '@/utils/formatDate'

interface VersionsListProps {
  slug: string
  currentVersion: number
}

export const VersionsList = ({ slug, currentVersion }: VersionsListProps) => {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { data: versions, isLoading } = useGetArticleVersionsQuery(slug)
  const [rollbackArticle, { isLoading: isRollingBack }] =
    useRollbackArticleMutation()

  if (isLoading) return <Spinner />

  return (
    <ul className="space-y-2">
      {versions?.map(({ version, updated_at }) => (
        <li
          key={version}
          className="flex items-center justify-between rounded-lg border border-edge px-4 py-2 text-sm"
        >
          <span className="text-heading">
            {t('admin.learning.versionLabel', { version })}
            <span className="ml-3 text-xs text-muted">
              {formatDate(updated_at, language)}
            </span>
          </span>
          {version !== currentVersion && (
            <Button
              variant="secondary"
              disabled={isRollingBack}
              onClick={() => void rollbackArticle({ slug, version })}
            >
              {t('admin.learning.rollback')}
            </Button>
          )}
        </li>
      ))}
    </ul>
  )
}
