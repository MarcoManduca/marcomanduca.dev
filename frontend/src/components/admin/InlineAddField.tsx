import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface InlineAddFieldProps {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  onAdd: () => void
  isPending?: boolean
}

/** Text input with an "Add" button; Enter adds without submitting the form. */
export const InlineAddField = ({
  label,
  placeholder,
  value,
  onChange,
  onAdd,
  isPending = false,
}: InlineAddFieldProps) => {
  const { t } = useTranslation()

  return (
    <div className="mt-3 flex items-end gap-2">
      <Input
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return
          event.preventDefault()
          if (!isPending) onAdd()
        }}
        placeholder={placeholder}
      />
      <Button
        type="button"
        variant="secondary"
        disabled={isPending || !value.trim()}
        onClick={onAdd}
      >
        {t('admin.actions.add')}
      </Button>
    </div>
  )
}
