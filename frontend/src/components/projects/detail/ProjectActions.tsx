import { useTranslation } from 'react-i18next'

import { StrokeIcon } from '@/components/ui/StrokeIcon'
import type { Project } from '@/types'
import { cn } from '@/utils/cn'
import { leadLinks } from '@/utils/safeLinks'

import { LINK_ICONS, PLAY_ICON } from './icons'
import { ACTION, LAB_ID, OUTLINE, PRIMARY } from './styles'

/**
 * Links shown as buttons, one fewer beside the lab's, so the row stays on
 * one line; the side column lists them all.
 */
const LEAD_LINKS = 2

interface ProjectActionsProps {
  project: Pick<Project, 'lab' | 'links'>
}

/**
 * The page's calls to action: the lab first when there is one, then the
 * main links. Without a lab the first link takes the lead colour.
 */
export const ProjectActions = ({ project }: ProjectActionsProps) => {
  const { t } = useTranslation()
  const { lab } = project
  const links = leadLinks(project.links, lab ? LEAD_LINKS - 1 : LEAD_LINKS)

  return (
    <div className="flex flex-wrap gap-3">
      {lab && (
        <a href={`#${LAB_ID}`} className={cn(ACTION, PRIMARY)}>
          <StrokeIcon paths={PLAY_ICON} className="h-[18px] w-[18px]" />
          {t(
            lab.model ? 'projects.detail.tryModel' : 'projects.detail.openLab',
          )}
        </a>
      )}
      {links.map((link, index) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(ACTION, !lab && index === 0 ? PRIMARY : OUTLINE)}
        >
          <StrokeIcon
            paths={LINK_ICONS[link.kind]}
            className="h-[18px] w-[18px]"
          />
          {t(`projectLinks.${link.kind}`)} ↗
        </a>
      ))}
    </div>
  )
}
