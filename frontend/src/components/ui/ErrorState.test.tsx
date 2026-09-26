import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/utils'

import { ErrorState } from './ErrorState'

describe('ErrorState', () => {
  it('shows the error message and calls onRetry when retry is clicked', async () => {
    const onRetry = vi.fn()
    renderWithProviders(<ErrorState onRetry={onRetry} />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Something went wrong. Please try again.',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
