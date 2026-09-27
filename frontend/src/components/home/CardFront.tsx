import { useTranslation } from 'react-i18next'

import portrait420 from '@/assets/portrait-card-420.webp'
import portrait680 from '@/assets/portrait-card-680.webp'
import portrait1020 from '@/assets/portrait-card-1020.webp'
import { useYearsOfExperience } from '@/hooks/useYearsOfExperience'

// Rendered width: the card column minus the foil (340px on lg, 420px from xl),
// else the page width minus gutter and foil, up to the 420px card.
const PORTRAIT_SIZES =
  '(min-width: 1280px) 404px, (min-width: 1024px) 324px, min(404px, calc(100vw - 48px))'

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
      <div aria-hidden="true" className="absolute inset-0 bg-holo" />
      <div aria-hidden="true" className="absolute inset-0 bg-card-fade" />

      {/* Top right, over the dark backdrop of the photo. */}
      <span className="absolute right-5 top-4 font-display text-2xl font-extrabold text-brand-yellow sm:right-6 sm:top-5">
        <span aria-hidden="true">{t('home.card.level', { years })}</span>
        <span className="sr-only">{t('home.card.levelLabel', { years })}</span>
      </span>

      <div className="relative mt-auto flex flex-col gap-1.5">
        <p className="font-display text-sm font-extrabold uppercase tracking-[0.12em] text-brand-yellow">
          {t('home.heroRole')}
        </p>
        <h1 className="text-5xl font-extrabold uppercase leading-[0.92] text-brand-cream">
          Marco
          <br />
          Manduca
        </h1>
      </div>
    </>
  )
}
