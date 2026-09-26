import { useTranslation } from 'react-i18next'

interface ProjectGalleryProps {
  title: string
  images: string[]
}

/** Project screenshots, each with a distinct, position-aware alt text. */
export const ProjectGallery = ({ title, images }: ProjectGalleryProps) => {
  const { t } = useTranslation()

  if (images.length === 0) return null

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-semibold text-heading">
        {t('projects.gallery')}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {images.map((src, index) => (
          <img
            key={src}
            src={src}
            alt={t('projects.galleryImageAlt', {
              title,
              index: index + 1,
              total: images.length,
            })}
            loading="lazy"
            decoding="async"
            className="rounded-lg border border-edge"
          />
        ))}
      </div>
    </section>
  )
}
