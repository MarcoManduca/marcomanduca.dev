import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http, type JsonBodyType } from 'msw'
import { Route, Routes } from 'react-router'

import { NavBar } from '@/components/layout/NavBar'
import { articleSummariesFixture } from '@/test/mocks/fixtures'
import { API_URL } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/utils'

import { LearningGate } from './LearningGate'

/** The menu and the Learning pages behind the gate, opened at `route`. */
const renderLearning = (route = '/learning') =>
  renderWithProviders(
    <>
      <NavBar />
      <Routes>
        <Route element={<LearningGate />}>
          <Route path="/learning" element={<p>Learning page</p>} />
          <Route path="/learning/:slug" element={<p>Article page</p>} />
        </Route>
      </Routes>
    </>,
    { route },
  )

const serveArticles = (body: JsonBodyType) =>
  server.use(http.get(`${API_URL}/learning`, () => HttpResponse.json(body)))

const learningLink = () => screen.queryByRole('link', { name: 'Learning' })

describe('LearningGate', () => {
  it('opens the section and its menu entry once an article is published', async () => {
    renderLearning()

    expect(await screen.findByText('Learning page')).toBeInTheDocument()
    expect(learningLink()).toHaveAttribute('href', '/learning')
  })

  it.each([
    ['no article', []],
    ['only drafts', [{ ...articleSummariesFixture[0], status: 'draft' }]],
  ])('keeps the section closed with %s', async (_case, articles) => {
    serveArticles(articles)
    renderLearning()

    expect(await screen.findByText('404')).toBeInTheDocument()
    expect(screen.queryByText('Learning page')).not.toBeInTheDocument()
    expect(learningLink()).not.toBeInTheDocument()
  })

  it('offers a retry instead of the page when the articles fail to load', async () => {
    server.use(
      http.get(
        `${API_URL}/learning`,
        () => HttpResponse.json({ detail: 'boom' }, { status: 500 }),
        { once: true },
      ),
    )
    renderLearning()

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(learningLink()).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByText('Learning page')).toBeInTheDocument()
  })

  it('requests an article together with the list, not after it', async () => {
    const requested: string[] = []
    let releaseList: () => void = () => {}
    const listHeld = new Promise<void>((resolve) => {
      releaseList = resolve
    })
    server.use(
      http.get(`${API_URL}/learning`, async () => {
        requested.push('list')
        await listHeld
        return HttpResponse.json(articleSummariesFixture)
      }),
      http.get(`${API_URL}/learning/:slug`, ({ params }) => {
        requested.push(String(params.slug))
        return HttpResponse.json({})
      }),
    )
    renderLearning('/learning/big-o-notation')

    await waitFor(() => expect(requested).toEqual(['list', 'big-o-notation']))
    releaseList()

    expect(await screen.findByText('Article page')).toBeInTheDocument()
  })
})
