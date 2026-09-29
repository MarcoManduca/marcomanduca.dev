import { describe, expect, it } from 'vitest'

import {
  escapeHtml,
  injectSeo,
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

describe('renderSeoTags', () => {
  it('renders the titled page tags like <Seo />', () => {
    const tags = renderSeoTags(
      { title: 'Projects', description: 'Things I built.', type: 'website' },
      SITE,
      '/projects',
    )

    expect(tags).toContain('<title>Projects — marcomanduca.dev</title>')
    expect(tags).toContain(
      `<link data-rh="true" rel="canonical" href="${SITE}/projects" />`,
    )
    expect(tags).toContain(`property="og:url" content="${SITE}/projects"`)
    expect(tags).toContain(
      'name="twitter:description" content="Things I built."',
    )
  })

  it('uses the site name alone when the page has no title', () => {
    const tags = renderSeoTags(
      { description: 'Home', type: 'website' },
      SITE,
      '/',
    )

    expect(tags).toContain('<title>marcomanduca.dev</title>')
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
      '<title>&lt;/title&gt;&lt;script&gt;x&lt;/script&gt; — marcomanduca.dev</title>',
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
