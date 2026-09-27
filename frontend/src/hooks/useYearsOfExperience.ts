import { useTranslation } from 'react-i18next'

import type { ExperienceEntry } from '@/components/about/ExperienceTimeline'
import { yearsSince } from '@/utils/yearsSince'

/** Years since the first job started (CV copy): the character card's level. */
export const useYearsOfExperience = () => {
  const { t } = useTranslation()
  const experience = t('about.experience', {
    returnObjects: true,
  }) as ExperienceEntry[]

  return yearsSince(experience.map(({ start }) => start))
}
