import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'

interface SessionExpiredBannerProps {
  onSignIn: () => void
}

/**
 * Shown above the admin page when the session ends while it is open. The
 * page (and any form being edited) stays mounted: signing in again is the
 * admin's choice, never an automatic redirect.
 */
export const SessionExpiredBanner = ({
  onSignIn,
}: SessionExpiredBannerProps) => {
  const { t } = useTranslation()

  return (
    <div
      role="alert"
      className="sticky top-0 z-50 flex flex-wrap items-center justify-center gap-3 bg-warm/15 px-4 py-3 text-center text-sm text-heading backdrop-blur"
    >
      <p>{t('auth.sessionExpired')}</p>
      <Button onClick={onSignIn}>{t('auth.signInAgain')}</Button>
    </div>
  )
}
