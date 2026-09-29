import { useTranslation } from 'react-i18next'

import { useCollection } from '@/hooks/useCollection'
import { ACHIEVEMENT_IDS } from '@/types'

import { FigurineTile } from './FigurineTile'

/** The collection: figurines unlocked by exploring the site. */
export const FigurineShelf = () => {
  const { t } = useTranslation()
  const { unlocked, count, total } = useCollection()

  return (
    <section aria-labelledby="collection-title" className="flex flex-col gap-4">
      <div className="flex items-baseline gap-3">
        <h2
          id="collection-title"
          className="text-2xl font-extrabold uppercase text-heading"
        >
          {t('game.collection')}
        </h2>
        <span className="font-display text-lg font-bold text-highlight">
          {count}/{total}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {ACHIEVEMENT_IDS.map((id) => (
          <FigurineTile key={id} id={id} unlocked={unlocked.includes(id)} />
        ))}
      </ul>
    </section>
  )
}
