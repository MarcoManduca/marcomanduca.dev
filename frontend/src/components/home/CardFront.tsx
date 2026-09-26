import { useTranslation } from 'react-i18next'

import heroImage from '@/assets/hero-512.webp'

/** Full-art front: portrait, role, name and level. */
export const CardFront = () => {
  const { t } = useTranslation()

  return (
    <>
      <img
        src={heroImage}
        alt={t('home.card.portraitAlt')}
        width={512}
        height={512}
        loading="eager"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-top"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-holo" />
      <div aria-hidden="true" className="absolute inset-0 bg-card-fade" />

      <span
        aria-hidden="true"
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border-2 border-brand-yellow/80 bg-brand-ink/70 text-lg text-brand-yellow"
      >
        ↻
      </span>

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
