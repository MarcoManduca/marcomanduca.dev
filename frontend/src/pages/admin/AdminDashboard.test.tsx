import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/utils'

import { AdminDashboard } from './AdminDashboard'

describe('AdminDashboard', () => {
  it('shows the counts for each content type', async () => {
    renderWithProviders(<AdminDashboard />)

    expect(
      screen.getByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()

    // 2 projects, 2 articles, 4 technologies, 3 CV sections from the fixtures.
    expect(await screen.findByText('4')).toBeInTheDocument()
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
