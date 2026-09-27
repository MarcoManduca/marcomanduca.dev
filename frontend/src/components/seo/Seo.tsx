import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'

import { useLanguage } from '@/hooks/useLanguage'
import type { Language } from '@/types'
import { SITE_URL } from '@/utils/env'

interface SeoProps {
  title?: string
  description: string
  type?: 'website' | 'article'
  image?: string
  /** Keep the page out of search indexes (e.g. 404 pages). */
  noindex?: boolean
}

const SITE_NAME = 'marcomanduca.dev'

/** Default 1200x630 share image, shipped from `public/`. */
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`

/** OpenGraph locales, aligned with the date locales used by `formatDate`. */
const OG_LOCALE: Record<Language, string> = {
  en: 'en_GB',
  it: 'it_IT',
}

/** Per-page meta tags: title, description, canonical and OpenGraph. */
export const Seo = ({
  title,
  description,
  type = 'website',
  image,
  noindex = false,
}: SeoProps) => {
  const { pathname } = useLocation()
  const { language } = useLanguage()

  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME
  const canonical = `${SITE_URL}${pathname}`
  const alternateLanguage: Language = language === 'it' ? 'en' : 'it'
  // Images shipped with the site come as paths; OpenGraph needs a full URL.
  const shareImage = image?.startsWith('/')
    ? `${SITE_URL}${image}`
    : (image ?? DEFAULT_IMAGE)

  return (
    <Helmet>
      <html lang={language} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex" />}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content={OG_LOCALE[language]} />
      <meta
        property="og:locale:alternate"
        content={OG_LOCALE[alternateLanguage]}
      />
      <meta property="og:image" content={shareImage} />
      {!image && <meta property="og:image:width" content="1200" />}
      {!image && <meta property="og:image:height" content="630" />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={shareImage} />
    </Helmet>
  )
}
