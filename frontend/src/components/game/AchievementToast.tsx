import { useEffect } from 'react'

import { useTranslation } from 'react-i18next'

import { dismissUnlock } from '@/store/gameSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

const TOAST_DURATION_MS = 5000

/** Announces a newly unlocked figurine, then fades out on its own. */
export const AchievementToast = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const lastUnlocked = useAppSelector((state) => state.game.lastUnlocked)
  const visible = lastUnlocked !== null

  useEffect(() => {
    if (!visible) return
    const timer = window.setTimeout(
      () => dispatch(dismissUnlock()),
      TOAST_DURATION_MS,
    )
    return () => window.clearTimeout(timer)
  }, [dispatch, visible, lastUnlocked])

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:inset-x-auto sm:right-6"
    >
      {visible && (
        <div className="pointer-events-auto flex items-center gap-3 rounded-xl bg-gradient-to-br from-brand-yellow to-brand-orange py-2 pl-4 pr-2 text-brand-ink shadow-xl motion-safe:animate-fade-in-up">
          <span className="font-display text-lg font-bold uppercase tracking-wide">
            {t('game.toast', {
              name: t(`game.achievements.${lastUnlocked}.name`),
            })}
          </span>
          <button
            type="button"
            aria-label={t('game.dismiss')}
            onClick={() => dispatch(dismissUnlock())}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-xl leading-none hover:bg-brand-ink/10"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      )}
    </div>
  )
}
