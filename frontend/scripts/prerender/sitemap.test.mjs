import { describe, expect, it } from 'vitest'

import { escapeXml, renderSitemap } from './sitemap.mjs'

describe('renderSitemap', () => {
  it('lists every route with its priority and optional lastmod', () => {
    const xml = renderSitemap('https://marcomanduca.dev', [
      { path: '/', priority: '1.0' },
      { path: '/projects/a', priority: '0.7', lastmod: '2026-09-01' },
    ])

    expect(xml).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://marcomanduca.dev/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://marcomanduca.dev/projects/a</loc>
    <lastmod>2026-09-01</lastmod>
    <priority>0.7</priority>
  </url>
</urlset>
`)
  })
})

describe('escapeXml', () => {
  it('escapes the five XML entities', () => {
    expect(escapeXml(`<&>"'`)).toBe('&lt;&amp;&gt;&quot;&apos;')
  })
})
