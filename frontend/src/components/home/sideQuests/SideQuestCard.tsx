import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { AreaArt } from '@/components/projects/AreaArt'
import { AreaChips } from '@/components/projects/AreaChips'
import { Tag } from '@/components/ui/Tag'
import { useLanguage } from '@/hooks/useLanguage'
import type { ProjectSummary } from '@/types'
import { safeExternalUrl, safeMediaUrl } from '@/utils/safeUrl'

/** Technologies that fit on the card; the project page lists them all. */
const TECH_SHOWN = 5

interface SideQuestCardProps {
  project: ProjectSummary
  /** "SQ: 01/02": the project's place among the published ones. */
  number: string
  /** Only the top card of the deck takes focus. */
  interactive: boolean
}

/** A project as a card of the side quests deck. */
export const SideQuestCard = ({
  project,
  number,
  interactive,
}: SideQuestCardProps) => {
  const { t } = useTranslation()
  const { localize } = useLanguage()
  const cover = safeMediaUrl(project.cover?.src)
  const github = safeExternalUrl(project.repo_url)
  const tabIndex = interactive ? undefined : -1

  return (
    <div className="flex h-full flex-col gap-2.5 overflow-hidden rounded-[17px] bg-surface p-4">
      <div className="flex shrink-0 items-start justify-between gap-2">
        <AreaChips areas={project.areas} />
        <span className="shrink-0 pt-1 font-display text-[13px] font-bold tracking-[0.08em] text-muted">
          {number}
        </span>
      </div>
      <h3 className="line-clamp-2 shrink-0 text-[26px] font-extrabold uppercase leading-none text-heading lg:text-[30px]">
        {localize(project.title)}
      </h3>
      <div className="h-[120px] shrink-0 overflow-hidden rounded-xl border border-edge bg-background lg:h-[150px]">
        {cover && project.cover ? (
          <img
            src={cover}
            alt={localize(project.cover.alt)}
            draggable={false}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <AreaArt area={project.areas[0]} />
        )}
      </div>
      <p className="line-clamp-3 shrink-0 text-sm leading-relaxed text-body">
        {localize(project.description)}
      </p>
      <div className="flex shrink-0 flex-wrap gap-1.5">
        {project.technologies.slice(0, TECH_SHOWN).map((tech) => (
          <Tag key={tech} label={tech} />
        ))}
      </div>
      <div className="mt-auto flex shrink-0 items-center justify-between gap-3">
        <Link
          to={`/projects/${project.slug}`}
          tabIndex={tabIndex}
          draggable={false}
          className="flex min-h-11 items-center font-display text-base font-bold uppercase tracking-wider text-highlight hover:text-heading"
        >
          {t('home.sideQuests.open')} →
        </Link>
        {github && (
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={tabIndex}
            draggable={false}
            aria-label={t('home.sideQuests.code')}
            className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-edge text-body transition-colors hover:border-highlight hover:text-highlight"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-5 w-5"
            >
              <path d="m8 8-4 4 4 4" />
              <path d="m16 8 4 4-4 4" />
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}
