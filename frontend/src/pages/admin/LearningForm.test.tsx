import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/utils'

import { LearningForm } from './LearningForm'

describe('LearningForm', () => {
  it('submits a contract-shaped article payload', async () => {
    const onSubmit = vi.fn()
    renderWithProviders(
      <LearningForm
        initial={null}
        isSaving={false}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    )

    await userEvent.type(screen.getByLabelText('Title (IT)'), 'Titolo')
    await userEvent.type(screen.getByLabelText('Title (EN)'), 'Title')
    // Tags are added through the picker (free-form inline entry).
    const tagInput = screen.getByLabelText('Add a tag')
    await userEvent.type(tagInput, 'algorithms')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await userEvent.type(tagInput, 'cs')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const payload = onSubmit.mock.calls[0][0]
    expect(payload).toMatchObject({
      title: { it: 'Titolo', en: 'Title' },
      tags: ['algorithms', 'cs'],
    })
    expect(payload).toHaveProperty('content_markdown')
    expect(payload).not.toHaveProperty('summary')
    expect(payload).not.toHaveProperty('slug')
  })
})
