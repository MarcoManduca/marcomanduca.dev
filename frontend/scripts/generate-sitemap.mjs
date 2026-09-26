/**
 * Sitemap generator for marcomanduca.dev.
 *
 * Covers the public static routes plus the dynamic project and learning
 * detail pages, fetched from the live API at build time (through CloudFront,
 * which injects the origin-verify header). The API returns only published
 * public content, so drafts and the admin area are never included.
 *
 * The API call degrades gracefully: if the backend is unreachable the build
 * still succeeds with the static routes only.
 *
 * Usage: node scripts/generate-sitemap.mjs
 * Env:
 *   SITE_URL  public origin (default https://marcomanduca.dev)
 *   API_URL   API base      (default `${SITE_URL}/api/v1`)
 */
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SITE_URL = process.env.SITE_URL ?? 'https://marcomanduca.dev'
const API_URL = process.env.API_URL ?? `${SITE_URL}/api/v1`

// Static routes carry no <lastmod>: the build date is not a content change
// and would only teach crawlers to ignore the field.
const STATIC_ROUTES = [
  { path: '/', priority: '1.0' },
  { path: '/about-me', priority: '0.8' },
  { path: '/projects', priority: '0.9' },
  { path: '/learning', priority: '0.9' },
  { path: '/contacts', priority: '0.6' },
  // Indexable (the page sets no noindex), but of little search value.
  { path: '/privacy-policy', priority: '0.2' },
]

const XML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
}

/** Escape a value for use as XML text content. */
const escapeXml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => XML_ENTITIES[char])

/** ISO timestamp -> YYYY-MM-DD, or undefined when missing. */
const dateOf = (value) => (value ? String(value).split('T')[0] : undefined)

/** Fetch a public collection; return [] on any failure so the build never breaks. */
async function fetchCollection(path) {
  try {
    const response = await fetch(`${API_URL}${path}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const items = await response.json()
    return Array.isArray(items) ? items : []
  } catch (error) {
    console.warn(
      `Sitemap: could not fetch ${path} (${error.message}); skipping those URLs.`,
    )
    return []
  }
}

const [projects, articles] = await Promise.all([
  fetchCollection('/projects'),
  fetchCollection('/learning'),
])

const dynamicRoutes = [
  ...projects.map((item) => ({
    path: `/projects/${encodeURIComponent(item.slug)}`,
    priority: '0.7',
    lastmod: dateOf(item.updated_at),
  })),
  ...articles.map((item) => ({
    path: `/learning/${encodeURIComponent(item.slug)}`,
    priority: '0.7',
    lastmod: dateOf(item.updated_at),
  })),
]

const routes = [...STATIC_ROUTES, ...dynamicRoutes]

const toUrlEntry = ({ path, priority, lastmod }) =>
  [
    '  <url>',
    `    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>`,
    lastmod && `    <lastmod>${escapeXml(lastmod)}</lastmod>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n')

const urls = routes.map(toUrlEntry).join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

const target = resolve(import.meta.dirname, '../public/sitemap.xml')
writeFileSync(target, xml)
console.log(
  `Sitemap written to ${target} ` +
    `(${routes.length} URLs: ${STATIC_ROUTES.length} static, ${dynamicRoutes.length} dynamic)`,
)
