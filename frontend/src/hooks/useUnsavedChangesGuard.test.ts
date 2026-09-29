import { renderHook } from '@testing-library/react'

import { useUnsavedChangesGuard } from './useUnsavedChangesGuard'

const leavePage = () => {
  const event = new Event('beforeunload', { cancelable: true })
  window.dispatchEvent(event)
  return event
}

describe('useUnsavedChangesGuard', () => {
  it('asks to confirm leaving while active', () => {
    renderHook(() => useUnsavedChangesGuard(true))

    expect(leavePage().defaultPrevented).toBe(true)
  })

  it('lets the page go while inactive', () => {
    renderHook(() => useUnsavedChangesGuard(false))

    expect(leavePage().defaultPrevented).toBe(false)
  })

  it('stops guarding once deactivated', () => {
    const { rerender } = renderHook(
      ({ active }) => useUnsavedChangesGuard(active),
      { initialProps: { active: true } },
    )

    rerender({ active: false })

    expect(leavePage().defaultPrevented).toBe(false)
  })
})
