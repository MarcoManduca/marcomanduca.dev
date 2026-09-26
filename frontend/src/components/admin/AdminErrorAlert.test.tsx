import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/utils'

import { AdminErrorAlert } from './AdminErrorAlert'

describe('AdminErrorAlert', () => {
  it('renders nothing without an error', () => {
    renderWithProviders(<AdminErrorAlert title="Failed." error={null} />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('explains the failure from the error status', () => {
    renderWithProviders(
      <AdminErrorAlert title="Failed." error={{ status: 422 }} />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Failed. Some fields are invalid',
    )
  })
})
