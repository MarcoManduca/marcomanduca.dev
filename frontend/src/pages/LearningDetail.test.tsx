import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { Route, Routes } from 'react-router-dom'

import { API_URL } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/utils'

import { LearningDetail } from './LearningDetail'

const renderDetail = (slug: string) =>
  renderWithProviders(
    <Routes>
      <Route path="/learning/:slug" element={<LearningDetail />} />
    </Routes>,
    { route: `/learning/${slug}` },
  )

describe('LearningDetail', () => {
  it('renders the article title, category, version and content', async () => {
    renderDetail('big-o-notation')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Big-O notation' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Computer Science')).toBeInTheDocument()
    expect(screen.getByText(/v3/)).toBeInTheDocument()
    expect(screen.getByText('algorithms')).toBeInTheDocument()
  })

  it('renders the not found page with noindex for an unknown slug', async () => {
    renderDetail('missing-article')

    expect(await screen.findByText('404')).toBeInTheDocument()
    await waitFor(() =>
      expect(
        document.head.querySelector('meta[name="robots"]'),
      ).toHaveAttribute('content', 'noindex'),
    )
  })

  it('shows a retryable error instead of 404 when the API fails', async () => {
    server.use(
      http.get(
        `${API_URL}/learning/:slug`,
        () => HttpResponse.json({ detail: 'boom' }, { status: 503 }),
        { once: true },
      ),
    )
    renderDetail('big-o-notation')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Something went wrong. Please try again.',
    )
    expect(screen.queryByText('404')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Big-O notation' }),
    ).toBeInTheDocument()
  })
})
