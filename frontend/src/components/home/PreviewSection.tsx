import type { ReactNode } from 'react'

import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

interface PreviewSectionProps {
  title: string
  viewAllTo: string
  children: ReactNode
}

/** Home section showing a small grid of cards with a "view all" link. */
export const PreviewSection = ({
  title,
  viewAllTo,
  children,
}: PreviewSectionProps) => {
  const { t } = useTranslation()

  return (
    <section className="py-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-heading">{title}</h2>
        <Link
          to={viewAllTo}
          className="text-sm font-medium text-accent hover:text-accent-hover"
        >
          {t('common.viewAll')} →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}
