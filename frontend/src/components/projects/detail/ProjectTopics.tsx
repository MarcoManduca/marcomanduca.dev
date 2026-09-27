import { useTranslation } from 'react-i18next'

import { useLanguage } from '@/hooks/useLanguage'
import type { LocalizedText } from '@/types'

import { AsidePanel } from './AsidePanel'

interface ProjectTopicsProps {
  topics: LocalizedText[]
}

/** What the project is about, as hashtags. */
export const ProjectTopics = ({ topics }: ProjectTopicsProps) => {
  const { t } = useTranslation()
  const { localize } = useLanguage()

  if (topics.length === 0) return null

  return (
    <AsidePanel title={t('projects.detail.topics')}>
      <ul className="flex flex-wrap gap-1.5">
        {topics.map((topic) => (
          <li
            key={topic.en}
            className="rounded-full bg-background px-2.5 py-1 text-sm text-heading"
          >
            #{localize(topic)}
          </li>
        ))}
      </ul>
    </AsidePanel>
  )
}
