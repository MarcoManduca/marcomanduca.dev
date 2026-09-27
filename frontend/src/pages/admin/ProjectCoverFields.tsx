import { useTranslation } from 'react-i18next'

import { BilingualFields } from '@/components/admin/BilingualFields'
import { Input } from '@/components/ui/Input'
import type { MediaItem } from '@/types'

interface ProjectCoverFieldsProps {
  cover: MediaItem | null
}

/** Cover image of the card and its alt text; a blank URL means none. */
export const ProjectCoverFields = ({ cover }: ProjectCoverFieldsProps) => {
  const { t } = useTranslation()

  return (
    <>
      <div className="sm:col-span-2">
        <Input
          label={t('admin.form.coverSrc')}
          name="coverSrc"
          defaultValue={cover?.src ?? ''}
        />
      </div>
      <BilingualFields name="coverAlt" defaultValue={cover?.alt} />
    </>
  )
}
