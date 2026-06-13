import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/utils'

import { ProjectForm } from './ProjectForm'

describe('ProjectForm', () => {
  it('submits a contract-shaped payload from the entered values', async () => {
    const onSubmit = vi.fn()
    renderWithProviders(
      <ProjectForm
        initial={null}
        isSaving={false}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    )

    await userEvent.type(screen.getByLabelText('Title (IT)'), 'Titolo')
    await userEvent.type(screen.getByLabelText('Title (EN)'), 'Title')
    await userEvent.type(
      screen.getByLabelText('GitHub URL'),
      'https://github.com/x/y',
    )
    await userEvent.type(
      screen.getByLabelText('Technologies (comma separated)'),
      'Python, AWS',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const payload = onSubmit.mock.calls[0][0]
    expect(payload).toMatchObject({
      title: { it: 'Titolo', en: 'Title' },
      github_url: 'https://github.com/x/y',
      technologies: ['Python', 'AWS'],
    })
    expect(payload).toHaveProperty('content_markdown')
    expect(payload).not.toHaveProperty('slug')
  })

  it('calls onCancel without submitting', async () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    renderWithProviders(
      <ProjectForm
        initial={null}
        isSaving={false}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalledOnce()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
