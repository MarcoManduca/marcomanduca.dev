import { useTranslation } from 'react-i18next'

import { Spinner } from '@/components/ui/Spinner'
import { useGetCvQuery } from '@/services/cvApi'
import { CV_SECTION_IDS } from '@/types'

import { CvSectionForm } from './CvSectionForm'

/**
 * CV editor. The public CV endpoint only returns one language at a time,
 * so we fetch both the Italian and English versions and recombine them
 * into the bilingual content each section form needs.
 */
export const AdminCv = () => {
  const { t } = useTranslation()
  const {
    data: cvIt,
    isLoading: loadingIt,
    isError: errorIt,
  } = useGetCvQuery('it')
  const {
    data: cvEn,
    isLoading: loadingEn,
    isError: errorEn,
  } = useGetCvQuery('en')

  if (loadingIt || loadingEn) return <Spinner />

  return (
    <>
      <h1 className="text-2xl font-bold text-heading">{t('admin.cv.title')}</h1>
      {(errorIt || errorEn) && (
        <p className="mt-6 text-red-400">{t('common.error')}</p>
      )}
      <div className="mt-6 space-y-6">
        {CV_SECTION_IDS.map((section) => (
          <CvSectionForm
            key={section}
            section={section}
            content={{
              it: cvIt?.sections[section] ?? null,
              en: cvEn?.sections[section] ?? null,
            }}
          />
        ))}
      </div>
    </>
  )
}
