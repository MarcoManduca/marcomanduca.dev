import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { useMissions } from '@/hooks/useMissions'

import { MissionCard } from './MissionCard'

/** Grid of mission cards, a face-down "next project" and the main CTA. */
export const MissionDeck = () => {
  const { t } = useTranslation()
  const missions = useMissions()

  return (
    <section aria-labelledby="deck-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="deck-title"
          className="text-3xl font-extrabold uppercase text-heading sm:text-[44px] sm:leading-tight"
        >
          {t('home.deck.title')}
        </h2>
        <Link
          to="/about-me"
          className="font-display text-lg font-bold uppercase tracking-wider text-highlight hover:text-heading"
        >
          {t('home.deck.fullPath')} →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {missions.map(({ key, ...mission }) => (
          <MissionCard key={key} {...mission} />
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-edge px-5 py-4 text-muted">
        <span className="font-display text-xl font-bold">
          {t('home.deck.hiddenCard')}
        </span>
        <span className="font-display text-sm font-bold uppercase tracking-widest">
          {t('home.deck.hiddenLabel')}
        </span>
      </div>

      <Link
        to="/projects"
        className="flex min-h-14 items-center justify-center self-stretch rounded-xl bg-warm px-7 text-center font-display text-xl font-extrabold uppercase tracking-wide text-background transition-colors hover:bg-warm-hover sm:self-start"
      >
        {t('home.deck.cta')}
      </Link>
    </section>
  )
}
