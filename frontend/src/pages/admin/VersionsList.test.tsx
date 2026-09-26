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
    expect(
      screen.getAllByRole('button', { name: /^Rollback to version/ }),
    ).toHaveLength(2)
    expect(
      screen.queryByRole('button', { name: 'Rollback to version 3' }),
    ).not.toBeInTheDocument()
  })

  it('triggers a rollback request on click', async () => {
    let calledSlug: string | undefined
    let calledVersion: number | undefined
    server.use(
      http.post(
        `${API_URL}/learning/:slug/rollback`,
        async ({ params, request }) => {
          calledSlug = String(params.slug)
          calledVersion = ((await request.json()) as { version: number })
            .version
          return HttpResponse.json({})
        },
      ),
    )

    renderWithProviders(
      <VersionsList slug="big-o-notation" currentVersion={3} />,
    )
    await screen.findByText('Version 1')

    await userEvent.click(
      screen.getByRole('button', { name: 'Rollback to version 2' }),
    )

    expect(calledSlug).toBe('big-o-notation')
    expect(calledVersion).toBe(2)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows an alert when the rollback fails', async () => {
    server.use(
      http.post(`${API_URL}/learning/:slug/rollback`, () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    renderWithProviders(
      <VersionsList slug="big-o-notation" currentVersion={3} />,
    )
    await screen.findByText('Version 1')

    await userEvent.click(
      screen.getByRole('button', { name: 'Rollback to version 1' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not restore the version.',
    )
  })
})
