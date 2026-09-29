import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'

interface MediaUploadResultProps {
  objectKey: string
  /** Site path of an uploaded image; null for the CV (key only). */
  publicPath: string | null
}

/**
 * Outcome of a successful upload: the path to paste into content for an
 * image (with a copy button), or the bucket key for the private CV.
 */
export const MediaUploadResult = ({
  objectKey,
  publicPath,
}: MediaUploadResultProps) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      // No clipboard access (permissions, insecure origin): the path stays
      // on screen to copy by hand.
    }
  }

  return (
    <div role="status" className="mt-6 rounded-lg bg-success/15 p-4 text-sm">
      <p className="text-success">{t('admin.media.success')}</p>
      {publicPath ? (
        <>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="font-mono text-xs text-body">
              {t('admin.media.publicPath')}: {publicPath}
            </p>
            <Button variant="secondary" onClick={() => void copy(publicPath)}>
              {copied ? t('admin.media.copied') : t('admin.media.copy')}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted">
            {t('admin.media.publicPathHint')}
          </p>
        </>
      ) : (
        <p className="mt-2 font-mono text-xs text-body">
          {t('admin.media.objectKey')}: {objectKey}
        </p>
      )}
    </div>
  )
}
