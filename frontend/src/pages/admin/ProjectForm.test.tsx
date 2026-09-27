import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { projectsFixture } from '@/test/mocks/fixtures'
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
    await userEvent.selectOptions(
      screen.getByLabelText('Main area (colours the card)'),
      'dl',
    )
    await userEvent.selectOptions(
      screen.getByLabelText('Third area (optional)'),
      'ml',
    )
    await userEvent.type(
      screen.getByLabelText('Source code — URL'),
      'https://github.com/x/y',
    )
    await userEvent.type(screen.getByLabelText('Licence'), 'MIT')
    // Technologies are chosen from the chip picker (loaded from the API).
    await userEvent.click(await screen.findByRole('button', { name: 'Python' }))
    await userEvent.click(screen.getByRole('button', { name: 'AWS' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const payload = onSubmit.mock.calls[0][0]
    expect(payload).toMatchObject({
      title: { it: 'Titolo', en: 'Title' },
      areas: ['dl', 'ml'],
      links: [{ kind: 'repo', url: 'https://github.com/x/y' }],
      technologies: ['Python', 'AWS'],
      license: 'MIT',
      lab: null,
    })
    expect(payload).toHaveProperty('content_markdown')
    expect(payload).not.toHaveProperty('slug')
  })

  it('names the JSON field that does not parse, and does not submit', async () => {
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
    const metrics = screen.getByLabelText('Key numbers (JSON)')
    await userEvent.clear(metrics)
    await userEvent.type(metrics, 'not json')
    await userEvent.type(screen.getByLabelText('Licence'), 'MIT')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Key numbers (JSON): this is not valid JSON.',
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('prefills every section from the project being edited', () => {
    renderWithProviders(
      <ProjectForm
        initial={projectsFixture[0]}
        isSaving={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Main area (colours the card)')).toHaveValue(
      'data',
    )
    expect(screen.getByLabelText('Second area (optional)')).toHaveValue('cloud')
    expect(screen.getByLabelText('Cover image URL')).toHaveValue(
      'https://cdn.example.com/p1.png',
    )
    expect(screen.getByLabelText('Objective (EN)')).toHaveValue(
      'Objective: ETL',
    )
    expect(screen.getByLabelText('Report — URL')).toHaveValue(
      'https://example.com/pipeline.pdf',
    )
    expect(screen.getByLabelText('Lab (JSON)')).toHaveValue('null')
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
