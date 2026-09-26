import { useTranslation } from 'react-i18next'

import { Button } from './Button'

interface ErrorStateProps {
  onRetry: () => void
}

/** Generic, recoverable error message with a retry action. */
export const ErrorState = ({ onRetry }: ErrorStateProps) => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <p role="alert" className="text-body">
        {t('common.error')}
      </p>
      <Button type="button" variant="secondary" onClick={onRetry}>
        {t('common.retry')}
      </Button>
    </div>
  )
}
