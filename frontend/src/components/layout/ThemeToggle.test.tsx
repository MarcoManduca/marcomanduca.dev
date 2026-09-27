import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/utils'

import { ThemeToggle } from './ThemeToggle'

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.dataset.theme = 'dark'
  })

  it('switches theme and unlocks the secret figurine', async () => {
    const { store } = renderWithProviders(<ThemeToggle />)

    await userEvent.click(
      screen.getByRole('button', { name: 'Switch to light theme' }),
    )

    expect(document.documentElement.dataset.theme).toBe('light')
    expect(
      screen.getByRole('button', { name: 'Switch to dark theme' }),
    ).toBeInTheDocument()
    expect(store.getState().game.unlocked).toContain('eclipse')
  })
})
