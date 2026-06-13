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
    await userEvent.type(
      screen.getByLabelText('Tags (comma separated)'),
      'algorithms, cs',
    )
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
