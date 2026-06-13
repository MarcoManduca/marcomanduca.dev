import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'

import { useLanguage } from '@/hooks/useLanguage'
import { SITE_URL } from '@/utils/env'

interface SeoProps {
  title: string
  description: string
  type?: 'website' | 'article'
  image?: string
}

const SITE_NAME = 'marcomanduca.dev'

/** Per-page meta tags: title, description, canonical and OpenGraph. */
export const Seo = ({
  title,
  description,
  type = 'website',
  image,
}: SeoProps) => {
  const { pathname } = useLocation()
  const { language } = useLanguage()

  const fullTitle = `${title} — ${SITE_NAME}`
  const canonical = `${SITE_URL}${pathname}`

  return (
    <Helmet>
      <html lang={language} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta
        property="og:locale"
        content={language === 'it' ? 'it_IT' : 'en_US'}
      />
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  )
}
