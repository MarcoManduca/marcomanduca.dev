import { useTranslation } from 'react-i18next'

import { DownloadCvButton } from '@/components/about/DownloadCvButton'
import {
  EducationTimeline,
  type EducationEntry,
} from '@/components/about/EducationTimeline'
import {
  ExperienceTimeline,
  type ExperienceEntry,
} from '@/components/about/ExperienceTimeline'
import { Seo } from '@/components/seo/Seo'
import { Card } from '@/components/ui/Card'
import { Prose } from '@/components/ui/Prose'
import { Tag } from '@/components/ui/Tag'
import { useScrollSpy } from '@/hooks/useScrollSpy'
import { timelineAnchor } from '@/utils/timelineAnchor'

const SKILL_GROUPS = [
  'programming',
  'dataEngineering',
  'dataViz',
  'versioning',
  'storage',
  'crm',
] as const

export const AboutMe = () => {
  const { t } = useTranslation()
  const experience = t('about.experience', {
    returnObjects: true,
  }) as ExperienceEntry[]
  const education = t('about.education', {
    returnObjects: true,
  }) as EducationEntry[]
  const activeAnchor = useScrollSpy([
    ...experience.map(({ start }) => timelineAnchor('work', start)),
    ...education.map(({ start }) => timelineAnchor('study', start)),
  ])

  return (
    <>
      <Seo description={t('about.subtitle')} />
      <h1 className="text-3xl font-bold text-heading">{t('about.title')}</h1>
      <p className="mt-2 text-muted">{t('about.subtitle')}</p>
      <Prose className="mt-6 leading-relaxed">
        <p>{t('about.bio')}</p>
      </Prose>

      <div className="mt-6">
        <DownloadCvButton />
      </div>

      <h2 className="mt-12 text-2xl font-semibold text-heading">
        {t('about.experienceTitle')}
      </h2>
      <Prose>
        <ExperienceTimeline entries={experience} activeAnchor={activeAnchor} />
      </Prose>

      <h2 className="mt-8 text-2xl font-semibold text-heading">
        {t('about.educationTitle')}
      </h2>
      <Prose>
        <EducationTimeline entries={education} activeAnchor={activeAnchor} />
      </Prose>

      <h2 className="mt-8 text-2xl font-semibold text-heading">
        {t('about.skillsTitle')}
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SKILL_GROUPS.map((group) => (
          <Card key={group}>
            <h3 className="mb-3 font-semibold text-heading">
              {t(`about.skillGroups.${group}`)}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {(
                t(`about.skills.${group}`, { returnObjects: true }) as string[]
              ).map((skill) => (
                <Tag key={skill} label={skill} />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}
