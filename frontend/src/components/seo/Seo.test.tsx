import { waitFor } from '@testing-library/react'

import { renderWithProviders } from '@/test/utils'

import { Seo } from './Seo'

const metaContent = (selector: string) =>
  document.head.querySelector(selector)?.getAttribute('content')

describe('Seo', () => {
  it('emits title, canonical, locales and the default share image', async () => {
    renderWithProviders(<Seo title="Projects" description="All projects" />, {
      route: '/projects',
    })

    await waitFor(() =>
      expect(document.title).toBe('Projects — marcomanduca.dev'),
    )
    expect(
      document.head.querySelector('link[rel="canonical"]'),
    ).toHaveAttribute('href', 'https://marcomanduca.dev/projects')
    expect(metaContent('meta[property="og:locale"]')).toBe('en_GB')
    expect(metaContent('meta[property="og:locale:alternate"]')).toBe('it_IT')
    expect(metaContent('meta[property="og:image"]')).toBe(
      'https://marcomanduca.dev/og-image.png',
    )
    expect(metaContent('meta[name="twitter:card"]')).toBe('summary_large_image')
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull()
  })

  it('uses the page image and noindex when provided', async () => {
    renderWithProviders(
      <Seo
        description="Missing"
        image="https://cdn.example.com/p1.png"
        noindex
      />,
    )

    await waitFor(() =>
      expect(metaContent('meta[name="robots"]')).toBe('noindex'),
    )
    expect(metaContent('meta[property="og:image"]')).toBe(
      'https://cdn.example.com/p1.png',
    )
    expect(
      document.head.querySelector('meta[property="og:image:width"]'),
    ).toBeNull()
  })
})
