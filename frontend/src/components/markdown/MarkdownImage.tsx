import { useState, type ComponentPropsWithoutRef } from 'react'

import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

import { ImageLightbox } from './ImageLightbox'

type MarkdownImageProps = ComponentPropsWithoutRef<'img'> & { node?: unknown }

/**
 * A content image as a framed figure with a caption (its title, else its
 * alt text) that opens full size on click.
 *
 * react-markdown puts images inside `<p>`, so only phrasing content is
 * rendered here (spans, a button); the lightbox is portalled to `<body>`.
 * The light frame makes charts exported on a white background look
 * intentional in the dark theme too.
 */
export const MarkdownImage = ({ src, alt = '', title }: MarkdownImageProps) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  if (typeof src !== 'string' || !src) return null
  const caption = title || alt

  return (
    <span className="my-6 block">
      <button
        type="button"
        aria-label={`${t('common.enlargeImage')}: ${alt}`}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="block w-full cursor-zoom-in rounded-xl border border-edge bg-brand-cream p-3 transition-colors hover:border-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="mx-auto max-h-[32rem] w-auto"
        />
      </button>
      {caption && (
        <span className="mt-2 block text-center text-sm text-muted">
          {caption}
        </span>
      )}
      {open &&
        createPortal(
          <ImageLightbox src={src} alt={alt} onClose={() => setOpen(false)} />,
          document.body,
        )}
    </span>
  )
}
