import { screen } from '@testing-library/react'
import { HttpResponse, http } from 'msw'

import { API_URL } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/utils'

import { Cv } from './Cv'

describe('Cv', () => {
  it('renders the localized sections in the fixed order', async () => {
    renderWithProviders(<Cv />)

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Summary' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Data and software engineer focused on AWS platforms.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Experience' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Skills' }),
    ).toBeInTheDocument()
  })

  it('exposes both PDF download links', () => {
    renderWithProviders(<Cv />)

    expect(
      screen.getByRole('link', { name: 'Download PDF (IT)' }),
    ).toHaveAttribute('href', expect.stringContaining('lang=it'))
    expect(
      screen.getByRole('link', { name: 'Download PDF (EN)' }),
    ).toHaveAttribute('href', expect.stringContaining('lang=en'))
  })

  it('shows an empty state when no section is published', async () => {
    server.use(
      http.get(`${API_URL}/cv`, () =>
        HttpResponse.json({ lang: 'en', sections: {} }),
      ),
    )
    renderWithProviders(<Cv />)

    expect(
      await screen.findByText('The CV has not been published yet.'),
    ).toBeInTheDocument()
  })

  it('shows an error message when the request fails', async () => {
    server.use(
      http.get(`${API_URL}/cv`, () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    renderWithProviders(<Cv />)

    expect(
      await screen.findByText('Something went wrong. Please try again.'),
    ).toBeInTheDocument()
  })
})
