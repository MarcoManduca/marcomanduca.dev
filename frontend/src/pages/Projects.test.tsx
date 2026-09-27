import { screen, within } from '@testing-library/react'
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

  it('shows every area of a project on its card', async () => {
    renderWithProviders(<Projects />)
    const title = await screen.findByRole('link', { name: 'Data pipeline' })
    const card = title.closest('h3')!.parentElement!

    const areas = within(card).getByRole('list')
    expect(within(areas).getByText('Data & Analytics')).toBeInTheDocument()
    expect(within(areas).getByText('Cloud & DevOps')).toBeInTheDocument()
  })

  it('offers no filter by kind', async () => {
    renderWithProviders(<Projects />)
    await screen.findByRole('link', { name: 'Data pipeline' })

    expect(screen.queryByLabelText('Kind')).not.toBeInTheDocument()
    expect(screen.getAllByRole('combobox')).toHaveLength(3)
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

  it('filters projects by area', async () => {
    renderWithProviders(<Projects />)
    await screen.findByRole('link', { name: 'Data pipeline' })

    await userEvent.selectOptions(screen.getByLabelText('Area'), 'frontend')

    expect(
      screen.getByRole('link', { name: 'Portfolio site' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Data pipeline' }),
    ).not.toBeInTheDocument()
  })

  it('filters projects by context', async () => {
    renderWithProviders(<Projects />)
    await screen.findByRole('link', { name: 'Data pipeline' })

    await userEvent.selectOptions(screen.getByLabelText('Context'), 'work')

    expect(
      screen.getByRole('link', { name: 'Data pipeline' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Portfolio site' }),
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
