import { useTranslation } from 'react-i18next'

import portrait420 from '@/assets/portrait-card-420.webp'
import portrait680 from '@/assets/portrait-card-680.webp'
import portrait1020 from '@/assets/portrait-card-1020.webp'
import { useYearsOfExperience } from '@/hooks/useYearsOfExperience'

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

// Fade, level and name: one layer over the foil.
const OVERLAY = `${FRONT_LAYER} absolute inset-0 flex flex-col bg-card-fade p-5 sm:p-6`

/** Full-art front: portrait, role, name and level (years of experience). */
export const CardFront = () => {
  const { t } = useTranslation()
  const years = useYearsOfExperience()

  return (
    <>
      <img
        src={portrait420}
        srcSet={`${portrait420} 420w, ${portrait680} 680w, ${portrait1020} 1020w`}
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
        {/* Top right, over the dark backdrop of the photo. */}
        <span className="absolute right-5 top-4 font-display text-2xl font-extrabold text-brand-yellow sm:right-6 sm:top-5">
          <span aria-hidden="true">{t('home.card.level', { years })}</span>
          <span className="sr-only">
            {t('home.card.levelLabel', { years })}
          </span>
        </span>

        <div className="mt-auto flex flex-col gap-1.5">
          <p className="font-display text-sm font-extrabold uppercase tracking-[0.12em] text-brand-yellow">
            {t('home.heroRole')}
          </p>
          <h1 className="text-5xl font-extrabold uppercase leading-[0.92] text-brand-cream">
            Marco
            <br />
            Manduca
          </h1>
        </div>
      </div>
    </>
  )
}
