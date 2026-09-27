import { useId, type ReactNode } from 'react'

import { LABEL, PANEL } from './styles'

interface AsidePanelProps {
  title: string
  /** `nav` for the table of contents, else a plain section. */
  as?: 'nav' | 'section'
  children: ReactNode
}

/** A titled panel of the side column. */
export const AsidePanel = ({
  title,
  as: Tag = 'section',
  children,
}: AsidePanelProps) => {
  const titleId = useId()

  return (
    <Tag aria-labelledby={titleId} className={PANEL}>
      <h2 id={titleId} className={LABEL}>
        {title}
      </h2>
      {children}
    </Tag>
  )
}
