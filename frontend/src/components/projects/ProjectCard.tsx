import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { useLanguage } from '@/hooks/useLanguage'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const { t } = useTranslation()
  const { localize } = useLanguage()

  return (
    <Card className="flex h-full flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-heading">
          <Link
            to={`/projects/${project.slug}`}
            className="hover:text-accent-hover"
          >
            {localize(project.title)}
          </Link>
        </h3>
        <Badge>{t(`projectCategories.${project.category}`)}</Badge>
      </div>
      <p className="flex-1 text-sm text-body">
        {localize(project.description)}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {project.technologies.map((tech) => (
          <Tag key={tech} label={tech} />
        ))}
      </div>
    </Card>
  )
}
