import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/utils'

import { AdminProjects } from './AdminProjects'

describe('AdminProjects', () => {
  it('lists the existing projects in a table', async () => {
    renderWithProviders(<AdminProjects />)

    expect(await screen.findByText('Data pipeline')).toBeInTheDocument()
    expect(screen.getByText('Portfolio site')).toBeInTheDocument()
  })

  it('opens the new-project form', async () => {
    renderWithProviders(<AdminProjects />)
    await screen.findByText('Data pipeline')

    await userEvent.click(screen.getByRole('button', { name: 'New project' }))

    expect(
      screen.getByRole('heading', { name: 'New project' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Title (EN)')).toBeInTheDocument()
  })

  it('opens the edit form prefilled with the project slug', async () => {
    renderWithProviders(<AdminProjects />)
    await screen.findByText('Data pipeline')

    await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0])

    expect(
      screen.getByRole('heading', { name: 'Edit project' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Slug')).toHaveValue('data-pipeline')
  })
})
