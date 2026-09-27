import { useTranslation } from 'react-i18next'

import { GALLERY_ID, SECTION_TITLE } from '@/components/projects/detail/styles'
import { useLanguage } from '@/hooks/useLanguage'
import type { MediaItem } from '@/types'
import { safeMediaUrl } from '@/utils/safeUrl'

interface ProjectGalleryProps {
  media: MediaItem[]
}

/** Project images, each with its own alt text and optional caption. */
export const ProjectGallery = ({ media }: ProjectGalleryProps) => {
  const { t } = useTranslation()
  const { localize } = useLanguage()
  const shown = media.flatMap((item) => {
    const src = safeMediaUrl(item.src)
    return src ? [{ ...item, src }] : []
  })

  if (shown.length === 0) return null

  return (
    <section
      id={GALLERY_ID}
      aria-labelledby={`${GALLERY_ID}-title`}
      className="flex scroll-mt-24 flex-col gap-5"
    >
      <h2 id={`${GALLERY_ID}-title`} className={SECTION_TITLE}>
        {t('projects.gallery')}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((item) => (
          <figure key={item.src} className="flex flex-col gap-2.5">
            <img
              src={item.src}
              alt={localize(item.alt)}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full rounded-xl border border-edge object-cover object-top"
            />
            {item.caption && (
              <figcaption className="text-[15px] text-muted">
                {localize(item.caption)}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  )
}
