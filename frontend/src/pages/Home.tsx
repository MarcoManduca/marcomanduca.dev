import { useTranslation } from 'react-i18next'

import { FigurineShelf } from '@/components/game/FigurineShelf'
import { CharacterCard } from '@/components/home/CharacterCard'
import { EnergySection } from '@/components/home/EnergySection'
import { MissionDeck } from '@/components/home/MissionDeck'
import { Seo } from '@/components/seo/Seo'

export const Home = () => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-12 lg:gap-14">
      <Seo description={t('home.heroTagline')} />
      <div className="grid items-start gap-10 lg:grid-cols-[420px_minmax(0,1fr)] lg:gap-12">
        <CharacterCard />
        <MissionDeck />
      </div>
      <EnergySection />
      <FigurineShelf />
    </div>
  )
}
