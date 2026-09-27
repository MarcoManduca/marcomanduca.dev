import { useId } from 'react'

import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { areaStyle } from '@/components/projects/areaStyles'
import { Spinner } from '@/components/ui/Spinner'
import { useLanguage } from '@/hooks/useLanguage'
import { useSideQuests } from '@/hooks/useSideQuests'
import { twoDigits } from '@/utils/twoDigits'

import { NextSideQuestCard } from './NextSideQuestCard'
import { SideQuestCard } from './SideQuestCard'
import { DECK_HEIGHT, SideQuestDeck, type DeckItem } from './SideQuestDeck'

/** Frame of the face-down card that closes the deck. */
const NEXT_CARD_FRAME = 'from-edge via-surface to-edge'

/**
 * Home "Side Quests": the published projects as a deck to flip through,
 * closed by a face-down card that asks for the next one.
 */
export const SideQuestsSection = () => {
  const { t } = useTranslation()
  const { localize } = useLanguage()
  const { projects, isLoading } = useSideQuests()
  const hintId = useId()
  const total = twoDigits(projects.length)

  const items: DeckItem[] = [
    ...projects.map((project, index) => ({
      key: project.slug,
      title: localize(project.title),
      frame: areaStyle(project.areas[0]).frame,
      render: (interactive: boolean) => (
        <SideQuestCard
          project={project}
          number={t('home.sideQuests.number', {
            index: twoDigits(index + 1),
            total,
          })}
          interactive={interactive}
        />
      ),
    })),
    {
      key: 'next',
      title: t('home.sideQuests.next.title'),
      frame: NEXT_CARD_FRAME,
      render: (interactive: boolean) => (
        <NextSideQuestCard interactive={interactive} />
      ),
    },
  ]
  const flippable = items.length > 1

  return (
    <section
      aria-labelledby="side-quests-title"
      className="flex min-w-0 flex-col gap-4"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="side-quests-title"
          className="text-2xl font-extrabold uppercase text-heading sm:text-[28px]"
        >
          {t('home.sideQuests.title')}
        </h2>
        <Link
          to="/projects"
          className="font-display text-[15px] font-bold uppercase tracking-wider text-highlight hover:text-heading sm:text-base"
        >
          {t('home.sideQuests.all')} →
        </Link>
      </div>
      {isLoading ? (
        <Spinner className={DECK_HEIGHT} />
      ) : (
        <SideQuestDeck
          items={items}
          labelledBy="side-quests-title"
          describedBy={flippable ? hintId : undefined}
        />
      )}
      {!isLoading && flippable && (
        <p
          id={hintId}
          className="flex items-center justify-center gap-2 text-[13px] text-muted"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-[18px] w-[18px]"
          >
            <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M3 12h18" />
          </svg>
          {t('home.sideQuests.hint')}
          <span className="sr-only">{t('home.sideQuests.hintKeys')}</span>
        </p>
      )}
    </section>
  )
}
