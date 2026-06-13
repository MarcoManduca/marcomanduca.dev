import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/utils'

import { AdminLearning } from './AdminLearning'

describe('AdminLearning', () => {
  it('lists articles with their version number', async () => {
    renderWithProviders(<AdminLearning />)

    expect(await screen.findByText('Big-O notation')).toBeInTheDocument()
    expect(screen.getByText('v3')).toBeInTheDocument()
  })

  it('opens the new-article form', async () => {
    renderWithProviders(<AdminLearning />)
    await screen.findByText('Big-O notation')

    await userEvent.click(screen.getByRole('button', { name: 'New article' }))

    expect(screen.getByLabelText('Title (EN)')).toBeInTheDocument()
  })

  it('toggles the version history for an article', async () => {
    renderWithProviders(<AdminLearning />)
    await screen.findByText('Big-O notation')

    await userEvent.click(
      screen.getAllByRole('button', { name: 'Versions' })[0],
    )

    expect(await screen.findByText('Version 1')).toBeInTheDocument()
    expect(screen.getByText('Version 2')).toBeInTheDocument()
  })
})
