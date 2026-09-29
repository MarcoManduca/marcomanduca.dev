import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'

import { API_URL } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/utils'

import { AdminDashboard } from './AdminDashboard'

describe('AdminDashboard', () => {
  it('shows the counts for each content type', async () => {
    renderWithProviders(<AdminDashboard />)

    expect(
      screen.getByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()

    // 2 projects, 2 articles, 4 technologies from the fixtures.
    expect(await screen.findByText('4')).toBeInTheDocument()
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(2)
  })

  it('offers a retry when a count fails to load', async () => {
    server.use(
      http.get(
        `${API_URL}/technologies`,
        () => HttpResponse.json({ detail: 'boom' }, { status: 500 }),
        { once: true },
      ),
    )
    renderWithProviders(<AdminDashboard />)

    await userEvent.click(await screen.findByRole('button', { name: 'Retry' }))

    expect(await screen.findByText('4')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
