import { useTranslation } from 'react-i18next'

/** Face-down placeholder closing the active quests: more to come. */
export const NextQuestSlot = () => {
  const { t } = useTranslation()

  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-2xl border-2 border-dashed border-edge px-4 py-3 text-muted sm:gap-[18px] sm:px-5 sm:py-4">
      <span
        aria-hidden="true"
        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed border-edge font-display text-xl font-extrabold sm:h-14 sm:w-14 sm:text-2xl"
      >
        ?
      </span>
      <span className="font-display text-xl font-bold sm:text-[22px]">
        {t('home.quests.nextQuest')}
      </span>
    </li>
  )
}
