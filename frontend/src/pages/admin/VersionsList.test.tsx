import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'

import { API_URL } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/utils'

import { VersionsList } from './VersionsList'

describe('VersionsList', () => {
  it('lists every stored version', async () => {
    renderWithProviders(
      <VersionsList slug="big-o-notation" currentVersion={3} />,
    )

    expect(await screen.findByText('Version 1')).toBeInTheDocument()
    expect(screen.getByText('Version 2')).toBeInTheDocument()
    expect(screen.getByText('Version 3')).toBeInTheDocument()
  })

  it('offers rollback only for non-current versions', async () => {
    renderWithProviders(
      <VersionsList slug="big-o-notation" currentVersion={3} />,
    )
    await screen.findByText('Version 1')

    // 3 versions total, the current one (v3) has no rollback button.
    expect(screen.getAllByRole('button', { name: 'Rollback' })).toHaveLength(2)
  })

  it('triggers a rollback request on click', async () => {
    let calledSlug: string | undefined
    server.use(
      http.post(`${API_URL}/learning/:slug/rollback`, ({ params }) => {
        calledSlug = String(params.slug)
        return HttpResponse.json({})
      }),
    )

    renderWithProviders(
      <VersionsList slug="big-o-notation" currentVersion={3} />,
    )
    await screen.findByText('Version 1')

    await userEvent.click(
      screen.getAllByRole('button', { name: 'Rollback' })[0],
    )

    expect(calledSlug).toBe('big-o-notation')
  })
})
