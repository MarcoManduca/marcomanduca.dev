import { useTranslation } from 'react-i18next'

import { RowActions } from '@/components/admin/RowActions'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { useLanguage } from '@/hooks/useLanguage'
import type { Project } from '@/types'

interface ProjectRowProps {
  project: Project
  onEdit: () => void
  onDelete: () => void
}

export const ProjectRow = ({ project, onEdit, onDelete }: ProjectRowProps) => {
  const { t } = useTranslation()
  const { localize } = useLanguage()
  const title = localize(project.title)

  return (
    <tr className="border-b border-edge/50">
      <td className="py-3 pr-4 font-medium text-heading">{title}</td>
      <td className="py-3 pr-4">
        {t(`projectCategories.${project.category}`)}
      </td>
      <td className="py-3 pr-4">
        <StatusBadge status={project.status} />
      </td>
      <RowActions title={title} onEdit={onEdit} onDelete={onDelete} />
    </tr>
  )
}
