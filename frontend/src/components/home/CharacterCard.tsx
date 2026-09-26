import { useTranslation } from 'react-i18next'

import { useCardFlip } from '@/hooks/useCardFlip'
import { cn } from '@/utils/cn'

import { CardBack } from './CardBack'
import { CardFront } from './CardFront'

const FACE =
  'relative flex h-full flex-col overflow-hidden rounded-[20px] [-webkit-backface-visibility:hidden] [backface-visibility:hidden] [grid-area:1/1]'

/** Faint circular arrow peeking out from behind the top-left corner. */
const FlipIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="absolute -left-[3px] -top-[10px] h-8 w-8 text-heading/5"
  >
    <path d="M20 12a8 8 0 1 1-2.34-5.66" />
    <path d="M20 4v5h-5" />
  </svg>
)

/**
 * Trading-card profile that flips with a 3D turn on click, tap or horizontal
 * swipe (Enter/Space for keyboards). Both faces share one grid cell so the
 * card keeps a single size; the hidden face is removed from the a11y tree.
 * Reduced motion: instant swap.
 */
export const CharacterCard = () => {
  const { t } = useTranslation()
  const { flipped, flip, swipeHandlers } = useCardFlip()

  return (
    <article
      aria-label={t('home.card.label')}
      className="mx-auto w-full max-w-[420px] lg:-rotate-2"
    >
      <div className="relative [perspective:1600px]">
        <FlipIcon />
        <div
          className={cn(
            'relative grid aspect-[5/7] rounded-[26px] bg-gradient-to-br from-brand-yellow via-brand-orange to-brand-teal p-2 shadow-2xl shadow-black/40 transition-transform duration-700 ease-in-out [transform-style:preserve-3d] motion-reduce:transition-none',
            flipped && '[transform:rotateY(180deg)]',
          )}
        >
          <div
            aria-hidden={flipped}
            className={cn(FACE, 'bg-brand-teal p-5 sm:p-6')}
          >
            <CardFront />
          </div>
          <div
            aria-hidden={!flipped}
            className={cn(
              FACE,
              'gap-5 bg-surface p-5 [transform:rotateY(180deg)] sm:p-6',
            )}
          >
            <CardBack />
          </div>
        </div>

        {/* The card itself is the control: click, tap, swipe or keyboard. */}
        <button
          type="button"
          aria-pressed={flipped}
          aria-label={t('home.card.flip')}
          onClick={flip}
          {...swipeHandlers}
          className="absolute inset-0 touch-pan-y rounded-[26px] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-highlight"
        />
      </div>
    </article>
  )
}
