import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link } from 'react-router'

import { renderWithProviders } from '@/test/utils'

import { Header } from './Header'

const openMenu = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Open menu' }))
  return screen.getByRole('navigation', { name: 'Mobile' })
}

const queryMobileNav = () =>
  screen.queryByRole('navigation', { name: 'Mobile' })

describe('Header', () => {
  it('renders the brand link, navigation and language switcher', () => {
    renderWithProviders(<Header />)

    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'href',
      '/projects',
    )
    expect(screen.getByRole('group', { name: 'Language' })).toBeInTheDocument()
  })

  it('opens and closes the mobile menu via the toggle button', async () => {
    renderWithProviders(<Header />)

    expect(await openMenu()).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Close menu' }))
    expect(queryMobileNav()).not.toBeInTheDocument()
  })

  it('offers the language and theme switches inside the mobile menu', async () => {
    document.documentElement.dataset.theme = 'dark'
    renderWithProviders(<Header />)
    await openMenu()
    const panel = within(document.getElementById('mobile-menu')!)

    await userEvent.click(
      panel.getByRole('button', { name: 'Switch to light theme' }),
    )

    expect(panel.getByRole('group', { name: 'Language' })).toBeInTheDocument()
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('moves focus to the first menu link when opened', async () => {
    renderWithProviders(<Header />)

    const mobileNav = await openMenu()

    expect(mobileNav.querySelector('a')).toHaveFocus()
  })

  it('closes on Escape and returns focus to the toggle', async () => {
    renderWithProviders(<Header />)
    await openMenu()

    await userEvent.keyboard('{Escape}')

    expect(queryMobileNav()).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveFocus()
  })

  it('closes on a click outside the header', async () => {
    renderWithProviders(
      <>
        <Header />
        <p>Page content</p>
      </>,
    )
    await openMenu()

    await userEvent.click(screen.getByText('Page content'))

    expect(queryMobileNav()).not.toBeInTheDocument()
  })

  it('closes when the route changes', async () => {
    renderWithProviders(
      <>
        <Header />
        <Link to="/about-me">Elsewhere</Link>
      </>,
    )
    await openMenu()

    // Keyboard navigation from outside: no click lands outside the header,
    // so only the route change can close the menu.
    act(() => screen.getByRole('link', { name: 'Elsewhere' }).focus())
    await userEvent.keyboard('{Enter}')

    expect(queryMobileNav()).not.toBeInTheDocument()
  })
})
