import { useTranslation } from 'react-i18next'

import type { AchievementId } from '@/types'
import { EXPLORER_GOAL, HIDDEN_ACHIEVEMENTS } from '@/utils/achievements'
import { cn } from '@/utils/cn'

interface FigurineTileProps {
  id: AchievementId
  unlocked: boolean
  /** Distinct projects opened so far, shown on the explorer tile. */
  progress: number
}

export const FigurineTile = ({ id, unlocked, progress }: FigurineTileProps) => {
  const { t } = useTranslation()
  const hidden = !unlocked && HIDDEN_ACHIEVEMENTS.includes(id)
  const name = hidden ? t('game.hiddenName') : t(`game.achievements.${id}.name`)
  const showProgress = id === 'explorer' && !unlocked

  return (
    <li
      className={cn(
        'flex min-h-20 flex-col justify-center gap-0.5 rounded-xl px-3 py-2 text-center',
        unlocked
          ? 'bg-gradient-to-br from-brand-yellow to-brand-orange text-brand-ink'
          : 'border-2 border-dashed border-edge text-muted',
      )}
    >
      <span className="font-display text-base font-bold uppercase leading-tight tracking-wide">
        {name}
        {showProgress &&
          ` ${Math.min(progress, EXPLORER_GOAL)}/${EXPLORER_GOAL}`}
      </span>
      <span className={cn('text-xs', unlocked ? 'opacity-80' : 'text-muted')}>
        {t(`game.achievements.${id}.hint`, { goal: EXPLORER_GOAL })}
      </span>
      <span className="sr-only">
        {t(unlocked ? 'game.unlocked' : 'game.locked')}
      </span>
    </li>
  )
}
