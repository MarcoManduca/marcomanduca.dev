import { useTranslation } from 'react-i18next'

import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import type { LocalizedText } from '@/types'

interface BilingualFieldsProps {
  /**
   * Field base name: inputs are named `<name>It` / `<name>En` and labelled
   * with the `admin.form.<name>It` / `admin.form.<name>En` keys.
   */
  name: string
  defaultValue?: LocalizedText
  /** Render textareas with this many rows instead of single-line inputs. */
  rows?: number
  required?: boolean
}

/** Side-by-side IT/EN pair of inputs (or textareas) for a localized field. */
export const BilingualFields = ({
  name,
  defaultValue,
  rows,
  required,
}: BilingualFieldsProps) => {
  const { t } = useTranslation()
  const Field = rows ? Textarea : Input

  return (
    <>
      <Field
        label={t(`admin.form.${name}It`)}
        name={`${name}It`}
        rows={rows}
        defaultValue={defaultValue?.it}
        required={required}
      />
      <Field
        label={t(`admin.form.${name}En`)}
        name={`${name}En`}
        rows={rows}
        defaultValue={defaultValue?.en}
        required={required}
      />
    </>
  )
}
