import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { Route, Routes } from 'react-router-dom'

import { API_URL } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/utils'

import { ProjectDetail } from './ProjectDetail'

const renderDetail = (slug: string) =>
  renderWithProviders(
    <Routes>
      <Route path="/projects/:slug" element={<ProjectDetail />} />
    </Routes>,
    { route: `/projects/${slug}` },
  )

describe('ProjectDetail', () => {
  it('renders title, badges, links and markdown content', async () => {
    renderDetail('data-pipeline')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Data pipeline' }),
    ).toBeInTheDocument()

    // Markdown content (code-split, loaded async): "# Pipeline" heading and
    // bold "AWS Lambda".
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Pipeline' }),
    ).toBeInTheDocument()
    expect(screen.getByText('AWS Lambda')).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /GitHub/ })).toHaveAttribute(
      'href',
      'https://github.com/example/data-pipeline',
    )
    expect(screen.getByText('Python')).toBeInTheDocument()
  })

  it('gives each gallery image a distinct, position-aware alt text', async () => {
    renderDetail('data-pipeline')

    expect(
      await screen.findByRole('img', { name: 'Data pipeline — image 1 of 1' }),
    ).toHaveAttribute('src', 'https://cdn.example.com/p1.png')
  })

  it('renders the not found page with noindex for an unknown slug', async () => {
    renderDetail('does-not-exist')

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
        `${API_URL}/projects/:slug`,
        () => HttpResponse.json({ detail: 'boom' }, { status: 500 }),
        { once: true },
      ),
    )
    renderDetail('data-pipeline')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Something went wrong. Please try again.',
    )
    expect(screen.queryByText('404')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Data pipeline' }),
    ).toBeInTheDocument()
  })
})
