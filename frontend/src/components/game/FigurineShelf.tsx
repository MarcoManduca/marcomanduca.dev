import { useTranslation } from 'react-i18next'

import { useCollection } from '@/hooks/useCollection'
import { ACHIEVEMENT_IDS } from '@/types'

import { FigurineTile } from './FigurineTile'

/** The collectible figurines, unlocked by exploring the site. */
export const FigurineShelf = () => {
  const { t } = useTranslation()
  const { gameMode, unlocked, visitedProjects, count, total } = useCollection()

  if (!gameMode) return null

  return (
    <section aria-labelledby="figurines-title" className="flex flex-col gap-4">
      <div className="flex items-baseline gap-3">
        <h2
          id="figurines-title"
          className="text-2xl font-extrabold uppercase text-heading"
        >
          {t('game.figurines')}
        </h2>
        <span className="font-display text-lg font-bold text-highlight">
          {count}/{total}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ACHIEVEMENT_IDS.map((id) => (
          <FigurineTile
            key={id}
            id={id}
            unlocked={unlocked.includes(id)}
            progress={visitedProjects.length}
          />
        ))}
      </ul>
    </section>
  )
}
