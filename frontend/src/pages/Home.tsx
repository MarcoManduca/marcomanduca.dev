import { useTranslation } from 'react-i18next'

import { Hero } from '@/components/home/Hero'
import { PreviewSection } from '@/components/home/PreviewSection'
import { ArticleCard } from '@/components/learning/ArticleCard'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { Seo } from '@/components/seo/Seo'
import { useGetArticlesQuery } from '@/services/learningApi'
import { useGetProjectsQuery } from '@/services/projectsApi'

const PREVIEW_COUNT = 2

export const Home = () => {
  const { t } = useTranslation()
  const { data: projects } = useGetProjectsQuery()
  const { data: articles } = useGetArticlesQuery()

  const latestProjects = projects?.slice(0, PREVIEW_COUNT) ?? []
  const latestArticles = articles?.slice(0, PREVIEW_COUNT) ?? []

  return (
    <>
      <Seo description={t('home.heroTagline')} />
      <Hero />
      {latestProjects.length > 0 && (
        <PreviewSection title={t('home.latestProjects')} viewAllTo="/projects">
          {latestProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </PreviewSection>
      )}
      {latestArticles.length > 0 && (
        <PreviewSection title={t('home.latestArticles')} viewAllTo="/learning">
          {latestArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </PreviewSection>
      )}
    </>
  )
}
