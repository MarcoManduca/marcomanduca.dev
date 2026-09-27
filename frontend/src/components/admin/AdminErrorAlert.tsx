import { useTranslation } from 'react-i18next'

import { cn } from '@/utils/cn'

import { errorMessageKey } from './errorMessageKey'

interface AdminErrorAlertProps {
  /** What failed, e.g. "Could not save the changes." */
  title: string
  /** The caught error; nothing is rendered while it is null or undefined. */
  error: unknown
  className?: string
}

/** Accessible (role="alert") message for a failed admin action. */
export const AdminErrorAlert = ({
  title,
  error,
  className,
}: AdminErrorAlertProps) => {
  const { t } = useTranslation()
  if (error == null) return null

  return (
    <p
      role="alert"
      className={cn(
        'rounded-lg bg-danger/15 p-4 text-sm text-danger',
        className,
      )}
    >
      {title} {t(errorMessageKey(error))}
    </p>
  )
}
