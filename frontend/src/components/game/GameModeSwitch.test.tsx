import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/utils'

import { CollectionCounter } from './CollectionCounter'
import { GameModeSwitch } from './GameModeSwitch'

describe('GameModeSwitch', () => {
  it('turns the gamified UI off and on', async () => {
    renderWithProviders(
      <>
        <GameModeSwitch />
        <CollectionCounter />
      </>,
      { game: { unlocked: ['firstStep'] } },
    )
    const toggle = screen.getByRole('switch', { name: 'Game mode' })
    expect(toggle).toBeChecked()
    expect(screen.getByLabelText('Figurines collected: 1 of 7')).toBeVisible()

    await userEvent.click(toggle)

    expect(toggle).not.toBeChecked()
    expect(
      screen.queryByLabelText('Figurines collected: 1 of 7'),
    ).not.toBeInTheDocument()
  })
})
