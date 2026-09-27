import { useTranslation } from 'react-i18next'

import type { AchievementId } from '@/types'
import { ACHIEVEMENT_GOALS } from '@/utils/achievements'
import { cn } from '@/utils/cn'

interface FigurineTileProps {
  id: AchievementId
  unlocked: boolean
  /** Count reached so far, for a figurine earned with a goal. */
  progress?: number
}

export const FigurineTile = ({ id, unlocked, progress }: FigurineTileProps) => {
  const { t } = useTranslation()
  const goal = ACHIEVEMENT_GOALS[id]
  const showProgress = goal !== undefined && progress !== undefined && !unlocked

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
        {t(`game.achievements.${id}.name`)}
        {showProgress && ` ${Math.min(progress, goal)}/${goal}`}
      </span>
      <span className={cn('text-xs', unlocked ? 'opacity-80' : 'text-muted')}>
        {t(`game.achievements.${id}.hint`, { goal })}
      </span>
      <span className="sr-only">
        {t(unlocked ? 'game.unlocked' : 'game.locked')}
      </span>
    </li>
  )
}
