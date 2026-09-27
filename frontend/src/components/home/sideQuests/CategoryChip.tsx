import { useTranslation } from 'react-i18next'

import { cn } from '@/utils/cn'

import { categoryStyle } from './categoryStyles'

interface CategoryChipProps {
  category: string
}

/** Project type in the corner of a side quest card. */
export const CategoryChip = ({ category }: CategoryChipProps) => {
  const { t } = useTranslation()
  const { chip, icon } = categoryStyle(category)

  return (
    <span
      className={cn(
        'inline-flex h-[26px] items-center gap-1.5 rounded-full px-2.5 font-display text-[13px] font-bold uppercase tracking-[0.08em]',
        chip,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-3.5 w-3.5"
      >
        {icon.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
      {t(`projectCategories.${category}`, {
        defaultValue: t('projectCategories.other'),
      })}
    </span>
  )
}
