import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/utils'

import { AchievementToast } from './AchievementToast'

describe('AchievementToast', () => {
  it('announces the latest unlock and can be dismissed', async () => {
    const { store } = renderWithProviders(<AchievementToast />, {
      game: { unlocked: ['reader'], lastUnlocked: 'reader' },
    })

    expect(screen.getByRole('status')).toHaveTextContent(
      'Figurine unlocked: Reader',
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Dismiss notification' }),
    )

    expect(store.getState().game.lastUnlocked).toBeNull()
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('dismisses itself after a few seconds', () => {
    vi.useFakeTimers()
    const { store } = renderWithProviders(<AchievementToast />, {
      game: { lastUnlocked: 'contact' },
    })

    act(() => vi.advanceTimersByTime(5000))

    expect(store.getState().game.lastUnlocked).toBeNull()
    vi.useRealTimers()
  })

  it('stays silent outside game mode', () => {
    renderWithProviders(<AchievementToast />, {
      game: { gameMode: false, lastUnlocked: 'reader' },
    })

    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })
})
