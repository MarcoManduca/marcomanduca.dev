import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'

import { API_URL } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/utils'

import { TechnologyPicker } from './TechnologyPicker'

describe('TechnologyPicker', () => {
  it('toggles an existing technology', async () => {
    const onChange = vi.fn()
    renderWithProviders(<TechnologyPicker value={[]} onChange={onChange} />)

    await userEvent.click(await screen.findByRole('button', { name: 'Python' }))

    expect(onChange).toHaveBeenCalledWith(['Python'])
  })

  it('creates a new technology inline and selects it', async () => {
    const onChange = vi.fn()
    renderWithProviders(<TechnologyPicker value={[]} onChange={onChange} />)

    await screen.findByRole('button', { name: 'Python' })
    await userEvent.type(
      screen.getByLabelText('Add a technology'),
      'PostgreSQL',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(['PostgreSQL']))
  })

  it('shows an error and keeps the name when creation fails', async () => {
    server.use(
      http.post(`${API_URL}/technologies`, () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    const onChange = vi.fn()
    renderWithProviders(<TechnologyPicker value={[]} onChange={onChange} />)
    await screen.findByRole('button', { name: 'Python' })
    const input = screen.getByLabelText('Add a technology')

    await userEvent.type(input, 'PostgreSQL')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not add the technology.',
    )
    expect(input).toHaveValue('PostgreSQL')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('selects an existing technology instead of creating a duplicate', async () => {
    const onChange = vi.fn()
    renderWithProviders(<TechnologyPicker value={[]} onChange={onChange} />)
    await screen.findByRole('button', { name: 'Python' })

    await userEvent.type(
      screen.getByLabelText('Add a technology'),
      'python{Enter}',
    )

    expect(onChange).toHaveBeenCalledWith(['Python'])
  })
})
