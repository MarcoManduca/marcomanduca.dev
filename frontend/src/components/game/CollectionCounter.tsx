import { useTranslation } from 'react-i18next'

import { useCollection } from '@/hooks/useCollection'

/** "COLLECTION 2/6" badge, visible in game mode only. */
export const CollectionCounter = () => {
  const { t } = useTranslation()
  const { gameMode, count, total } = useCollection()

  if (!gameMode) return null

  return (
    <p
      aria-label={t('game.collectionLabel', { count, total })}
      className="font-display text-base font-bold uppercase tracking-wider text-body"
    >
      {t('game.collection')}{' '}
      <span className="text-highlight">
        {count}/{total}
      </span>
    </p>
  )
}
