import type { Project } from '@/types'
import type { Heading } from '@/utils/markdownHeadings'

import { ProjectResources } from './ProjectResources'
import { ProjectStack } from './ProjectStack'
import { ProjectToc } from './ProjectToc'
import { ProjectTopics } from './ProjectTopics'
import { QuestOrigin } from './QuestOrigin'

interface ProjectAsideProps {
  project: Project
  headings: Heading[]
}

/** Side column: contents, stack, topics, resources and the quest of origin. */
export const ProjectAside = ({ project, headings }: ProjectAsideProps) => (
  <aside className="flex flex-col gap-4">
    <ProjectToc
      headings={headings}
      hasLab={project.lab !== null}
      hasGallery={project.media.length > 0}
    />
    <ProjectStack technologies={project.technologies} />
    <ProjectTopics topics={project.topics} />
    <ProjectResources links={project.links} />
    <QuestOrigin anchor={project.quest} />
  </aside>
)
