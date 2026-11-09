import { useTranslation } from 'react-i18next'

import dark420 from '@/assets/hero-card-dark-420.webp'
import dark680 from '@/assets/hero-card-dark-680.webp'
import dark840 from '@/assets/hero-card-dark-840.webp'
import light420 from '@/assets/hero-card-light-420.webp'
import light680 from '@/assets/hero-card-light-680.webp'
import light840 from '@/assets/hero-card-light-840.webp'
import { useTheme } from '@/hooks/useTheme'
import { useYearsOfExperience } from '@/hooks/useYearsOfExperience'
import { cn } from '@/utils/cn'
import type { Theme } from '@/utils/theme'

/**
 * The card art per theme: the same scene by day and by night. Only the
 * active one is requested (theme-init.js sets the theme before the first
 * render); a theme switch swaps it. 840w covers the 404px card at 2x.
 */
const ART: Record<Theme, { src: string; srcSet: string }> = {
  light: {
    src: light420,
    srcSet: `${light420} 420w, ${light680} 680w, ${light840} 840w`,
  },
  dark: {
    src: dark420,
    srcSet: `${dark420} 420w, ${dark680} 680w, ${dark840} 840w`,
  },
}

// Rendered width: the card column minus the foil (340px on lg, 420px from xl),
// else the page width minus gutter and foil, up to the 420px card.
const PORTRAIT_SIZES =
  '(min-width: 1280px) 404px, (min-width: 1024px) 324px, min(404px, calc(100vw - 48px))'

// The foil and the text over it get layers of their own; like the face, they
// turn away when the card flips.
const FRONT_LAYER =
  '[-webkit-backface-visibility:hidden] [backface-visibility:hidden]'

// Holographic sheen on a layer twice the card size (clipped by the face), so
// it can slide after the lean (`--foil-*`, set by useCardTilt); centred, it
// matches the flat card. It moves by transform, like the lean: the browser
// shifts the painted layer instead of repainting the gradient every frame.
const FOIL = `${FRONT_LAYER} absolute -inset-1/2 bg-holo translate-x-[var(--foil-x,0%)] translate-y-[var(--foil-y,0%)] will-change-transform motion-reduce:transform-none`

// Level badge and name box: one layer over the foil. No full-height fade:
// the illustration stays bright and the text sits on small plates themed
// like the page (parchment in light, ink in dark).
const OVERLAY = `${FRONT_LAYER} absolute inset-0 flex flex-col p-4 sm:p-5`

/** Backing of the text over the illustration, in the page's theme. */
const PLATE = 'border-2 border-edge bg-background shadow-lg shadow-black/25'

/** Full-art front: illustration, role, name and level (years of experience). */
export const CardFront = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const years = useYearsOfExperience()

  return (
    <>
      <img
        src={ART[theme].src}
        srcSet={ART[theme].srcSet}
        sizes={PORTRAIT_SIZES}
        alt={t('home.card.portraitAlt')}
        width={420}
        height={588}
        loading="eager"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-top"
      />
      <div aria-hidden="true" className={FOIL} />

      <div className={OVERLAY}>
        {/* Top right, on its own badge: the sky behind it is light. */}
        <span
          className={cn(
            'absolute right-4 top-4 rounded-full px-3 py-0.5 font-display text-xl font-extrabold text-highlight sm:right-5 sm:top-5',
            PLATE,
          )}
        >
          <span aria-hidden="true">{t('home.card.level', { years })}</span>
          <span className="sr-only">
            {t('home.card.levelLabel', { years })}
          </span>
        </span>

        {/* Bottom left, sized to the name: the rest of the art stays clear. */}
        <div
          className={cn(
            'mt-auto flex flex-col gap-1 self-start rounded-2xl px-4 pb-3 pt-2.5',
            PLATE,
          )}
        >
          <p className="font-display text-sm font-extrabold uppercase tracking-[0.12em] text-highlight">
            {t('home.heroRole')}
          </p>
          <h1 className="text-4xl font-extrabold uppercase leading-[0.92] text-heading sm:text-[2.75rem]">
            Marco
            <br />
            Manduca
          </h1>
        </div>
      </div>
    </>
  )
}
