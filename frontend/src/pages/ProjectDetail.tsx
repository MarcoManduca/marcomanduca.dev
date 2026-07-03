import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer'
import { Seo } from '@/components/seo/Seo'
import { Badge } from '@/components/ui/Badge'
import { Prose } from '@/components/ui/Prose'
import { Spinner } from '@/components/ui/Spinner'
import { Tag } from '@/components/ui/Tag'
import { useLanguage } from '@/hooks/useLanguage'
import { useGetProjectBySlugQuery } from '@/services/projectsApi'
import { safeExternalUrl } from '@/utils/safeUrl'

import { NotFound } from './NotFound'

export const ProjectDetail = () => {
  const { t } = useTranslation()
  const { localize } = useLanguage()
  const { slug = '' } = useParams()
  const { data: project, isLoading, isError } = useGetProjectBySlugQuery(slug)

  if (isLoading) return <Spinner />
  if (isError || !project) return <NotFound />

  const githubUrl = safeExternalUrl(project.github_url)
  const demoUrl = safeExternalUrl(project.demo_url)

  return (
    <article>
      <Seo
        title={localize(project.title)}
        description={localize(project.description)}
        type="article"
        image={project.images[0]}
      />
      <Link
        to="/projects"
        className="text-sm text-accent hover:text-accent-hover"
      >
        ← {t('projects.backToProjects')}
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold text-heading">
          {localize(project.title)}
        </h1>
        <Badge>{t(`projectCategories.${project.category}`)}</Badge>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.technologies.map((tech) => (
          <Tag key={tech} label={tech} />
        ))}
      </div>
      <div className="mt-4 flex gap-4 text-sm">
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:text-accent-hover"
          >
            {t('projects.github')} ↗
          </a>
        )}
        {demoUrl && (
          <a
            href={demoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:text-accent-hover"
          >
            {t('projects.demo')} ↗
          </a>
        )}
      </div>
      <Prose className="mt-8">
        <MarkdownRenderer content={localize(project.content_markdown)} />
      </Prose>
      {project.images.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold text-heading">
            {t('projects.gallery')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {project.images.map((src) => (
              <img
                key={src}
                src={src}
                alt={localize(project.title)}
                loading="lazy"
                className="rounded-lg border border-edge"
              />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
