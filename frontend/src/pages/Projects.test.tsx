import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/utils'

import { Projects } from './Projects'

describe('Projects', () => {
  it('lists published projects', async () => {
    renderWithProviders(<Projects />)

    expect(
      await screen.findByRole('link', { name: 'Data pipeline' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Portfolio site' }),
    ).toBeInTheDocument()
  })

  it('filters projects by text search', async () => {
    renderWithProviders(<Projects />)
    await screen.findByRole('link', { name: 'Data pipeline' })

    await userEvent.type(screen.getByLabelText('Search projects'), 'serverless')

    expect(
      screen.getByRole('link', { name: 'Data pipeline' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Portfolio site' }),
    ).not.toBeInTheDocument()
  })

  it('filters projects by category', async () => {
    renderWithProviders(<Projects />)
    await screen.findByRole('link', { name: 'Data pipeline' })

    await userEvent.selectOptions(screen.getByLabelText('Category'), 'frontend')

    expect(
      screen.getByRole('link', { name: 'Portfolio site' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Data pipeline' }),
    ).not.toBeInTheDocument()
  })

  it('filters projects by technology', async () => {
    renderWithProviders(<Projects />)
    await screen.findByRole('link', { name: 'Data pipeline' })

    await userEvent.selectOptions(screen.getByLabelText('Technology'), 'React')

    expect(
      screen.queryByRole('link', { name: 'Data pipeline' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Portfolio site' }),
    ).toBeInTheDocument()
  })

  it('shows an empty state when no project matches', async () => {
    renderWithProviders(<Projects />)
    await screen.findByRole('link', { name: 'Data pipeline' })

    await userEvent.type(screen.getByLabelText('Search projects'), 'zzz-none')

    expect(
      screen.getByText('No projects match the current filters.'),
    ).toBeInTheDocument()
  })
})
