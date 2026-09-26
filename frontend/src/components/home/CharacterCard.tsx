import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { cn } from '@/utils/cn'

import { CardBack } from './CardBack'
import { CardFront } from './CardFront'

const FACE =
  'relative flex h-full flex-col overflow-hidden rounded-[20px] [backface-visibility:hidden] [grid-area:1/1]'

/**
 * Trading-card profile that flips on click (or Enter/Space) with a 3D turn.
 * Both faces share one grid cell so the card keeps a single size; the hidden
 * face is removed from the accessibility tree. Reduced motion: instant swap.
 */
export const CharacterCard = () => {
  const { t } = useTranslation()
  const [flipped, setFlipped] = useState(false)

  return (
    <article
      aria-label={t('home.card.label')}
      className="relative mx-auto w-full max-w-[420px] [perspective:1600px] lg:-rotate-2"
    >
      <div
        className={cn(
          'grid aspect-[5/7] rounded-[26px] bg-gradient-to-br from-brand-yellow via-brand-orange to-brand-teal p-2 shadow-2xl shadow-black/40 transition-transform duration-700 ease-in-out [transform-style:preserve-3d] motion-reduce:transition-none',
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
            'gap-5 bg-brand-ink p-5 [transform:rotateY(180deg)] sm:p-6',
          )}
        >
          <CardBack />
        </div>
      </div>

      {/* One control over the whole card, so headings stay out of the button. */}
      <button
        type="button"
        aria-pressed={flipped}
        aria-label={t(flipped ? 'home.card.showFront' : 'home.card.showBack')}
        onClick={() => setFlipped((value) => !value)}
        className="absolute inset-0 rounded-[26px] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-highlight"
      />
    </article>
  )
}
