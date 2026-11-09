import { useTranslation } from 'react-i18next'

import { AboutPortrait } from '@/components/about/AboutPortrait'
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
import { SKILL_GROUPS } from '@/types'
import { timelineAnchor } from '@/utils/timelineAnchor'

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
      <Seo title={t('about.title')} description={t('about.subtitle')} />
      {/* One photo, three placements. Phones: its own column beside the
          title, so the bio stays full width. From sm: floated into the bio,
          the text wrapping around it. From xl: its own column, stretched to
          the bio's height. The sections below stay where the text puts them. */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-6 [grid-template-areas:'title_photo'_'bio_bio'] sm:flow-root xl:grid xl:grid-cols-[minmax(0,1fr)_15rem] xl:gap-x-12 xl:[grid-template-areas:'title_title'_'bio_photo']">
        <div className="[grid-area:title]">
          <h1 className="text-3xl font-bold text-heading">
            {t('about.title')}
          </h1>
          <p className="mt-2 text-muted">{t('about.subtitle')}</p>
        </div>
        <AboutPortrait className="w-24 self-start [grid-area:photo] sm:float-right sm:mb-3 sm:ml-4 sm:mt-6 sm:w-40 xl:float-none xl:m-0 xl:w-full xl:self-stretch" />
        <div className="[grid-area:bio] sm:mt-6 xl:mt-0">
          <Prose className="leading-relaxed">
            <p>{t('about.bio')}</p>
          </Prose>
          <div className="mt-6">
            <DownloadCvButton />
          </div>
        </div>
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
