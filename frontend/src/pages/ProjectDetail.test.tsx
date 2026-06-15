import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'

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
    expect(
      screen.getByRole('img', { name: 'Data pipeline' }),
    ).toBeInTheDocument()
  })

  it('renders the not found page for an unknown slug', async () => {
    renderDetail('does-not-exist')

    expect(await screen.findByText('404')).toBeInTheDocument()
  })
})
