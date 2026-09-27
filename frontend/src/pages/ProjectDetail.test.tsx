import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { Route, Routes } from 'react-router'

import { labFixture, projectsFixture } from '@/test/mocks/fixtures'
import { API_URL } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/utils'
import type { Project } from '@/types'

import { ProjectDetail } from './ProjectDetail'

const renderDetail = (slug: string) =>
  renderWithProviders(
    <Routes>
      <Route path="/projects/:slug" element={<ProjectDetail />} />
    </Routes>,
    { route: `/projects/${slug}` },
  )

/** Serve the first fixture project with some fields replaced. */
const serveProject = (overrides: Partial<Project>) =>
  server.use(
    http.get(`${API_URL}/projects/:slug`, () =>
      HttpResponse.json({ ...projectsFixture[0], ...overrides }),
    ),
  )

const findTitle = (name: string) =>
  screen.findByRole('heading', { level: 1, name })

describe('ProjectDetail', () => {
  it('opens with the classification, description, license and main links', async () => {
    renderDetail('data-pipeline')

    await findTitle('Data pipeline')
    const chips = screen.getByRole('list', { name: 'Classification' })
    expect(within(chips).getByText('Data & Analytics')).toBeInTheDocument()
    expect(within(chips).getByText('Cloud & DevOps')).toBeInTheDocument()
    expect(within(chips).getAllByRole('listitem')).toHaveLength(3)
    expect(within(chips).getByText('Work')).toBeInTheDocument()
    expect(screen.getByText('A serverless ETL pipeline.')).toBeInTheDocument()
    expect(screen.getByText('MIT')).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: 'Source code ↗' })[0],
    ).toHaveAttribute('href', 'https://github.com/example/data-pipeline')
    const hero = screen.getByRole('region', { name: 'Data pipeline' })
    expect(
      within(hero).getByRole('img', { name: 'Pipeline diagram' }),
    ).toBeVisible()
  })

  it('tells the project as a quest, with its key numbers', async () => {
    renderDetail('data-pipeline')

    await findTitle('Data pipeline')
    expect(screen.getByText('Objective').nextElementSibling).toHaveTextContent(
      'Objective: ETL',
    )
    expect(screen.getByText('The cost ceiling')).toBeInTheDocument()
    expect(screen.getByText('A ready pipeline')).toBeInTheDocument()
    expect(screen.getByText('services')).toBeInTheDocument()
  })

  it('links the table of contents to the sections of the long read', async () => {
    renderDetail('data-pipeline')

    const section = await screen.findByRole('heading', {
      level: 2,
      name: 'How it works',
    })
    const toc = screen.getByRole('navigation', { name: 'On this page' })
    expect(
      within(toc).getByRole('link', { name: 'How it works' }),
    ).toHaveAttribute('href', `#${section.id}`)
    expect(within(toc).getByRole('link', { name: 'Gallery' })).toHaveAttribute(
      'href',
      '#project-gallery',
    )
    expect(screen.getByText('AWS Lambda')).toBeInTheDocument()
  })

  it('fills the side column with the stack, topics, resources and quest', async () => {
    renderDetail('data-pipeline')

    await findTitle('Data pipeline')
    const stack = screen.getByRole('region', { name: 'Stack' })
    expect(
      await within(stack).findByRole('heading', { name: 'Languages' }),
    ).toBeInTheDocument()
    expect(within(stack).getByText('AWS')).toBeInTheDocument()
    expect(screen.getByText('#data')).toBeInTheDocument()
    const resources = screen.getByRole('region', { name: 'Resources' })
    expect(
      within(resources).getByRole('link', { name: 'Report ↗' }),
    ).toHaveAttribute('href', 'https://example.com/pipeline.pdf')
    expect(
      screen.getByRole('link', { name: /Born during the quest/ }),
    ).toHaveAttribute('href', '/about-me#work-2020-11')
  })

  it('numbers the side quest and links the next one', async () => {
    renderDetail('data-pipeline')

    await findTitle('Data pipeline')
    expect(await screen.findByText('SQ: 01/02')).toBeInTheDocument()
    const pager = screen.getByRole('navigation', { name: 'More side quests' })
    expect(
      within(pager).getByRole('link', { name: /Next side quest/ }),
    ).toHaveAttribute('href', '/projects/portfolio-site')
  })

  it('shows the lab last, with a call to try the model, when there is one', async () => {
    serveProject({ lab: labFixture })
    renderDetail('data-pipeline')

    await findTitle('Data pipeline')
    expect(screen.getByRole('link', { name: 'Try the model' })).toHaveAttribute(
      'href',
      '#project-lab',
    )
    const hero = screen.getByRole('region', { name: 'Data pipeline' })
    expect(
      within(hero)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['Try the model', 'Source code ↗'])
    const lab = screen.getByRole('region', { name: 'Lab' })
    const gallery = screen.getByRole('region', { name: 'Gallery' })
    expect(gallery.compareDocumentPosition(lab)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    const toc = screen.getByRole('navigation', { name: 'On this page' })
    expect(within(toc).getAllByRole('link').at(-1)).toHaveTextContent('Lab')
  })

  it('leaves the lab out when the project has none', async () => {
    renderDetail('data-pipeline')

    await findTitle('Data pipeline')
    expect(
      screen.queryByRole('heading', { level: 2, name: 'Lab' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Try the model' }),
    ).not.toBeInTheDocument()
  })

  it('counts the opened project towards the explorer figurine', async () => {
    const { store } = renderDetail('data-pipeline')

    await findTitle('Data pipeline')

    expect(store.getState().game.visitedProjects).toEqual(['data-pipeline'])
  })

  it('shows each gallery image with its own alt text and caption', async () => {
    renderDetail('data-pipeline')

    const gallery = await screen.findByRole('region', { name: 'Gallery' })
    expect(
      within(gallery).getByRole('img', { name: 'Pipeline diagram' }),
    ).toHaveAttribute('src', 'https://cdn.example.com/p1.png')
    expect(within(gallery).getByText('How the data flows')).toBeInTheDocument()
  })

  it('skips links that are not http(s)', async () => {
    serveProject({ links: [{ kind: 'live', url: 'javascript:alert(1)' }] })
    renderDetail('data-pipeline')

    await findTitle('Data pipeline')
    expect(
      screen.queryByRole('region', { name: 'Resources' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Live site ↗' }),
    ).not.toBeInTheDocument()
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

    expect(await findTitle('Data pipeline')).toBeInTheDocument()
  })
})
