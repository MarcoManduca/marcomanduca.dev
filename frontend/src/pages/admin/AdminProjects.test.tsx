import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'

import { projectsFixture } from '@/test/mocks/fixtures'
import { API_URL } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/utils'
import type { ProjectInput } from '@/types'

import { AdminProjects } from './AdminProjects'

interface SavedProject {
  slug: string
  body: ProjectInput
}

/** Record every PUT /projects/:slug and answer with the saved project. */
const recordUpdates = () => {
  const saved: SavedProject[] = []
  server.use(
    http.put(`${API_URL}/projects/:slug`, async ({ request, params }) => {
      const body = (await request.json()) as ProjectInput
      saved.push({ slug: String(params.slug), body })
      return HttpResponse.json({ ...projectsFixture[0], ...body })
    }),
  )
  return saved
}

const failWith = (method: 'put' | 'post' | 'delete', status: number) => {
  const path = method === 'post' ? '/projects' : '/projects/:slug'
  server.use(
    http[method](`${API_URL}${path}`, () =>
      HttpResponse.json({ detail: 'error' }, { status }),
    ),
  )
}

const renderPage = async () => {
  renderWithProviders(<AdminProjects />)
  await screen.findByText('Data pipeline')
}

const clickButton = (name: string) =>
  userEvent.click(screen.getByRole('button', { name }))

describe('AdminProjects', () => {
  it('shows a spinner, then lists the existing projects', async () => {
    renderWithProviders(<AdminProjects />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(await screen.findByText('Data pipeline')).toBeInTheDocument()
    expect(screen.getByText('Portfolio site')).toBeInTheDocument()
  })

  it('opens the new-project form', async () => {
    await renderPage()

    await clickButton('New project')

    expect(
      screen.getByRole('heading', { name: 'New project' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Title (EN)')).toBeInTheDocument()
  })

  it('names each row action after its project', async () => {
    await renderPage()

    expect(
      screen.getByRole('button', { name: 'Edit Portfolio site' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Delete Portfolio site' }),
    ).toBeInTheDocument()
  })

  it('opens the edit form prefilled with the project slug', async () => {
    await renderPage()

    await clickButton('Edit Data pipeline')

    expect(
      screen.getByRole('heading', { name: 'Edit project' }),
    ).toBeInTheDocument()
    expect(await screen.findByLabelText('Slug')).toHaveValue('data-pipeline')
  })

  it('shows an error instead of the form when the project cannot be loaded', async () => {
    server.use(
      http.get(`${API_URL}/projects/:slug`, () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    await renderPage()

    await clickButton('Edit Data pipeline')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Something went wrong',
    )
    expect(screen.queryByLabelText('Slug')).not.toBeInTheDocument()
  })

  it('shows and saves the second project after switching edit target', async () => {
    const saved = recordUpdates()
    await renderPage()

    await clickButton('Edit Data pipeline')
    await screen.findByLabelText('Slug')
    await clickButton('Edit Portfolio site')

    await waitFor(() =>
      expect(screen.getByLabelText('Slug')).toHaveValue('portfolio-site'),
    )
    expect(screen.getByLabelText('Title (EN)')).toHaveValue('Portfolio site')
    expect(screen.getByRole('button', { name: 'React' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await clickButton('Save')

    await waitFor(() => expect(saved).toHaveLength(1))
    expect(saved[0].slug).toBe('portfolio-site')
    expect(saved[0].body).toMatchObject({
      title: { en: 'Portfolio site' },
      technologies: ['React', 'TypeScript'],
    })
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'Edit project' }),
      ).not.toBeInTheDocument(),
    )
  })

  it('keeps the form open with an alert when validation fails (422)', async () => {
    failWith('put', 422)
    await renderPage()

    await clickButton('Edit Data pipeline')
    await screen.findByLabelText('Slug')
    await clickButton('Save')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not save the changes. Some fields are invalid',
    )
    expect(
      screen.getByRole('heading', { name: 'Edit project' }),
    ).toBeInTheDocument()
  })

  it('keeps the new form and its values when creation fails (500)', async () => {
    failWith('post', 500)
    await renderPage()

    await clickButton('New project')
    await userEvent.type(screen.getByLabelText('Title (IT)'), 'Nuovo')
    await userEvent.type(screen.getByLabelText('Title (EN)'), 'New')
    await userEvent.type(
      screen.getByLabelText('Source code — URL'),
      'https://github.com/x/y',
    )
    await userEvent.type(screen.getByLabelText('Licence'), 'MIT')
    await clickButton('Save')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not save the changes. Something went wrong',
    )
    expect(screen.getByLabelText('Title (EN)')).toHaveValue('New')
  })

  it('asks for confirmation and does nothing when cancelled', async () => {
    let deleted = false
    server.use(
      http.delete(`${API_URL}/projects/:slug`, () => {
        deleted = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    await renderPage()

    await clickButton('Delete Data pipeline')
    expect(
      screen.getByRole('alertdialog', { name: 'Delete “Data pipeline”?' }),
    ).toBeInTheDocument()
    await clickButton('Cancel')

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(deleted).toBe(false)
  })

  it('deletes the project once confirmed', async () => {
    let deletedSlug: string | undefined
    server.use(
      http.delete(`${API_URL}/projects/:slug`, ({ params }) => {
        deletedSlug = String(params.slug)
        return new HttpResponse(null, { status: 204 })
      }),
    )
    await renderPage()

    await clickButton('Delete Data pipeline')
    await clickButton('Delete')

    await waitFor(() => expect(deletedSlug).toBe('data-pipeline'))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('shows an alert when the deletion fails', async () => {
    failWith('delete', 500)
    await renderPage()

    await clickButton('Delete Data pipeline')
    await clickButton('Delete')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not delete the item.',
    )
    expect(screen.getByText('Data pipeline')).toBeInTheDocument()
  })
})
