import { useTranslation } from 'react-i18next'

import { useCardFlip } from '@/hooks/useCardFlip'
import { useCardTilt } from '@/hooks/useCardTilt'
import { cn } from '@/utils/cn'

import { CardBack } from './CardBack'
import { CardFlipHint } from './CardFlipHint'
import { CardFront } from './CardFront'

// `isolate` makes each face a stacking context, so Safari composites the
// foil and text of the front inside it, in paint order. Otherwise they join
// the card's 3D space as siblings of the face, level with it, and Safari's
// depth sort drops them behind the portrait as the card leans.
const FACE =
  'relative isolate flex h-full flex-col overflow-hidden rounded-[20px] [-webkit-backface-visibility:hidden] [backface-visibility:hidden] [grid-area:1/1]'

/**
 * Trading-card profile that flips with a 3D turn on click, tap or horizontal
 * swipe (Enter/Space for keyboards) and leans toward the mouse pointer. Both
 * faces share one grid cell so the card keeps a single size; the hidden face
 * is removed from the a11y tree. Reduced motion: instant swap, no lean.
 */
export const CharacterCard = () => {
  const { t } = useTranslation()
  const { flipped, flip, swipeHandlers } = useCardFlip()
  const { tiltRef, tiltHandlers } = useCardTilt<HTMLDivElement>()

  return (
    <article
      aria-label={t('home.card.label')}
      className="mx-auto w-full max-w-[420px] lg:-rotate-2"
    >
      <div className="group relative [perspective:1600px]">
        <CardFlipHint />
        {/* Lean toward the pointer (useCardTilt), around the flip. */}
        <div
          ref={tiltRef}
          className="relative [transform-style:preserve-3d] [transform:rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] motion-reduce:[transform:none]"
        >
          <div
            className={cn(
              'relative grid aspect-[5/7] rounded-[26px] bg-gradient-to-br from-brand-yellow via-brand-orange to-brand-teal p-2 shadow-2xl shadow-black/40 transition-transform duration-700 ease-in-out [transform-style:preserve-3d] motion-reduce:transition-none',
              flipped && '[transform:rotateY(180deg)]',
            )}
          >
            <div aria-hidden={flipped} className={cn(FACE, 'bg-brand-teal')}>
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
        </div>

        {/* The card itself is the control: click, tap, swipe or keyboard. */}
        <button
          type="button"
          aria-pressed={flipped}
          aria-label={t('home.card.flip')}
          onClick={flip}
          {...swipeHandlers}
          {...tiltHandlers}
          className="absolute inset-0 touch-pan-y rounded-[26px] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-highlight"
        />
      </div>
    </article>
  )
}
