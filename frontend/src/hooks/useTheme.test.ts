import { act, renderHook } from '@testing-library/react'

import { useTheme } from './useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    document.documentElement.dataset.theme = 'dark'
    localStorage.clear()
  })

  it('reads the theme applied on the document', () => {
    document.documentElement.dataset.theme = 'light'

    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('light')
  })

  it('toggles the document theme and persists the choice', () => {
    const { result } = renderHook(() => useTheme())

    act(() => result.current.toggleTheme())

    expect(result.current.theme).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('updates the browser theme colour', () => {
    const meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.append(meta)
    const { result } = renderHook(() => useTheme())

    act(() => result.current.toggleTheme())

    expect(meta).toHaveAttribute('content', '#EFE3C8')
    meta.remove()
  })
})
