import { useTranslation } from 'react-i18next'

import { Card } from '@/components/ui/Card'
import { useLanguage } from '@/hooks/useLanguage'
import { useGetCvQuery } from '@/services/cvApi'
import { useGetArticlesQuery } from '@/services/learningApi'
import { useGetProjectsQuery } from '@/services/projectsApi'
import { useGetTechnologiesQuery } from '@/services/technologiesApi'

export const AdminDashboard = () => {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { data: projects } = useGetProjectsQuery()
  const { data: articles } = useGetArticlesQuery()
  const { data: technologies } = useGetTechnologiesQuery()
  const { data: cv } = useGetCvQuery(language)

  const counts = [
    { key: 'admin.dashboard.projects', value: projects?.length },
    { key: 'admin.dashboard.articles', value: articles?.length },
    { key: 'admin.dashboard.technologies', value: technologies?.length },
    {
      key: 'admin.dashboard.cvSections',
      value: cv ? Object.keys(cv.sections).length : undefined,
    },
  ]

  return (
    <>
      <h1 className="text-2xl font-bold text-heading">
        {t('admin.dashboard.title')}
      </h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {counts.map(({ key, value }) => (
          <Card key={key}>
            <p className="text-sm text-muted">{t(key)}</p>
            <p className="mt-2 font-mono text-3xl font-bold text-accent-hover">
              {value ?? '—'}
            </p>
          </Card>
        ))}
      </div>
    </>
  )
}
