import { useTranslation } from 'react-i18next'

import { useGetTechnologiesQuery } from '@/services/technologiesApi'
import { groupTechnologies } from '@/utils/groupTechnologies'

import { AsidePanel } from './AsidePanel'

interface ProjectStackProps {
  technologies: string[]
}

/** Every technology of the project, grouped by its registry category. */
export const ProjectStack = ({ technologies }: ProjectStackProps) => {
  const { t } = useTranslation()
  const { data: registry = [] } = useGetTechnologiesQuery()

  if (technologies.length === 0) return null

  return (
    <AsidePanel title={t('projects.detail.stack')}>
      {groupTechnologies(technologies, registry).map(({ category, names }) => (
        <div key={category} className="flex flex-col gap-1.5">
          <h3 className="font-sans text-[13px] font-normal normal-case tracking-normal text-muted">
            {t(`technologyCategories.${category}`, { defaultValue: category })}
          </h3>
          <ul className="flex flex-wrap gap-1.5">
            {names.map((name) => (
              <li
                key={name}
                className="rounded-md border border-edge px-2 py-1 text-[13px] text-body"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </AsidePanel>
  )
}
