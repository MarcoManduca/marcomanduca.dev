import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

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
})
