import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/utils'

import { TagPicker } from './TagPicker'

describe('TagPicker', () => {
  it('toggles a tag from the catalogue of existing tags', async () => {
    const onChange = vi.fn()
    renderWithProviders(<TagPicker value={[]} onChange={onChange} />)

    await userEvent.click(
      await screen.findByRole('button', { name: 'algorithms' }),
    )

    expect(onChange).toHaveBeenCalledWith(['algorithms'])
  })

  it('adds a new free-form tag inline', async () => {
    const onChange = vi.fn()
    renderWithProviders(<TagPicker value={[]} onChange={onChange} />)

    await userEvent.type(screen.getByLabelText('Add a tag'), 'graphs')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    expect(onChange).toHaveBeenCalledWith(['graphs'])
  })
})
