import { useCallback, useState } from 'react'

import { usePresignUploadMutation } from '@/services/mediaApi'
import type { MediaPrefix } from '@/types'

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export interface MediaUploadState {
  status: UploadStatus
  /** Final S3 object key of the uploaded file, once successful. */
  key: string | null
  /** Site path of an uploaded image (`/media/images/...`); null for the CV. */
  publicPath: string | null
  upload: (file: File, prefix: MediaPrefix) => Promise<void>
  reset: () => void
}

/** Request a presigned PUT URL from the backend, then upload the file to S3. */
export const useMediaUpload = (): MediaUploadState => {
  const [presignUpload] = usePresignUploadMutation()
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [key, setKey] = useState<string | null>(null)
  const [publicPath, setPublicPath] = useState<string | null>(null)

  const upload = useCallback(
    async (file: File, prefix: MediaPrefix) => {
      setStatus('uploading')
      setKey(null)
      setPublicPath(null)
      try {
        const presigned = await presignUpload({
          prefix,
          filename: file.name,
          content_type: file.type,
          content_length: file.size,
        }).unwrap()

        const response = await fetch(presigned.url, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        })
        if (!response.ok) throw new Error(`Upload failed: ${response.status}`)

        setKey(presigned.key)
        setPublicPath(presigned.public_path)
        setStatus('success')
      } catch {
        setStatus('error')
      }
    },
    [presignUpload],
  )

  const reset = useCallback(() => {
    setStatus('idle')
    setKey(null)
    setPublicPath(null)
  }, [])

  return { status, key, publicPath, upload, reset }
}
