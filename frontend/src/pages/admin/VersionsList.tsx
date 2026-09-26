import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { AdminErrorAlert } from '@/components/admin/AdminErrorAlert'
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
  const [error, setError] = useState<unknown>(null)

  const rollback = async (version: number) => {
    setError(null)
    try {
      await rollbackArticle({ slug, version }).unwrap()
    } catch (caught) {
      setError(caught)
    }
  }

  if (isLoading) return <Spinner />

  return (
    <>
      <AdminErrorAlert
        title={t('admin.errors.rollbackFailed')}
        error={error}
        className="mb-3"
      />
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
                aria-label={t('admin.learning.rollbackTo', { version })}
                onClick={() => void rollback(version)}
              >
                {t('admin.learning.rollback')}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}
