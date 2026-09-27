import { Link } from 'react-router'

import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Tag } from '@/components/ui/Tag'
import { useLanguage } from '@/hooks/useLanguage'
import type { ProjectSummary } from '@/types'

import { AreaChips } from './AreaChips'

interface ProjectCardProps {
  project: ProjectSummary
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const { localize } = useLanguage()

  return (
    <Card className="flex h-full flex-col gap-3">
      <AreaChips areas={project.areas} />
      {/* Only a signed-in admin is served unpublished projects: flag them. */}
      {project.status !== 'published' && (
        <StatusBadge status={project.status} className="self-start" />
      )}
      <h3 className="text-lg font-semibold text-heading">
        <Link
          to={`/projects/${project.slug}`}
          className="hover:text-accent-hover"
        >
          {localize(project.title)}
        </Link>
      </h3>
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
