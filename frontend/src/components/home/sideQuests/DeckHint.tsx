import { useTranslation } from 'react-i18next'

import { StrokeIcon } from '@/components/ui/StrokeIcon'

const SWIPE_ICON = ['M8 7l-5 5 5 5M16 7l5 5-5 5M3 12h18'] as const

interface DeckHintProps {
  /** Referenced by the deck's aria-describedby. */
  id: string
}

/** How to flip through the deck: swipe (shown) or arrow keys (read out). */
export const DeckHint = ({ id }: DeckHintProps) => {
  const { t } = useTranslation()

  return (
    <p
      id={id}
      className="flex items-center justify-center gap-2 text-[13px] text-muted"
    >
      <StrokeIcon paths={SWIPE_ICON} className="h-[18px] w-[18px]" />
      {t('home.sideQuests.hint')}
      <span className="sr-only">{t('home.sideQuests.hintKeys')}</span>
    </p>
  )
}
