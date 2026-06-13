import { useTranslation } from 'react-i18next'

import { CvContentView } from '@/components/cv/CvContentView'
import { Seo } from '@/components/seo/Seo'
import { Spinner } from '@/components/ui/Spinner'
import { useLanguage } from '@/hooks/useLanguage'
import { getCvPdfUrl, useGetCvQuery } from '@/services/cvApi'
import { CV_SECTION_IDS } from '@/types'

export const Cv = () => {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { data: cv, isLoading, isError } = useGetCvQuery(language)

  const orderedSections = CV_SECTION_IDS.filter(
    (id) => cv?.sections[id] !== undefined,
  )

  return (
    <>
      <Seo title={t('cv.title')} description={t('cv.subtitle')} />
      <h1 className="text-3xl font-bold text-heading">{t('cv.title')}</h1>
      <p className="mt-2 text-muted">{t('cv.subtitle')}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={getCvPdfUrl('it')}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          download
        >
          {t('cv.downloadIt')}
        </a>
        <a
          href={getCvPdfUrl('en')}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          download
        >
          {t('cv.downloadEn')}
        </a>
      </div>
      {isLoading && <Spinner />}
      {isError && <p className="mt-8 text-red-400">{t('common.error')}</p>}
      {cv && orderedSections.length === 0 && (
        <p className="mt-8 text-muted">{t('cv.empty')}</p>
      )}
      <div className="mt-10 space-y-8">
        {orderedSections.map((id) => (
          <section key={id}>
            <h2 className="mb-4 text-2xl font-semibold text-heading">
              {t(`cv.sections.${id}`)}
            </h2>
            <CvContentView content={cv?.sections[id]} />
          </section>
        ))}
      </div>
    </>
  )
}
