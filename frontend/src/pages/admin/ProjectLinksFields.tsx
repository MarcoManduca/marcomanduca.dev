import { useTranslation } from 'react-i18next'

import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import type { Project } from '@/types'

interface ProjectLinksFieldsProps {
  initial: Project | null
}

/** GitHub / demo URLs and the image list of the project form. */
export const ProjectLinksFields = ({ initial }: ProjectLinksFieldsProps) => {
  const { t } = useTranslation()

  return (
    <>
      <Input
        label={t('admin.form.githubUrl')}
        name="githubUrl"
        type="url"
        defaultValue={initial?.github_url ?? ''}
        required
      />
      <Input
        label={t('admin.form.demoUrl')}
        name="demoUrl"
        type="url"
        defaultValue={initial?.demo_url ?? ''}
      />
      <div className="sm:col-span-2">
        <Textarea
          label={t('admin.form.images')}
          name="images"
          rows={3}
          defaultValue={initial?.images.join('\n')}
        />
      </div>
    </>
  )
}
