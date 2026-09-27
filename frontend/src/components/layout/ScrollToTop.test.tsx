import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, Route, Routes } from 'react-router'

import { renderWithProviders } from '@/test/utils'

import { ScrollToTop } from './ScrollToTop'

const Pages = () => (
  <>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<Link to="/next">Next page</Link>} />
      <Route
        path="/next"
        element={<Link to="/anchored#section">Anchored page</Link>}
      />
      <Route path="/anchored" element={<h2 id="section">Section</h2>} />
    </Routes>
  </>
)

describe('ScrollToTop', () => {
  beforeEach(() => {
    vi.mocked(window.scrollTo).mockClear()
    vi.mocked(Element.prototype.scrollIntoView).mockClear()
  })

  it('scrolls the window to the top when the pathname changes', async () => {
    renderWithProviders(<Pages />)
    vi.mocked(window.scrollTo).mockClear()

    await userEvent.click(screen.getByRole('link', { name: 'Next page' }))

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('scrolls the hash target into view instead of jumping to the top', async () => {
    renderWithProviders(<Pages />, { route: '/next' })
    vi.mocked(window.scrollTo).mockClear()

    await userEvent.click(screen.getByRole('link', { name: 'Anchored page' }))

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledOnce()
    expect(window.scrollTo).not.toHaveBeenCalled()
  })
})
