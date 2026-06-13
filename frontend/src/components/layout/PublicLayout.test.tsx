import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'

import { renderWithProviders } from '@/test/utils'

import { PublicLayout } from './PublicLayout'

describe('PublicLayout', () => {
  it('renders the header, footer and the routed outlet content', () => {
    renderWithProviders(
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<p>Page body</p>} />
        </Route>
      </Routes>,
    )

    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(screen.getByText('Page body')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
