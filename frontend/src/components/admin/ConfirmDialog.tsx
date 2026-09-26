import { useEffect, useId, useRef } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  isPending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Minimal modal confirmation (role="alertdialog"). Focus starts on the safe
 * "Cancel" action and Escape dismisses it. Render it only while open.
 */
export const ConfirmDialog = ({
  title,
  message,
  confirmLabel,
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const { t } = useTranslation()
  const titleId = useId()
  const messageId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  // The first button is "Cancel": start there so Enter never deletes.
  useEffect(() => dialogRef.current?.querySelector('button')?.focus(), [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        onKeyDown={(event) => event.key === 'Escape' && onCancel()}
        className="w-full max-w-sm rounded-xl border border-edge bg-surface p-6"
      >
        <h2 id={titleId} className="text-lg font-semibold text-heading">
          {title}
        </h2>
        <p id={messageId} className="mt-2 text-sm text-muted">
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            {t('admin.actions.cancel')}
          </Button>
          <Button variant="danger" disabled={isPending} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
