import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/utils'

import { Home } from './Home'

describe('Home', () => {
  it('renders the hero with name, role and CTA links', () => {
    renderWithProviders(<Home />)

    expect(
      screen.getByRole('heading', { name: 'Marco Manduca' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Data & Software Engineer' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Explore projects' }),
    ).toHaveAttribute('href', '/projects')
    expect(
      screen.getByRole('link', { name: 'Read the knowledge base' }),
    ).toHaveAttribute('href', '/learning')
    expect(screen.getByRole('link', { name: 'Get in touch' })).toHaveAttribute(
      'href',
      '/contacts',
    )
  })

  it('shows previews of latest published projects and articles', async () => {
    renderWithProviders(<Home />)

    expect(
      await screen.findByRole('heading', { name: 'Latest projects' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('link', { name: 'Data pipeline' }),
    ).toBeInTheDocument()

    expect(
      await screen.findByRole('heading', { name: 'Latest articles' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('link', { name: 'Big-O notation' }),
    ).toBeInTheDocument()
  })
})
