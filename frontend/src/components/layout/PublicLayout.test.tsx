import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, Route, Routes } from 'react-router'

import { renderWithProviders } from '@/test/utils'

import { PublicLayout } from './PublicLayout'

const BrokenPage = () => {
  throw new Error('chunk failed to load')
}

const renderLayout = (route = '/') =>
  renderWithProviders(
    <Routes>
      <Route element={<PublicLayout />}>
        <Route
          path="/"
          element={
            <>
              <p>Page body</p>
              <Link to="/next">Next page</Link>
              <Link to="/next#part">Next part</Link>
            </>
          }
        />
        <Route path="/next" element={<p>Next body</p>} />
        <Route path="/broken" element={<BrokenPage />} />
      </Route>
    </Routes>,
    { route },
  )

describe('PublicLayout', () => {
  it('renders the header, footer and the routed outlet content', () => {
    renderLayout()

    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(screen.getByText('Page body')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('unlocks the first figurine on arrival and announces it', async () => {
    const { store } = renderLayout()

    expect(store.getState().game.unlocked).toEqual(['firstStep'])
    expect(
      await screen.findByText('Figurine unlocked: First step'),
    ).toBeInTheDocument()
  })

  it('offers a skip link as the first focusable element, targeting main', async () => {
    renderLayout()

    await userEvent.tab()

    const skipLink = screen.getByRole('link', { name: 'Skip to content' })
    expect(skipLink).toHaveFocus()
    expect(skipLink).toHaveAttribute('href', '#main-content')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
  })

  it('keeps the header usable when the page fails to render', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    renderLayout('/broken')

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    vi.restoreAllMocks()
  })

  it('leaves focus alone on the first load', () => {
    renderLayout()

    expect(screen.getByRole('main')).not.toHaveFocus()
  })

  it('moves focus to the new page after in-app navigation', async () => {
    renderLayout()

    await userEvent.click(screen.getByRole('link', { name: 'Next page' }))

    expect(await screen.findByText('Next body')).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveFocus()
  })

  it('leaves the focus to the hash target on a hash link', async () => {
    renderLayout()

    await userEvent.click(screen.getByRole('link', { name: 'Next part' }))

    expect(await screen.findByText('Next body')).toBeInTheDocument()
    expect(screen.getByRole('main')).not.toHaveFocus()
  })
})
