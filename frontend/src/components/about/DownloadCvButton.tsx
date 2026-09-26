import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import { useLazyGetMediaUrlQuery } from '@/services/mediaApi'

/** Fixed S3 key of the published CV PDF. */
const CV_KEY = 'cv/cv.pdf'

/**
 * Opens the CV PDF (behind a short-lived presigned URL) in a new tab.
 *
 * Popup blockers only allow `window.open` synchronously inside the click
 * handler, so a blank tab is opened first and pointed at the presigned URL
 * once it arrives. `opener` is cleared to get `noopener` isolation (passing
 * the `noopener` feature would make `window.open` return null). If the tab
 * is blocked anyway, the CV opens in the current tab instead.
 */
export const DownloadCvButton = () => {
  const { t } = useTranslation()
  const [getMediaUrl, { isFetching }] = useLazyGetMediaUrlQuery()
  const [failed, setFailed] = useState(false)

  const handleDownload = async () => {
    setFailed(false)
    const tab = window.open('', '_blank')
    if (tab) tab.opener = null

    try {
      const { url } = await getMediaUrl(CV_KEY).unwrap()
      if (tab) tab.location.href = url
      else window.location.assign(url)
    } catch {
      tab?.close()
      setFailed(true)
    }
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <Button type="button" onClick={handleDownload} disabled={isFetching}>
        {t('about.downloadCv')}
      </Button>
      {failed && (
        <p role="alert" className="text-sm text-red-400">
          {t('about.cvError')}
        </p>
      )}
    </div>
  )
}
