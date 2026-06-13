import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/utils'

import { Learning } from './Learning'

describe('Learning', () => {
  it('lists published articles', async () => {
    renderWithProviders(<Learning />)

    expect(
      await screen.findByRole('link', { name: 'Big-O notation' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'DynamoDB modelling' }),
    ).toBeInTheDocument()
  })

  it('filters articles by category', async () => {
    renderWithProviders(<Learning />)
    await screen.findByRole('link', { name: 'Big-O notation' })

    await userEvent.selectOptions(screen.getByLabelText('Category'), 'Data')

    expect(
      screen.getByRole('link', { name: 'DynamoDB modelling' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Big-O notation' }),
    ).not.toBeInTheDocument()
  })

  it('shows an empty state when no article matches', async () => {
    renderWithProviders(<Learning />)
    await screen.findByRole('link', { name: 'Big-O notation' })

    await userEvent.selectOptions(screen.getByLabelText('Category'), 'Cloud')

    expect(
      screen.getByText('No articles in this category yet.'),
    ).toBeInTheDocument()
  })
})
