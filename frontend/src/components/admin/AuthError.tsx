import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'

interface AuthErrorProps {
  onRetry: () => void
}

/** Sign-in failure message with a retry action (never an automatic loop). */
export const AuthError = ({ onRetry }: AuthErrorProps) => {
  const { t } = useTranslation()

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 py-20 text-center"
    >
      <h1 className="text-2xl font-bold text-heading">
        {t('auth.errorTitle')}
      </h1>
      <p className="text-muted">{t('auth.errorMessage')}</p>
      <Button onClick={onRetry}>{t('auth.retry')}</Button>
    </div>
  )
}
