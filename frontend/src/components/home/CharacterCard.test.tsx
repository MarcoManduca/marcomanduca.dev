import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/utils'

import { CharacterCard } from './CharacterCard'

const faceOf = (element: HTMLElement) =>
  element.closest('[aria-hidden]') as HTMLElement

describe('CharacterCard', () => {
  it('shows the front: role, name, level and portrait', () => {
    renderWithProviders(<CharacterCard />)

    const name = screen.getByRole('heading', {
      level: 1,
      name: 'Marco Manduca',
    })
    expect(faceOf(name)).toHaveAttribute('aria-hidden', 'false')
    expect(
      screen.getByText('Data Engineer & Data Scientist'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Level: over 5 years of experience'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'Portrait of Marco Manduca' }),
    ).toBeInTheDocument()
  })

  it('keeps the back hidden until the card is flipped', async () => {
    renderWithProviders(<CharacterCard />)
    const description = screen.getByText(/I design the path from raw data/)
    expect(faceOf(description)).toHaveAttribute('aria-hidden', 'true')

    await userEvent.click(
      screen.getByRole('button', { name: 'Flip the card: show the back' }),
    )

    expect(faceOf(description)).toHaveAttribute('aria-hidden', 'false')
    const name = screen.getByRole('heading', {
      level: 1,
      name: 'Marco Manduca',
      hidden: true,
    })
    expect(faceOf(name)).toHaveAttribute('aria-hidden', 'true')
    expect(
      screen.getByRole('button', { name: 'Flip the card: show the front' }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('lists the skills and description on the back', () => {
    renderWithProviders(<CharacterCard />)

    expect(screen.getByText('Python · SQL')).toBeInTheDocument()
    expect(screen.getByText('AWS')).toBeInTheDocument()
    expect(screen.getByText('Power BI')).toBeInTheDocument()
  })

  it('flips back with the keyboard', async () => {
    renderWithProviders(<CharacterCard />)
    const toggle = screen.getByRole('button', { name: /Flip the card/ })
    toggle.focus()

    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard('{Enter}')

    expect(toggle).toHaveAttribute('aria-pressed', 'false')
  })
})
