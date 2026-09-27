import { useTranslation } from 'react-i18next'

import { StrokeIcon } from '@/components/ui/StrokeIcon'
import type { ProjectLink } from '@/types'
import { safeLinks } from '@/utils/safeLinks'

import { AsidePanel } from './AsidePanel'
import { LINK_ICONS } from './icons'

interface ProjectResourcesProps {
  links: ProjectLink[]
}

/** Repository, report, live site and the other resources of a project. */
export const ProjectResources = ({ links }: ProjectResourcesProps) => {
  const { t } = useTranslation()
  const safe = safeLinks(links)

  if (safe.length === 0) return null

  return (
    <AsidePanel title={t('projects.links')}>
      <ul className="-my-1 flex flex-col">
        {safe.map(({ kind, url }) => (
          <li key={url}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-10 items-center gap-2.5 text-heading hover:text-highlight"
            >
              <StrokeIcon
                paths={LINK_ICONS[kind]}
                className="h-[18px] w-[18px] shrink-0 text-highlight"
              />
              {t(`projectLinks.${kind}`)} ↗
            </a>
          </li>
        ))}
      </ul>
    </AsidePanel>
  )
}
