import { useTranslation } from 'react-i18next'

import { FigurineShelf } from '@/components/game/FigurineShelf'
import { CharacterCard } from '@/components/home/CharacterCard'
import { SideQuestsSection } from '@/components/home/sideQuests/SideQuestsSection'
import { StatsSection } from '@/components/home/stats/StatsSection'
import { QuestLog } from '@/components/quests/QuestLog'
import { Seo } from '@/components/seo/Seo'

export const Home = () => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-12 lg:gap-14">
      <Seo description={t('home.heroTagline')} />
      {/* The card narrows on lg so quest names keep a single line. */}
      <div className="grid items-start gap-10 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[420px_minmax(0,1fr)]">
        <CharacterCard />
        <QuestLog />
      </div>
      {/* Side by side from lg, stacked on smaller screens. */}
      <div className="grid items-start gap-12 lg:grid-cols-2">
        <StatsSection />
        <SideQuestsSection />
      </div>
      <FigurineShelf />
    </div>
  )
}
