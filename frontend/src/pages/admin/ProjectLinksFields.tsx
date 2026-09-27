import { useTranslation } from 'react-i18next'

import { Input } from '@/components/ui/Input'
import type { ProjectLink } from '@/types'
import { LINK_KINDS } from '@/types'

interface ProjectLinksFieldsProps {
  links: ProjectLink[]
}

/** One URL per link kind (repository, paper, live site...); blank = none. */
export const ProjectLinksFields = ({ links }: ProjectLinksFieldsProps) => {
  const { t } = useTranslation()

  return (
    <>
      {LINK_KINDS.map((kind) => (
        <Input
          key={kind}
          label={t('admin.form.linkUrl', { kind: t(`projectLinks.${kind}`) })}
          name={`link-${kind}`}
          type="url"
          defaultValue={links.find((link) => link.kind === kind)?.url ?? ''}
        />
      ))}
    </>
  )
}
