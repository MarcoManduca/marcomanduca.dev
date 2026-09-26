import { useTranslation } from 'react-i18next'

import portrait420 from '@/assets/portrait-card-420.webp'
import portrait680 from '@/assets/portrait-card-680.webp'
import portrait1020 from '@/assets/portrait-card-1020.webp'

// Card width: full column on phones (minus page gutter and foil), 404px on lg.
const PORTRAIT_SIZES = '(min-width: 1024px) 404px, calc(100vw - 48px)'

/** Full-art front: portrait, role, name and level. */
export const CardFront = () => {
  const { t } = useTranslation()

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

      <div className="relative mt-auto flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="font-display text-sm font-extrabold uppercase tracking-[0.12em] text-brand-yellow">
            {t('home.heroRole')}
          </p>
          <h1 className="text-5xl font-extrabold uppercase leading-[0.92] text-brand-cream">
            Marco
            <br />
            Manduca
          </h1>
        </div>
        <span className="shrink-0 font-display text-2xl font-extrabold text-brand-yellow">
          <span aria-hidden="true">{t('home.card.level')}</span>
          <span className="sr-only">{t('home.card.levelLabel')}</span>
        </span>
      </div>
    </>
  )
}
