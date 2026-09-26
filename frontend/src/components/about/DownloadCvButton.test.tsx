import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'

import { API_URL } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/utils'

import { DownloadCvButton } from './DownloadCvButton'

const CV_URL = 'http://localhost/cv-download'

const fakeTab = () =>
  ({
    opener: {},
    location: { href: '' },
    close: vi.fn(),
  }) as unknown as Window

describe('DownloadCvButton', () => {
  afterEach(() => vi.restoreAllMocks())

  it('opens a tab synchronously on click, then points it at the CV', async () => {
    const tab = fakeTab()
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(tab)
    renderWithProviders(<DownloadCvButton />)

    await userEvent.click(screen.getByRole('button', { name: 'Download CV' }))

    expect(openSpy).toHaveBeenCalledWith('', '_blank')
    expect(tab.opener).toBeNull()
    await waitFor(() => expect(tab.location.href).toBe(CV_URL))
  })

  it('falls back to the current tab when the new tab is blocked', async () => {
    vi.spyOn(window, 'open').mockReturnValue(null)
    const assign = vi.fn()
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      assign,
    })
    renderWithProviders(<DownloadCvButton />)

    await userEvent.click(screen.getByRole('button', { name: 'Download CV' }))

    await waitFor(() => expect(assign).toHaveBeenCalledWith(CV_URL))
  })

  it('closes the blank tab and shows an error when the URL fetch fails', async () => {
    server.use(
      http.get(`${API_URL}/media/url`, () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    const tab = fakeTab()
    vi.spyOn(window, 'open').mockReturnValue(tab)
    renderWithProviders(<DownloadCvButton />)

    await userEvent.click(screen.getByRole('button', { name: 'Download CV' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not open the CV. Please try again later.',
    )
    expect(tab.close).toHaveBeenCalledOnce()
  })
})
