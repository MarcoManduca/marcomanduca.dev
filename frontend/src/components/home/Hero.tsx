import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import heroImage from '@/assets/hero.png'

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
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col gap-5"
        >
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
                className={
                  primary
                    ? 'rounded-lg bg-warm px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-warm-hover'
                    : 'rounded-lg border border-edge px-5 py-2.5 text-sm font-medium text-heading transition-colors hover:border-accent hover:text-accent-hover'
                }
              >
                {t(key)}
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative hidden shrink-0 md:block"
        >
          <div
            aria-hidden
            className="absolute -left-8 -top-8 h-60 w-60 rounded-[2.5rem] bg-accent/60 blur-2xl lg:h-64 lg:w-64"
          />
          <div
            aria-hidden
            className="absolute -bottom-8 -right-8 h-60 w-60 rounded-[2.5rem] bg-warm/55 blur-2xl lg:h-64 lg:w-64"
          />
          <img
            src={heroImage}
            alt={t('home.heroName')}
            className="relative h-60 w-60 rounded-[2rem] border border-edge object-cover object-top shadow-xl lg:h-64 lg:w-64"
          />
        </motion.div>
      </div>
    </section>
  )
}
