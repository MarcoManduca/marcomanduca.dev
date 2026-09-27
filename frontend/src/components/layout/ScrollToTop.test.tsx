import { useEffect, useState } from 'react'

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, Route, Routes } from 'react-router'

import { renderWithProviders } from '@/test/utils'

import { ScrollToTop } from './ScrollToTop'

/** A section that renders a moment later, like a lazy page after its data. */
const LateSection = () => {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 20)
    return () => clearTimeout(timer)
  }, [])
  return ready ? <h2 id="lab">Lab</h2> : null
}

const Pages = () => (
  <>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<Link to="/next">Next page</Link>} />
      <Route
        path="/next"
        element={
          <>
            <Link to="/anchored#section">Anchored page</Link>
            <Link to="/late#lab">Late page</Link>
          </>
        }
      />
      <Route path="/anchored" element={<h2 id="section">Section</h2>} />
      <Route path="/late" element={<LateSection />} />
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

  it('scrolls to a hash target that renders after the page', async () => {
    renderWithProviders(<Pages />, { route: '/next' })
    vi.mocked(window.scrollTo).mockClear()

    await userEvent.click(screen.getByRole('link', { name: 'Late page' }))

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
    await waitFor(() =>
      expect(Element.prototype.scrollIntoView).toHaveBeenCalledOnce(),
    )
  })
})
