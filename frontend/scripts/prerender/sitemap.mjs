/** sitemap.xml rendering for the pre-rendered routes. */

const XML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
}

/** Escape a value for use as XML text content. */
export const escapeXml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => XML_ENTITIES[char])

const toUrlEntry = (siteUrl, { path, priority, lastmod }) =>
  [
    '  <url>',
    `    <loc>${escapeXml(`${siteUrl}${path}`)}</loc>`,
    lastmod && `    <lastmod>${escapeXml(lastmod)}</lastmod>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n')

/**
 * Render the sitemap of the given routes.
 *
 * @param {string} siteUrl Public origin, e.g. https://marcomanduca.dev
 * @param {{ path: string, priority: string, lastmod?: string }[]} routes
 * @returns {string}
 */
export const renderSitemap = (
  siteUrl,
  routes,
) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => toUrlEntry(siteUrl, route)).join('\n')}
</urlset>
`
