import { useTranslation } from 'react-i18next'

import { Input } from '@/components/ui/Input'

interface SlugFieldProps {
  slug: string
}

/** The read-only slug of an item being edited (it is generated on create). */
export const SlugField = ({ slug }: SlugFieldProps) => {
  const { t } = useTranslation()

  return (
    <Input
      label={t('admin.form.slug')}
      name="slug"
      defaultValue={slug}
      disabled
    />
  )
}
