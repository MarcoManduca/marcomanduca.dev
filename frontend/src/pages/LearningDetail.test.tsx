import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'

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

  it('renders the not found page for an unknown slug', async () => {
    renderDetail('missing-article')

    expect(await screen.findByText('404')).toBeInTheDocument()
  })
})
