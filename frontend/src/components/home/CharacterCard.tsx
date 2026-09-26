import { useTranslation } from 'react-i18next'

import { CardPortrait } from './CardPortrait'

const LABEL = 'font-display text-lg font-extrabold uppercase'

/** Trading-card profile: foil frame, portrait, type, ability and evolutions. */
export const CharacterCard = () => {
  const { t } = useTranslation()
  const evolutions = t('home.card.evolutions', {
    returnObjects: true,
  }) as string[]

  return (
    <article
      aria-label={t('home.card.label')}
      className="mx-auto w-full max-w-[420px] rounded-[26px] bg-gradient-to-br from-brand-yellow via-brand-orange to-brand-teal p-2 shadow-2xl shadow-black/40 lg:-rotate-2 motion-safe:lg:transition-transform motion-safe:lg:hover:rotate-0"
    >
      <div className="flex flex-col gap-3 rounded-[20px] bg-card p-4 text-card-ink sm:p-[18px]">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-3xl font-extrabold uppercase leading-none sm:text-[34px]">
            {t('home.heroName')}
          </h1>
          <span className="font-display text-2xl font-extrabold text-card-accent">
            <span aria-hidden="true">{t('home.card.level')}</span>
            <span className="sr-only">{t('home.card.levelLabel')}</span>
          </span>
        </div>

        <CardPortrait />

        <p className="rounded-md bg-card-ink px-2.5 py-1.5 font-display text-base font-bold uppercase tracking-wide text-brand-yellow">
          {t('home.card.type', { role: t('home.heroRole') })}
        </p>

        <div className="flex flex-col gap-1 border-b-2 border-card-ink pb-2.5">
          <h2 className={LABEL}>{t('home.card.abilityTitle')}</h2>
          <p className="text-[15px] leading-snug">{t('home.card.ability')}</p>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className={LABEL}>{t('home.card.evolutionsTitle')}</h2>
          <p className="text-[15px]">
            {evolutions.map((step) => `${step} → `)}
            <strong className="text-card-accent">
              {t('home.card.evolutionCurrent')}
            </strong>
          </p>
        </div>

        <p className="flex justify-between gap-3 font-display text-sm font-semibold italic text-card-muted">
          <span>{t('home.card.stack')}</span>
          <span>{t('home.card.serial')}</span>
        </p>
      </div>
    </article>
  )
}
