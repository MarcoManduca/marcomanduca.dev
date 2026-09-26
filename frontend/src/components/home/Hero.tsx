import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { cn } from '@/utils/cn'

import { HeroPortrait } from './HeroPortrait'

const CTA_LINKS = [
  { to: '/projects', key: 'home.ctaProjects', primary: true },
  { to: '/learning', key: 'home.ctaLearning', primary: false },
  { to: '/contacts', key: 'home.ctaContacts', primary: false },
] as const

export const Hero = () => {
  const { t } = useTranslation()

  return (
    <section className="py-12 sm:py-20">
      <div className="flex flex-col items-start gap-10 md:flex-row md:items-center md:justify-between md:gap-12">
        <div className="flex flex-col gap-5 motion-safe:animate-fade-in-up">
          <p className="font-mono text-sm text-accent">
            {t('home.heroGreeting')}
          </p>
          <h1 className="text-4xl font-bold text-heading sm:text-6xl">
            {t('home.heroName')}
          </h1>
          <h2 className="text-xl font-medium text-accent sm:text-2xl">
            {t('home.heroRole')}
          </h2>
          <p className="max-w-2xl text-body">{t('home.heroTagline')}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {CTA_LINKS.map(({ to, key, primary }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'rounded-lg px-5 py-2.5 text-sm font-medium transition-colors',
                  primary
                    ? 'bg-warm text-background hover:bg-warm-hover'
                    : 'border border-edge text-heading hover:border-accent hover:text-accent-hover',
                )}
              >
                {t(key)}
              </Link>
            ))}
          </div>
        </div>

        <HeroPortrait />
      </div>
    </section>
  )
}
