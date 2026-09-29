import { useTranslation } from 'react-i18next'

import { Card } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { useGetArticlesQuery } from '@/services/learningApi'
import { useGetProjectsQuery } from '@/services/projectsApi'
import { useGetTechnologiesQuery } from '@/services/technologiesApi'

export const AdminDashboard = () => {
  const { t } = useTranslation()
  const queries = [
    { key: 'admin.dashboard.projects', query: useGetProjectsQuery() },
    { key: 'admin.dashboard.articles', query: useGetArticlesQuery() },
    { key: 'admin.dashboard.technologies', query: useGetTechnologiesQuery() },
  ]
  const failed = queries.filter(({ query }) => query.isError)

  return (
    <>
      <h1 className="text-2xl font-bold text-heading">
        {t('admin.dashboard.title')}
      </h1>
      {failed.length > 0 && (
        <ErrorState
          onRetry={() => failed.forEach(({ query }) => void query.refetch())}
        />
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {queries.map(({ key, query }) => (
          <Card key={key}>
            <p className="text-sm text-muted">{t(key)}</p>
            <p className="mt-2 font-mono text-3xl font-bold text-accent">
              {query.data?.length ?? '—'}
            </p>
          </Card>
        ))}
      </div>
    </>
  )
}
