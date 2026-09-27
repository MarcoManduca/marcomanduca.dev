import { useTranslation } from 'react-i18next'

import type { Heading } from '@/utils/markdownHeadings'

import { AsidePanel } from './AsidePanel'
import { GALLERY_ID, LAB_ID } from './styles'

interface ProjectTocProps {
  headings: Heading[]
  hasLab: boolean
  hasGallery: boolean
}

/** Links to the sections of the long read, the gallery and the lab. */
export const ProjectToc = ({
  headings,
  hasLab,
  hasGallery,
}: ProjectTocProps) => {
  const { t } = useTranslation()
  // In page order: the long read, the gallery, then the lab.
  const entries = [
    ...headings,
    ...(hasGallery ? [{ id: GALLERY_ID, text: t('projects.gallery') }] : []),
    ...(hasLab ? [{ id: LAB_ID, text: t('projects.lab.title') }] : []),
  ]

  if (entries.length < 2) return null

  return (
    <AsidePanel as="nav" title={t('projects.detail.toc')}>
      <ul className="-my-1 flex flex-col">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className="flex min-h-9 items-center text-body hover:text-highlight"
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </AsidePanel>
  )
}
