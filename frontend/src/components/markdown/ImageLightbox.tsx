import { useLayoutEffect, useRef } from 'react'

import { useTranslation } from 'react-i18next'

interface ImageLightboxProps {
  src: string
  alt: string
  onClose: () => void
}

/**
 * Full-size view of a content image on the native modal `<dialog>`: the
 * browser traps focus and turns Escape into `cancel`. A click on the
 * backdrop or the close button dismisses it too, and focus goes back to
 * whatever opened it. Render it only while open.
 */
export const ImageLightbox = ({ src, alt, onClose }: ImageLightboxProps) => {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDialogElement>(null)

  // Layout effect: the cleanup runs while the dialog is still in the DOM.
  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const opener = document.activeElement
    dialog.showModal()
    return () => {
      dialog.close()
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-label={alt || t('common.enlargeImage')}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        // The dialog itself is only hit outside the image: the backdrop.
        if (event.target === event.currentTarget) onClose()
      }}
      className="max-h-[95vh] max-w-[95vw] overflow-auto rounded-2xl border border-edge bg-brand-cream p-4 pt-12 backdrop:bg-background/85"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 rounded-lg px-3 py-1 font-display text-sm font-bold uppercase tracking-wider text-brand-ink hover:bg-brand-ink/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-ink"
      >
        {t('common.close')}
      </button>
      <img src={src} alt={alt} className="mx-auto max-h-[80vh] w-auto" />
    </dialog>
  )
}
