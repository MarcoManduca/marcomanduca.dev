import { useTranslation } from 'react-i18next'

import { cn } from '@/utils/cn'

interface SpinnerProps {
  className?: string
}

export const Spinner = ({ className }: SpinnerProps) => {
  const { t } = useTranslation()

  return (
    <div
      role="status"
      aria-label={t('common.loading')}
      className={cn('flex items-center justify-center py-12', className)}
    >
      <div
        aria-hidden
        className="h-8 w-8 animate-spin rounded-full border-2 border-edge border-t-accent motion-reduce:animate-[spin_2s_linear_infinite]"
      />
    </div>
  )
}
