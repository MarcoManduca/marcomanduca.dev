import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const CTA_LINKS = [
  { to: '/projects', key: 'home.ctaProjects', primary: true },
  { to: '/learning', key: 'home.ctaLearning', primary: false },
  { to: '/contacts', key: 'home.ctaContacts', primary: false },
] as const

export const Hero = () => {
  const { t } = useTranslation()

  return (
    <section className="py-12 sm:py-20">
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
        <h2 className="text-xl font-medium text-accent-hover sm:text-2xl">
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
                  ? 'rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover'
                  : 'rounded-lg border border-edge px-5 py-2.5 text-sm font-medium text-heading transition-colors hover:border-accent hover:text-accent-hover'
              }
            >
              {t(key)}
            </Link>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
