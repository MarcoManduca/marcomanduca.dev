import { useTranslation } from 'react-i18next'

import { Seo } from '@/components/seo/Seo'
import { Prose } from '@/components/ui/Prose'

interface PrivacySection {
  heading: string
  body: string
  items?: string[]
}

export const PrivacyPolicy = () => {
  const { t } = useTranslation()
  const sections = t('privacy.sections', {
    returnObjects: true,
  }) as PrivacySection[]

  return (
    <>
      <Seo title={t('privacy.title')} description={t('privacy.subtitle')} />
      <h1 className="text-3xl font-bold text-heading">{t('privacy.title')}</h1>
      <p className="mt-2 text-muted">{t('privacy.subtitle')}</p>
      <p className="mt-1 text-xs text-muted">{t('privacy.lastUpdated')}</p>

      <Prose className="mt-8 space-y-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-left text-xl font-semibold text-heading">
              {section.heading}
            </h2>
            <p className="mt-2 leading-relaxed text-body">{section.body}</p>
            {section.items && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-body">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </Prose>
    </>
  )
}
