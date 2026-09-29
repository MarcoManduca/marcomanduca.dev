/**
 * Per-route meta tags spliced into the built index.html.
 *
 * renderSeoTags() mirrors what src/components/seo/Seo.tsx renders at
 * runtime (same title format, canonical, OpenGraph and Twitter tags), and
 * marks every tag with data-rh so react-helmet-async takes them over once
 * the app runs. Keep the two in sync.
 */

export const SITE_NAME = 'marcomanduca.dev'
export const SEO_START = '<!-- seo:start -->'
export const SEO_END = '<!-- seo:end -->'

const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Escape a value for HTML text and double-quoted attributes. */
export const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => HTML_ENTITIES[char])

const meta = (attribute, name, content) =>
  `<meta data-rh="true" ${attribute}="${name}" content="${escapeHtml(content)}" />`

/**
 * Render the head tags of one route.
 *
 * @param {{ title?: string, description: string, type: string, image?: string }} route
 *   Route meta (see routes.mjs).
 * @param {string} siteUrl Public origin
 * @param {string} path Route path, e.g. /projects/foo
 * @returns {string}
 */
export const renderSeoTags = (
  { title, description, type, image },
  siteUrl,
  path,
) => {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME
  const canonical = `${siteUrl}${path}`
  // Images shipped with the site come as paths; OpenGraph needs a full URL.
  const shareImage = image?.startsWith('/')
    ? `${siteUrl}${image}`
    : (image ?? `${siteUrl}/og-image.png`)

  return [
    `<title>${escapeHtml(fullTitle)}</title>`,
    meta('name', 'description', description),
    `<link data-rh="true" rel="canonical" href="${escapeHtml(canonical)}" />`,
    meta('property', 'og:site_name', SITE_NAME),
    meta('property', 'og:title', fullTitle),
    meta('property', 'og:description', description),
    meta('property', 'og:type', type),
    meta('property', 'og:url', canonical),
    meta('property', 'og:locale', 'en_GB'),
    meta('property', 'og:locale:alternate', 'it_IT'),
    meta('property', 'og:image', shareImage),
    ...(image
      ? []
      : [
          meta('property', 'og:image:width', '1200'),
          meta('property', 'og:image:height', '630'),
        ]),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', fullTitle),
    meta('name', 'twitter:description', description),
    meta('name', 'twitter:image', shareImage),
  ].join('\n    ')
}

/**
 * Replace the generic meta block of the SPA shell with a route's tags.
 *
 * Spliced with slice(), not String.replace(): a title containing "$&" would
 * otherwise be rewritten as a replacement pattern.
 *
 * @param {string} shell Built index.html
 * @param {string} tags Output of renderSeoTags()
 * @returns {string}
 */
export const injectSeo = (shell, tags) => {
  const start = shell.indexOf(SEO_START)
  const end = shell.indexOf(SEO_END)
  const single =
    start !== -1 &&
    end > start &&
    shell.indexOf(SEO_START, start + 1) === -1 &&
    shell.indexOf(SEO_END, end + 1) === -1
  if (!single) {
    throw new Error(`index.html must contain ${SEO_START} … ${SEO_END} once`)
  }
  return `${shell.slice(0, start)}${tags}${shell.slice(end + SEO_END.length)}`
}
