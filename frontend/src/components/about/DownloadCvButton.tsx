import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import { useLazyGetMediaUrlQuery } from '@/services/mediaApi'

/** Fixed S3 key of the published CV PDF. */
const CV_KEY = 'cv/cv.pdf'

/** Fetches a presigned URL for the CV PDF and opens it in a new tab. */
export const DownloadCvButton = () => {
  const { t } = useTranslation()
  const [getMediaUrl, { isFetching }] = useLazyGetMediaUrlQuery()

  const handleDownload = async () => {
    const result = await getMediaUrl(CV_KEY).unwrap()
    window.open(result.url, '_blank')
  }

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={handleDownload}
      disabled={isFetching}
    >
      {t('about.downloadCv')}
    </Button>
  )
}
