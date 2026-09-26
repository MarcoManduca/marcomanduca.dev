import { useTranslation } from 'react-i18next'

import { EnergyCard } from './EnergyCard'

const SKILLS_PER_ENERGY = 3

const ENERGIES = [
  {
    group: 'programming',
    icon: '{ }',
    iconClassName: 'bg-brand-yellow text-brand-ink',
  },
  {
    group: 'dataEngineering',
    icon: '⇄',
    iconClassName: 'bg-brand-orange text-brand-ink',
  },
  {
    group: 'dataViz',
    icon: '▥',
    iconClassName: 'bg-brand-cyan text-brand-ink',
  },
  {
    group: 'storage',
    icon: '▤',
    iconClassName: 'bg-brand-teal text-brand-cream',
  },
] as const

/** Core skill groups from the CV, shown as the card's "energies". */
export const EnergySection = () => {
  const { t } = useTranslation()

  return (
    <section aria-labelledby="energies-title" className="flex flex-col gap-4">
      <h2
        id="energies-title"
        className="text-2xl font-extrabold uppercase text-heading sm:text-[28px]"
      >
        {t('home.energiesTitle')}
      </h2>
      <ul className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {ENERGIES.map(({ group, icon, iconClassName }) => (
          <EnergyCard
            key={group}
            icon={icon}
            iconClassName={iconClassName}
            title={t(`about.skillGroups.${group}`)}
            skills={(
              t(`about.skills.${group}`, { returnObjects: true }) as string[]
            ).slice(0, SKILLS_PER_ENERGY)}
          />
        ))}
      </ul>
    </section>
  )
}
