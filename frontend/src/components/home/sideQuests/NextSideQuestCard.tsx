import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Logo } from '@/components/layout/Logo'
import { ContourArt } from '@/components/projects/AreaArt'

interface NextSideQuestCardProps {
  /** Only the top card of the deck takes focus. */
  interactive: boolean
}

/** Face-down card closing the deck: propose the next side quest. */
export const NextSideQuestCard = ({ interactive }: NextSideQuestCardProps) => {
  const { t } = useTranslation()

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-[17px] border-2 border-dashed border-edge bg-background p-6 text-center">
      <div aria-hidden="true" className="absolute inset-0 opacity-70">
        <ContourArt />
      </div>
      <div className="relative flex flex-col items-center gap-3.5">
        <Logo className="pointer-events-none h-16 w-[84px]" />
        <span className="inline-flex h-[26px] items-center rounded-full border border-edge px-2.5 font-display text-[13px] font-bold uppercase tracking-[0.08em] text-muted">
          {t('home.sideQuests.next.label')}
        </span>
        <h3 className="text-[26px] font-extrabold uppercase leading-none text-heading lg:text-[28px]">
          {t('home.sideQuests.next.title')}
        </h3>
        <p className="text-sm leading-relaxed text-body">
          {t('home.sideQuests.next.text')}
        </p>
        <Link
          to="/contacts"
          tabIndex={interactive ? undefined : -1}
          draggable={false}
          className="flex min-h-11 items-center font-display text-base font-bold uppercase tracking-wider text-highlight hover:text-heading"
        >
          {t('home.sideQuests.next.cta')} →
        </Link>
      </div>
    </div>
  )
}
