/**
 * Build-time pre-render for marcomanduca.dev (runs after `vite build`).
 *
 * Link previews (LinkedIn, Slack, X, ...) and crawlers that do not run JS
 * only see the HTML the server sends. So for every public route this writes
 * a copy of the built index.html carrying that route's meta tags to
 * dist/_routes/<path>.html, plus dist/sitemap.xml. The CloudFront function
 * serves those pages for the paths the deploy lists in its key value store
 * (infra/scripts/deploy-frontend.sh), and the SPA shell otherwise.
 *
 * Usage: node scripts/prerender/index.mjs
 * Env:
 *   SITE_URL          public origin (default https://marcomanduca.dev)
 *   API_URL           API base      (default `${SITE_URL}/api/v1`)
 *   PRERENDER_STRICT  1 = fail when the API can't be read (deploys)
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import messages from '../../src/i18n/locales/en.json' with { type: 'json' }

import { fetchCollection } from './api.mjs'
import { injectSeo, renderSeoTags } from './html.mjs'
import { buildRoutes, routeFile } from './routes.mjs'
import { renderSitemap } from './sitemap.mjs'

const SITE_URL = process.env.SITE_URL ?? 'https://marcomanduca.dev'
const API_URL = process.env.API_URL ?? `${SITE_URL}/api/v1`
const strict = process.env.PRERENDER_STRICT === '1'
const DIST = resolve(import.meta.dirname, '../../dist')

const [projects, articles] = await Promise.all([
  fetchCollection(API_URL, '/projects', { strict }),
  fetchCollection(API_URL, '/learning', { strict }),
])
const routes = buildRoutes({ projects, articles, messages })
const shell = readFileSync(resolve(DIST, 'index.html'), 'utf8')

for (const route of routes) {
  const target = resolve(DIST, routeFile(route.path))
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(
    target,
    injectSeo(shell, renderSeoTags(route.meta, SITE_URL, route.path)),
  )
}
writeFileSync(resolve(DIST, 'sitemap.xml'), renderSitemap(SITE_URL, routes))

console.log(
  `Pre-rendered ${routes.length} routes into dist/_routes and dist/sitemap.xml ` +
    `(${projects.length} projects, ${articles.length} articles).`,
)
