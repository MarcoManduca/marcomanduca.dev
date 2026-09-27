import { useId } from 'react'

import { useTranslation } from 'react-i18next'

import { Textarea } from '@/components/ui/Textarea'

interface JsonFieldProps {
  /** Field name, labelled with the `admin.form.<name>` key. */
  name: string
  value: unknown
  hint: string
  rows?: number
}

/** A value edited as JSON text; it is parsed on submit. */
export const JsonField = ({ name, value, hint, rows = 4 }: JsonFieldProps) => {
  const { t } = useTranslation()
  const hintId = useId()

  return (
    <div className="flex flex-col gap-1 sm:col-span-2">
      <Textarea
        label={t(`admin.form.${name}`)}
        name={name}
        rows={rows}
        spellCheck={false}
        defaultValue={JSON.stringify(value, null, 2)}
        aria-describedby={hintId}
        className="font-mono text-xs"
      />
      <p id={hintId} className="text-xs text-muted">
        {hint}
      </p>
    </div>
  )
}
