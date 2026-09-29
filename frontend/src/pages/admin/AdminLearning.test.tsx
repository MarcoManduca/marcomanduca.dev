import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'

import {
  articlesFixture,
  toArticleSummaries,
  versionsFixture,
} from '@/test/mocks/fixtures'
import { API_URL } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/utils'
import type { LearningArticleInput } from '@/types'

import { AdminLearning } from './AdminLearning'

const renderPage = async () => {
  renderWithProviders(<AdminLearning />)
  await screen.findByText('Big-O notation')
}

const clickButton = (name: string) =>
  userEvent.click(screen.getByRole('button', { name }))

/** Serve the article list and history as they are after a rollback to v2. */
const serveRolledBackState = () => {
  const rolledBack = { ...articlesFixture[0], version: 4 }
  server.use(
    http.post(`${API_URL}/learning/:slug/rollback`, () => {
      server.use(
        http.get(`${API_URL}/learning`, () =>
          HttpResponse.json(
            toArticleSummaries([rolledBack, articlesFixture[1]]),
          ),
        ),
        http.get(`${API_URL}/learning/:slug/versions`, () =>
          HttpResponse.json([
            {
              version: 4,
              updated_at: '2026-05-01T09:00:00Z',
              status: 'published',
            },
            ...versionsFixture,
          ]),
        ),
      )
      return HttpResponse.json(rolledBack)
    }),
  )
}

describe('AdminLearning', () => {
  it('lists articles with their version number', async () => {
    await renderPage()

    expect(screen.getByText('v3')).toBeInTheDocument()
  })

  it('opens the new-article form', async () => {
    await renderPage()

    await clickButton('New article')

    expect(
      screen.getByRole('heading', { name: 'New article' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Title (EN)')).toBeInTheDocument()
  })

  it('shows and saves the second article after switching edit target', async () => {
    const saved: { slug: string; body: LearningArticleInput }[] = []
    server.use(
      http.put(`${API_URL}/learning/:slug`, async ({ request, params }) => {
        const body = (await request.json()) as LearningArticleInput
        saved.push({ slug: String(params.slug), body })
        return HttpResponse.json({ ...articlesFixture[1], ...body })
      }),
    )
    await renderPage()

    await clickButton('Edit Big-O notation')
    await clickButton('Edit DynamoDB modelling')

    expect(await screen.findByLabelText('Slug')).toHaveValue(
      'dynamodb-modelling',
    )
    expect(screen.getByLabelText('Title (EN)')).toHaveValue(
      'DynamoDB modelling',
    )

    await clickButton('Save')

    await waitFor(() => expect(saved).toHaveLength(1))
    expect(saved[0].slug).toBe('dynamodb-modelling')
    expect(saved[0].body).toMatchObject({
      title: { en: 'DynamoDB modelling' },
      tags: ['aws', 'nosql'],
    })
  })

  it('keeps the form open with an alert when saving fails (500)', async () => {
    server.use(
      http.put(`${API_URL}/learning/:slug`, () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    await renderPage()

    await clickButton('Edit Big-O notation')
    await screen.findByLabelText('Slug')
    await clickButton('Save')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not save the changes. Something went wrong',
    )
    expect(
      screen.getByRole('heading', { name: 'Edit article' }),
    ).toBeInTheDocument()
  })

  it('toggles the version history for an article', async () => {
    await renderPage()

    await clickButton('Versions of Big-O notation')
    expect(await screen.findByText('Version 1')).toBeInTheDocument()
    expect(screen.getByText('Version 2')).toBeInTheDocument()

    await clickButton('Versions of Big-O notation')
    expect(screen.queryByText('Version 1')).not.toBeInTheDocument()
  })

  it('refreshes the open history with the new current version after a rollback', async () => {
    serveRolledBackState()
    await renderPage()
    await clickButton('Versions of Big-O notation')
    await screen.findByText('Version 1')

    await clickButton('Rollback to version 2')

    expect(await screen.findByText('v4')).toBeInTheDocument()
    expect(await screen.findByText('Version 4')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Rollback to version 3' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Rollback to version 4' }),
    ).not.toBeInTheDocument()
  })

  it('reloads the open form with the restored content after a rollback', async () => {
    const restored = {
      ...articlesFixture[0],
      title: { it: 'Notazione Big-O (v2)', en: 'Big-O notation (v2)' },
      version: 4,
    }
    server.use(
      http.post(`${API_URL}/learning/:slug/rollback`, () => {
        server.use(
          http.get(`${API_URL}/learning`, () =>
            HttpResponse.json(
              toArticleSummaries([restored, articlesFixture[1]]),
            ),
          ),
          http.get(`${API_URL}/learning/:slug`, () =>
            HttpResponse.json(restored),
          ),
        )
        return HttpResponse.json(restored)
      }),
    )
    await renderPage()
    await clickButton('Edit Big-O notation')
    await screen.findByLabelText('Slug')
    await clickButton('Versions of Big-O notation')
    await screen.findByText('Version 1')

    await clickButton('Rollback to version 2')

    await waitFor(() =>
      expect(screen.getByLabelText('Title (EN)')).toHaveValue(
        'Big-O notation (v2)',
      ),
    )
  })

  it('deletes an article after confirmation and closes its history', async () => {
    let deletedSlug: string | undefined
    server.use(
      http.delete(`${API_URL}/learning/:slug`, ({ params }) => {
        deletedSlug = String(params.slug)
        server.use(
          http.get(`${API_URL}/learning`, () =>
            HttpResponse.json(toArticleSummaries([articlesFixture[1]])),
          ),
        )
        return new HttpResponse(null, { status: 204 })
      }),
    )
    await renderPage()
    await clickButton('Versions of Big-O notation')
    await screen.findByText('Version 1')

    await clickButton('Delete Big-O notation')
    const dialog = screen.getByRole('alertdialog')
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Delete' }),
    )

    await waitFor(() => expect(deletedSlug).toBe('big-o-notation'))
    await waitFor(() =>
      expect(screen.queryByText('Big-O notation')).not.toBeInTheDocument(),
    )
    expect(screen.queryByText('Version 1')).not.toBeInTheDocument()
  })

  it('shows an alert when the deletion fails', async () => {
    server.use(
      http.delete(`${API_URL}/learning/:slug`, () =>
        HttpResponse.json({ detail: 'nope' }, { status: 403 }),
      ),
    )
    await renderPage()

    await clickButton('Delete Big-O notation')
    await clickButton('Delete')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not delete the item. You do not have permission',
    )
  })

  it('offers a retry when the list fails to load', async () => {
    server.use(
      http.get(
        `${API_URL}/learning`,
        () => HttpResponse.json({ detail: 'boom' }, { status: 500 }),
        { once: true },
      ),
    )
    renderWithProviders(<AdminLearning />)

    await userEvent.click(await screen.findByRole('button', { name: 'Retry' }))

    expect(await screen.findByText('Big-O notation')).toBeInTheDocument()
  })
})
