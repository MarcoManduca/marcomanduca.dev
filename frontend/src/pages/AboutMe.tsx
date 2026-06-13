import { useTranslation } from 'react-i18next'

import { Seo } from '@/components/seo/Seo'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'

interface ExperienceEntry {
  period: string
  role: string
  company: string
  description: string
}

const SKILL_GROUPS = ['tech', 'analytics', 'cloud', 'frontend'] as const

export const AboutMe = () => {
  const { t } = useTranslation()
  const experience = t('about.experience', {
    returnObjects: true,
  }) as ExperienceEntry[]

  return (
    <>
      <Seo title={t('about.title')} description={t('about.subtitle')} />
      <h1 className="text-3xl font-bold text-heading">{t('about.title')}</h1>
      <p className="mt-2 text-muted">{t('about.subtitle')}</p>
      <p className="mt-6 max-w-3xl leading-relaxed">{t('about.bio')}</p>

      <h2 className="mt-12 text-2xl font-semibold text-heading">
        {t('about.experienceTitle')}
      </h2>
      <ol className="mt-5 space-y-0 border-l border-edge">
        {experience.map(({ period, role, company, description }) => (
          <li key={period} className="relative pb-8 pl-6">
            <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
            <p className="font-mono text-xs text-muted">{period}</p>
            <h3 className="mt-1 font-semibold text-heading">
              {role} · <span className="text-accent-hover">{company}</span>
            </h3>
            <p className="mt-1 text-sm">{description}</p>
          </li>
        ))}
      </ol>

      <h2 className="mt-8 text-2xl font-semibold text-heading">
        {t('about.skillsTitle')}
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
