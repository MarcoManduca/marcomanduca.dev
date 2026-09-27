import { Component, type ReactNode } from 'react'

import { ErrorState } from './ErrorState'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Recovery action of the fallback; reloading also fetches fresh chunks. */
  onRetry?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
}

const reload = () => window.location.reload()

/**
 * Catch errors thrown while rendering its children, including a lazy chunk
 * that fails to load (flaky network, or a tab older than the last deploy
 * whose hashed assets were pruned), and show a retry instead of unmounting
 * the whole app to a blank page.
 *
 * The only class component in the codebase: React has no hook equivalent of
 * `getDerivedStateFromError`. Give it a `key` to reset it, e.g. per route.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    const { children, onRetry = reload } = this.props
    return this.state.hasError ? <ErrorState onRetry={onRetry} /> : children
  }
}
