import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'

import { projectSummariesFixture } from '@/test/mocks/fixtures'
import { API_URL } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'
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

  it('flags the drafts an admin is served, and only those', async () => {
    const [draft, published] = projectSummariesFixture
    server.use(
      http.get(`${API_URL}/projects`, () =>
        HttpResponse.json([{ ...draft, status: 'draft' }, published]),
      ),
    )
    renderWithProviders(<Projects />)
    await screen.findByRole('link', { name: 'Data pipeline' })

    expect(screen.getAllByText('Draft')).toHaveLength(1)
    expect(screen.queryByText('Published')).not.toBeInTheDocument()
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

describe('Projects title', () => {
  it('names the page in the document title', async () => {
    renderWithProviders(<Projects />)

    await waitFor(() =>
      expect(document.title).toBe('Projects — marcomanduca.dev'),
    )
  })
})
