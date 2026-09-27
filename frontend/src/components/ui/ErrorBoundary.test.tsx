import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/utils'

import { ErrorBoundary } from './ErrorBoundary'

const Broken = () => {
  throw new Error('chunk failed to load')
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React reports caught render errors on the console; keep the run quiet.
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => vi.restoreAllMocks())

  it('renders its children when nothing throws', () => {
    renderWithProviders(
      <ErrorBoundary>
        <p>Page content</p>
      </ErrorBoundary>,
    )

    expect(screen.getByText('Page content')).toBeInTheDocument()
  })

  it('shows a retry instead of a blank page when a child throws', async () => {
    const onRetry = vi.fn()
    renderWithProviders(
      <ErrorBoundary onRetry={onRetry}>
        <Broken />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Something went wrong. Please try again.',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
