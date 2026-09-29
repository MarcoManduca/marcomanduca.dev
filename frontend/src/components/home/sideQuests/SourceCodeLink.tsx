import { useTranslation } from 'react-i18next'

import { LINK_ICONS } from '@/components/projects/detail/icons'
import { StrokeIcon } from '@/components/ui/StrokeIcon'

interface SourceCodeLinkProps {
  href: string
  /** -1 on the cards below the top one, which must not take focus. */
  tabIndex?: number
}

/** Icon button to a project's repository, opened in a new tab. */
export const SourceCodeLink = ({ href, tabIndex }: SourceCodeLinkProps) => {
  const { t } = useTranslation()

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={tabIndex}
      draggable={false}
      aria-label={t('home.sideQuests.code')}
      className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-edge text-body transition-colors hover:border-highlight hover:text-highlight"
    >
      <StrokeIcon paths={LINK_ICONS.repo} className="h-5 w-5" />
    </a>
  )
}
