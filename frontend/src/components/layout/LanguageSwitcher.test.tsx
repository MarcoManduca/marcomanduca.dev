import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/utils'

import { LanguageSwitcher } from './LanguageSwitcher'

describe('LanguageSwitcher', () => {
  it('marks the current language as pressed', () => {
    renderWithProviders(<LanguageSwitcher />)

    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Italiano' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('switches the UI language to Italian', async () => {
    const { i18n, store } = renderWithProviders(<LanguageSwitcher />)

    await userEvent.click(screen.getByRole('button', { name: 'Italiano' }))

    expect(i18n.language).toBe('it')
    expect(store.getState().game.unlocked).toContain('polyglot')
    expect(screen.getByRole('button', { name: 'Italiano' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('ignores a click on the current language', async () => {
    const { store } = renderWithProviders(<LanguageSwitcher />)

    await userEvent.click(screen.getByRole('button', { name: 'English' }))

    expect(store.getState().game.unlocked).toEqual([])
  })

  it('names each language in that language', () => {
    renderWithProviders(<LanguageSwitcher />)

    expect(screen.getByRole('button', { name: 'Italiano' })).toHaveAttribute(
      'lang',
      'it',
    )
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute(
      'lang',
      'en',
    )
  })
})
