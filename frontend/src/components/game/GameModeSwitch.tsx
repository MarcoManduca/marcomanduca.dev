import { useTranslation } from 'react-i18next'

import { toggleGameMode } from '@/store/gameSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { cn } from '@/utils/cn'

/** Shows or hides the gamified UI (collection, figurines, unlock toasts). */
export const GameModeSwitch = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const gameMode = useAppSelector((state) => state.game.gameMode)

  return (
    <button
      type="button"
      role="switch"
      aria-checked={gameMode}
      onClick={() => dispatch(toggleGameMode())}
      className={cn(
        'h-10 rounded-lg border-2 px-3 font-display text-sm font-bold uppercase tracking-wider transition-colors',
        gameMode
          ? 'border-highlight text-highlight hover:bg-highlight/10'
          : 'border-edge text-muted hover:text-heading',
      )}
    >
      {t('game.mode')}
    </button>
  )
}
