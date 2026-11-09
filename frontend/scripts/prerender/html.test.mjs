import { describe, expect, it } from 'vitest'

import {
  escapeHtml,
  injectSeo,
  jsonLdScript,
  personJsonLd,
  renderSeoTags,
  SEO_END,
  SEO_START,
} from './html.mjs'

const SITE = 'https://marcomanduca.dev'
const SHELL = `<head>\n${SEO_START}<title>generic</title>${SEO_END}\n<script src="/assets/app-1a2b.js"></script></head>`

describe('escapeHtml', () => {
  it('escapes markup and both quote styles', () => {
    expect(escapeHtml(`<a href="x">Tom's & co</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom&#39;s &amp; co&lt;/a&gt;',
    )
  })
})

describe('jsonLdScript', () => {
  it('escapes < so a value cannot close the script element', () => {
    const script = jsonLdScript({ name: '</script><script>x</script>' })

    expect(script.match(/<\/script>/g)).toHaveLength(1)
    expect(script).toContain('\\u003c/script>')
  })
})

describe('renderSeoTags', () => {
  it('renders the titled page tags like <Seo />', () => {
    const tags = renderSeoTags(
      { title: 'Projects', description: 'Things I built.', type: 'website' },
      SITE,
      '/projects',
    )

    expect(tags).toContain('<title>Projects — Marco Manduca</title>')
    expect(tags).toContain(
      `<link data-rh="true" rel="canonical" href="${SITE}/projects" />`,
    )
    expect(tags).toContain(`property="og:url" content="${SITE}/projects"`)
    expect(tags).toContain(
      'name="twitter:description" content="Things I built."',
    )
  })

  it('titles the home page with the name and role', () => {
    const tags = renderSeoTags(
      { description: 'Home', type: 'website' },
      SITE,
      '/',
    )

    expect(tags).toContain('<title>Marco Manduca — Data Scientist</title>')
    expect(tags).toContain('property="og:site_name" content="marcomanduca.dev"')
  })

  it('describes the owner as a schema.org Person on the home page only', () => {
    const home = renderSeoTags({ description: 'd', type: 'website' }, SITE, '/')
    const page = renderSeoTags(
      { title: 'Projects', description: 'd', type: 'website' },
      SITE,
      '/projects',
    )

    const json = home.match(
      /<script type="application\/ld\+json">(.*)<\/script>/,
    )?.[1]
    expect(JSON.parse(json ?? 'null')).toEqual(personJsonLd(SITE))
    expect(personJsonLd(SITE)).toMatchObject({
      '@type': 'Person',
      name: 'Marco Manduca',
      jobTitle: 'Data Scientist',
      url: `${SITE}/`,
      sameAs: [
        'https://github.com/MarcoManduca',
        'https://www.linkedin.com/in/marco-manduca/',
      ],
    })
    expect(page).not.toContain('application/ld+json')
  })

  it('sizes only the default share image', () => {
    const tags = renderSeoTags({ description: 'd', type: 'website' }, SITE, '/')

    expect(tags).toContain(`property="og:image" content="${SITE}/og-image.png"`)
    expect(tags).toContain('property="og:image:width" content="1200"')
  })

  it('makes a site-relative image absolute and drops the default size', () => {
    const tags = renderSeoTags(
      {
        description: 'd',
        type: 'article',
        image: '/media/images/projects/a.png',
      },
      SITE,
      '/projects/a',
    )

    expect(tags).toContain(
      `property="og:image" content="${SITE}/media/images/projects/a.png"`,
    )
    expect(tags).not.toContain('og:image:width')
  })

  it('escapes content taken from the API', () => {
    const tags = renderSeoTags(
      {
        title: '</title><script>x</script>',
        description: '"quoted"',
        type: 'article',
      },
      SITE,
      '/projects/a',
    )

    expect(tags).toContain(
      '<title>&lt;/title&gt;&lt;script&gt;x&lt;/script&gt; — Marco Manduca</title>',
    )
    expect(tags).toContain('content="&quot;quoted&quot;"')
  })
})

describe('injectSeo', () => {
  it('replaces the marked block and keeps the bundle tags', () => {
    const html = injectSeo(SHELL, '<title>page</title>')

    expect(html).toBe(
      '<head>\n<title>page</title>\n<script src="/assets/app-1a2b.js"></script></head>',
    )
  })

  it('inserts replacement patterns literally', () => {
    const html = injectSeo(SHELL, '<title>$& $1</title>')

    expect(html).toContain('<title>$& $1</title>')
  })

  it.each([
    ['missing markers', '<head></head>'],
    ['markers in the wrong order', `${SEO_END}${SEO_START}`],
    ['a repeated start marker', `${SEO_START}${SEO_START}${SEO_END}`],
    ['a repeated end marker', `${SEO_START}${SEO_END}${SEO_END}`],
  ])('rejects a shell with %s', (_case, shell) => {
    expect(() => injectSeo(shell, '')).toThrow(/seo:start/)
  })
})
