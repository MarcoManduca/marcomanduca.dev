import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { useStats } from '@/hooks/useStats'

import { StatLevelList } from './StatLevelList'
import { StatsRadar } from './StatsRadar'

/** Home "Stats": the CV skill groups on a radar, with their levels. */
export const StatsSection = () => {
  const { t } = useTranslation()
  const stats = useStats()
  const [active, setActive] = useState<number | null>(null)

  const hide = () => setActive(null)
  const toggle = (index: number) =>
    setActive((current) => (current === index ? null : index))

  return (
    <section
      aria-labelledby="stats-title"
      className="flex min-w-0 flex-col gap-4"
    >
      <h2
        id="stats-title"
        className="text-2xl font-extrabold uppercase text-heading sm:text-[28px]"
      >
        {t('home.stats.title')}
      </h2>
      <div className="flex flex-col gap-4 rounded-[20px] bg-surface p-4 sm:p-6 lg:gap-5">
        <StatsRadar
          stats={stats}
          active={active}
          onShow={setActive}
          onHide={hide}
          onToggle={toggle}
        />
        <p className="text-center text-[13px] text-muted lg:hidden">
          {t('home.stats.hint')}
        </p>
        <StatLevelList
          stats={stats}
          active={active}
          onShow={setActive}
          onHide={hide}
        />
      </div>
    </section>
  )
}
