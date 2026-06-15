/**
 * Static sitemap generator for marcomanduca.dev.
 *
 * Covers the public static routes of the SPA. Dynamic slug routes
 * (/projects/:slug, /learning/:slug) are intentionally excluded: they
 * require the backend at build time and can be appended by the deploy
 * pipeline if needed.
 *
 * Usage: node scripts/generate-sitemap.mjs
 */
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SITE_URL = process.env.SITE_URL ?? 'https://marcomanduca.dev'

const STATIC_ROUTES = [
  { path: '/', priority: '1.0' },
  { path: '/about-me', priority: '0.8' },
  { path: '/projects', priority: '0.9' },
  { path: '/learning', priority: '0.9' },
  { path: '/contacts', priority: '0.6' },
]

const today = new Date().toISOString().split('T')[0]

const urls = STATIC_ROUTES.map(
  ({ path, priority }) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
    <priority>${priority}</priority>
  </url>`,
).join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

const target = resolve(import.meta.dirname, '../public/sitemap.xml')
writeFileSync(target, xml)
console.log(`Sitemap written to ${target} (${STATIC_ROUTES.length} routes)`)
