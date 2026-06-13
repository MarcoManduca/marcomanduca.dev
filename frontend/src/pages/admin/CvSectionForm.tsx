import type { FormEvent } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { useUpdateCvSectionMutation } from '@/services/cvApi'
import type { CvContent, CvSectionId, LocalizedContent } from '@/types'

interface CvSectionFormProps {
  section: CvSectionId
  content: LocalizedContent
}

/** Serialize content for editing: objects/lists as JSON, strings as-is. */
const toEditable = (value: CvContent): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  return JSON.stringify(value, null, 2)
}

/** Parse edited text back to content: try JSON, fall back to plain string. */
const fromEditable = (raw: string): CvContent => {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  try {
    return JSON.parse(trimmed) as CvContent
  } catch {
    return raw
  }
}

/** Edit one CV section's bilingual content as free-form JSON / text. */
export const CvSectionForm = ({ section, content }: CvSectionFormProps) => {
  const { t } = useTranslation()
  const [updateCvSection, { isLoading, isSuccess }] =
    useUpdateCvSectionMutation()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)

    void updateCvSection({
      section,
      body: {
        content: {
          it: fromEditable(String(data.get('it'))),
          en: fromEditable(String(data.get('en'))),
        },
      },
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-edge bg-surface p-6"
    >
      <p className="mb-4 font-mono text-xs uppercase text-muted">{section}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Textarea
          label={t('admin.cv.itLabel')}
          name="it"
          rows={8}
          className="font-mono text-xs"
          defaultValue={toEditable(content.it)}
        />
        <Textarea
          label={t('admin.cv.enLabel')}
          name="en"
          rows={8}
          className="font-mono text-xs"
          defaultValue={toEditable(content.en)}
        />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? t('admin.actions.saving') : t('admin.actions.save')}
        </Button>
        {isSuccess && (
          <span className="text-sm text-emerald-400">
            {t('admin.actions.saved')}
          </span>
        )}
      </div>
    </form>
  )
}
