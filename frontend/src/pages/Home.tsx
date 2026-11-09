import { useTranslation } from 'react-i18next'

import { FigurineShelf } from '@/components/game/FigurineShelf'
import { CharacterCard } from '@/components/home/CharacterCard'
import { HeroActions } from '@/components/home/HeroActions'
import { SideQuestsSection } from '@/components/home/sideQuests/SideQuestsSection'
import { StatsSection } from '@/components/home/stats/StatsSection'
import { QuestLog } from '@/components/quests/QuestLog'
import { Seo } from '@/components/seo/Seo'

export const Home = () => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-12 lg:gap-14">
      <Seo description={t('home.heroTagline')} />
      {/* The card narrows on lg so quest names keep a single line. From lg
          both columns stretch to the row: card + CTAs and the quest log line
          up at the top and at the bottom (CTAs and "Full journey" pinned
          there), whichever of the two is taller. */}
      <div className="grid items-start gap-10 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-stretch lg:gap-12 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="flex flex-col gap-6 lg:justify-between lg:gap-4">
          <CharacterCard />
          <HeroActions />
        </div>
        <QuestLog />
      </div>
      {/* Side by side from lg, as tall as each other; stacked below. */}
      <div className="grid gap-12 lg:grid-cols-2">
        <StatsSection />
        <SideQuestsSection />
      </div>
      <FigurineShelf />
    </div>
  )
}
