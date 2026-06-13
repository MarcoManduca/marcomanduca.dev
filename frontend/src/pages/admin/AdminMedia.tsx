import { useState, type FormEvent } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { useMediaUpload } from '@/hooks/useMediaUpload'
import type { MediaPrefix } from '@/types'
import { MEDIA_PREFIXES } from '@/types'

export const AdminMedia = () => {
  const { t } = useTranslation()
  const { status, key, upload } = useMediaUpload()
  const [prefix, setPrefix] = useState<MediaPrefix>('images/projects/')
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (file) void upload(file, prefix)
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-heading">
        {t('admin.media.title')}
      </h1>
      <form
        onSubmit={handleSubmit}
        className="mt-6 flex max-w-md flex-col gap-4"
      >
        <Select
          label={t('admin.media.folder')}
          options={MEDIA_PREFIXES.map((value) => ({ value, label: value }))}
          value={prefix}
          onChange={(e) => setPrefix(e.target.value as MediaPrefix)}
        />
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="media-file"
            className="text-sm font-medium text-heading"
          >
            {t('admin.media.file')}
          </label>
          <input
            id="media-file"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm text-body file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
          />
        </div>
        <Button
          type="submit"
          disabled={!file || status === 'uploading'}
          className="self-start"
        >
          {status === 'uploading'
            ? t('admin.media.uploading')
            : t('admin.media.upload')}
        </Button>
      </form>
      {status === 'success' && key && (
        <div
          role="status"
          className="mt-6 rounded-lg bg-emerald-500/15 p-4 text-sm"
        >
          <p className="text-emerald-400">{t('admin.media.success')}</p>
          <p className="mt-2 font-mono text-xs text-body">
            {t('admin.media.objectKey')}: {key}
          </p>
        </div>
      )}
      {status === 'error' && (
        <p
          role="alert"
          className="mt-6 rounded-lg bg-red-500/15 p-4 text-sm text-red-400"
        >
          {t('admin.media.error')}
        </p>
      )}
    </>
  )
}
