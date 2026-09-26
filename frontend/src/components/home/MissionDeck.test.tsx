import { screen } from '@testing-library/react'
import { HttpResponse, http } from 'msw'

import { API_URL } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/utils'

import { MissionDeck } from './MissionDeck'

describe('MissionDeck', () => {
  it('deals the current job and studies from the CV', () => {
    renderWithProviders(<MissionDeck />)

    expect(
      screen.getByRole('link', {
        name: /Main quest · In progress.*Business Data Analyst/,
      }),
    ).toHaveAttribute('href', '/about-me')
    expect(
      screen.getByRole('link', { name: /MSc in Data Science|Data Science/ }),
    ).toHaveAttribute('href', '/about-me')
  })

  it('deals the latest project and article once they load', async () => {
    renderWithProviders(<MissionDeck />)

    expect(
      await screen.findByRole('link', { name: /Data pipeline/ }),
    ).toHaveAttribute('href', '/projects/data-pipeline')
    expect(
      await screen.findByRole('link', { name: /Big-O notation/ }),
    ).toHaveAttribute('href', '/learning/big-o-notation')
    expect(screen.getByText('Python · AWS')).toBeInTheDocument()
  })

  it('falls back to past job and degree when nothing is published', async () => {
    server.use(
      http.get(`${API_URL}/projects`, () => HttpResponse.json([])),
      http.get(`${API_URL}/learning`, () => HttpResponse.json([])),
    )
    renderWithProviders(<MissionDeck />)

    expect(
      await screen.findByRole('link', { name: /Job · Completed/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Study · Completed/ }),
    ).toBeInTheDocument()
  })
})
