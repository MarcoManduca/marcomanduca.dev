/**
 * The public routes the build pre-renders and lists in the sitemap.
 *
 * Every route carries the meta tags <Seo /> renders for it at runtime, in
 * English (the i18n fallback language: both languages share one URL). Keep
 * STATIC_ROUTES in sync with the <Seo> props of the pages in src/pages.
 */

/** Slugs the backend generates (src/utils/slugify.py). */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Static routes with the i18n keys of their title and description. Static
 * routes carry no <lastmod>: the build date is not a content change and
 * would only teach crawlers to ignore the field.
 */
export const STATIC_ROUTES = [
  { path: '/', priority: '1.0', description: 'home.heroTagline' },
  {
    path: '/about-me',
    priority: '0.8',
    title: 'about.title',
    description: 'about.subtitle',
  },
  {
    path: '/projects',
    priority: '0.9',
    title: 'projects.title',
    description: 'projects.subtitle',
  },
  {
    path: '/contacts',
    priority: '0.6',
    title: 'contacts.title',
    description: 'contacts.subtitle',
  },
  // Indexable (the page sets no noindex), but of little search value.
  {
    path: '/privacy-policy',
    priority: '0.2',
    title: 'privacy.title',
    description: 'privacy.subtitle',
  },
]

/** The Learning index, listed once an article is published. */
const LEARNING_ROUTE = {
  path: '/learning',
  priority: '0.9',
  title: 'learning.title',
  description: 'learning.subtitle',
}

/**
 * Look up a dotted i18n key.
 *
 * @param {Record<string, unknown>} messages Locale messages (en.json)
 * @param {string} key e.g. about.title
 * @returns {string}
 */
export const translate = (messages, key) => {
  const value = key
    .split('.')
    .reduce((node, part) => (node == null ? undefined : node[part]), messages)
  if (typeof value !== 'string') throw new Error(`Missing i18n key: ${key}`)
  return value
}

/** ISO timestamp -> YYYY-MM-DD, or undefined when missing. */
const dateOf = (value) => (value ? String(value).split('T')[0] : undefined)

/** Keep only items whose slug is safe to use as a URL and a file path. */
const withValidSlug = (items, kind) =>
  items.filter((item) => {
    const valid = typeof item?.slug === 'string' && SLUG_PATTERN.test(item.slug)
    if (!valid)
      console.warn(`Pre-render: skipping ${kind} with slug ${item?.slug}`)
    return valid
  })

/**
 * @typedef {{ title?: string, description: string, type: 'website' | 'article', image?: string }} RouteMeta
 * @typedef {{ path: string, priority: string, lastmod?: string, meta: RouteMeta }} Route
 */

/**
 * Build every public route with its sitemap fields and meta tags.
 *
 * @param {{ projects: any[], articles: any[], messages: Record<string, unknown> }} input
 *   Published projects (ProjectCard), articles (ArticleSummary) and the
 *   English messages.
 * @returns {Route[]}
 */
export const buildRoutes = ({ projects, articles, messages }) => {
  // The section opens with its first published article (see useLearningOpen).
  const staticRoutes = articles.length
    ? [...STATIC_ROUTES.slice(0, 3), LEARNING_ROUTE, ...STATIC_ROUTES.slice(3)]
    : STATIC_ROUTES

  return [
    ...staticRoutes.map(({ path, priority, title, description }) => ({
      path,
      priority,
      meta: {
        title: title && translate(messages, title),
        description: translate(messages, description),
        type: 'website',
      },
    })),
    ...withValidSlug(projects, 'project').map((project) => ({
      path: `/projects/${project.slug}`,
      priority: '0.7',
      lastmod: dateOf(project.updated_at),
      meta: {
        title: project.title?.en,
        description: project.description?.en ?? '',
        type: 'article',
        image: project.cover?.src,
      },
    })),
    ...withValidSlug(articles, 'article').map((article) => ({
      path: `/learning/${article.slug}`,
      priority: '0.7',
      lastmod: dateOf(article.updated_at),
      meta: {
        title: article.title?.en,
        description: article.excerpt?.en ?? '',
        type: 'article',
      },
    })),
  ]
}

/**
 * Bucket key of a route's pre-rendered page. The CloudFront function
 * (infra/terraform/modules/cdn/functions/site_viewer_request.js) and the
 * local nginx config map request paths to the same files.
 *
 * @param {string} path Route path, e.g. /projects/foo
 * @returns {string} e.g. _routes/projects/foo.html
 */
export const routeFile = (path) =>
  `_routes${path === '/' ? '/index' : path}.html`
