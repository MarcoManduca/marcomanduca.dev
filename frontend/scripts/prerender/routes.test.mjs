import { describe, expect, it, vi } from 'vitest'

import messages from '../../src/i18n/locales/en.json' with { type: 'json' }

import { buildRoutes, routeFile, STATIC_ROUTES, translate } from './routes.mjs'

const project = {
  slug: 'deep-layers',
  title: { it: 'Strati', en: 'Deep Layers' },
  description: { it: 'Descrizione', en: 'Description' },
  cover: { src: '/images/projects/deep-layers/cover.webp' },
  updated_at: '2026-09-01T10:00:00+00:00',
}
const article = {
  slug: 'intro',
  title: { it: 'Introduzione', en: 'Intro' },
  excerpt: { it: 'Estratto', en: 'Excerpt' },
  updated_at: '2026-08-15T08:00:00+00:00',
}

describe('buildRoutes', () => {
  it('lists the static routes only when nothing is published', () => {
    const routes = buildRoutes({ projects: [], articles: [], messages })

    expect(routes.map(({ path }) => path)).toEqual(
      STATIC_ROUTES.map(({ path }) => path),
    )
  })

  it('opens /learning with the first published article', () => {
    const routes = buildRoutes({ projects: [], articles: [article], messages })

    expect(routes.map(({ path }) => path)).toContain('/learning')
  })

  it('takes the static meta from the English messages', () => {
    const [, about] = buildRoutes({ projects: [], articles: [], messages })

    expect(about.meta).toEqual({
      title: messages.about.title,
      description: messages.about.subtitle,
      type: 'website',
    })
  })

  it('builds a project page from its card', () => {
    const routes = buildRoutes({ projects: [project], articles: [], messages })

    expect(routes.at(-1)).toEqual({
      path: '/projects/deep-layers',
      priority: '0.7',
      lastmod: '2026-09-01',
      meta: {
        title: 'Deep Layers',
        description: 'Description',
        type: 'article',
        image: '/images/projects/deep-layers/cover.webp',
      },
    })
  })

  it('builds an article page from its summary excerpt', () => {
    const routes = buildRoutes({ projects: [], articles: [article], messages })

    expect(routes.at(-1)).toEqual({
      path: '/learning/intro',
      priority: '0.7',
      lastmod: '2026-08-15',
      meta: { title: 'Intro', description: 'Excerpt', type: 'article' },
    })
  })

  it.each(['../etc', 'Upper', 'a/b', '', undefined])(
    'skips an item whose slug is %s',
    (slug) => {
      vi.spyOn(console, 'warn').mockImplementation(() => {})

      const routes = buildRoutes({
        projects: [{ ...project, slug }],
        articles: [],
        messages,
      })

      expect(routes).toHaveLength(STATIC_ROUTES.length)
    },
  )
})

describe('translate', () => {
  it.each(
    STATIC_ROUTES.flatMap(({ title, description }) =>
      [title, description].filter(Boolean),
    ),
  )('resolves the static route key %s', (key) => {
    expect(translate(messages, key)).toEqual(expect.any(String))
  })

  it('throws on a missing key', () => {
    expect(() => translate(messages, 'nope.missing')).toThrow(
      'Missing i18n key: nope.missing',
    )
  })
})

describe('routeFile', () => {
  it.each([
    ['/', '_routes/index.html'],
    ['/about-me', '_routes/about-me.html'],
    ['/projects/deep-layers', '_routes/projects/deep-layers.html'],
  ])('maps %s to %s', (path, file) => {
    expect(routeFile(path)).toBe(file)
  })
})
