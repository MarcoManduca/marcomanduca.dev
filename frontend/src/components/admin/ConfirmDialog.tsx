import { useId, useLayoutEffect, useRef } from 'react'

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
 * Modal confirmation on the native `<dialog>` (role="alertdialog"), opened
 * with `showModal()`: the browser keeps focus inside it, makes the page
 * behind inert and turns Escape into a `cancel` event. Focus starts on the
 * safe "Cancel" action and returns to whatever opened the dialog. Render it
 * only while open.
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
  const dialogRef = useRef<HTMLDialogElement>(null)

  // A layout effect's cleanup runs while the dialog is still in the DOM, so
  // it is closed (and focus handed back) before React removes it.
  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const opener = document.activeElement
    dialog.showModal()
    // The first button is "Cancel": start there so Enter never deletes.
    dialog.querySelector('button')?.focus()
    return () => {
      dialog.close()
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onCancel={(event) => {
        // Escape: let the parent unmount the dialog rather than the browser.
        event.preventDefault()
        onCancel()
      }}
      className="w-[calc(100%-2rem)] max-w-sm rounded-xl border border-edge bg-surface p-6 text-body backdrop:bg-background/80"
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
    </dialog>
  )
}
