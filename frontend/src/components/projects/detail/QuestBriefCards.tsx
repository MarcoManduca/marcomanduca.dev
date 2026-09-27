import { useTranslation } from 'react-i18next'

import { StrokeIcon } from '@/components/ui/StrokeIcon'
import { useLanguage } from '@/hooks/useLanguage'
import type { QuestBrief } from '@/types'
import { cn } from '@/utils/cn'

import { BRIEF_ICONS } from './icons'
import { LABEL } from './styles'

const PARTS = ['objective', 'boss', 'rewards'] as const

interface QuestBriefCardsProps {
  brief: QuestBrief
}

/** The project told as a quest: objective, final boss and rewards. */
export const QuestBriefCards = ({ brief }: QuestBriefCardsProps) => {
  const { t } = useTranslation()
  const { localize } = useLanguage()

  return (
    <dl
      aria-label={t('projects.detail.brief')}
      className="grid gap-4 md:grid-cols-3"
    >
      {PARTS.map((part) => (
        <div
          key={part}
          className="flex flex-col gap-2.5 rounded-2xl bg-surface px-6 py-5"
        >
          <dt
            className={cn(
              LABEL,
              'flex items-center gap-2',
              part === 'rewards' && 'text-highlight',
            )}
          >
            <StrokeIcon
              paths={BRIEF_ICONS[part]}
              className="h-[18px] w-[18px]"
            />
            {t(`projects.detail.${part}`)}
          </dt>
          <dd className="text-lg leading-snug text-heading">
            {localize(brief[part])}
          </dd>
        </div>
      ))}
    </dl>
  )
}
