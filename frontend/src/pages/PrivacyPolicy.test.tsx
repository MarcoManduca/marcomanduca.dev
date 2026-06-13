import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/utils'

import { PrivacyPolicy } from './PrivacyPolicy'

describe('PrivacyPolicy', () => {
  it('renders the policy title and the structured sections', () => {
    renderWithProviders(<PrivacyPolicy />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Privacy Policy' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Data Controller' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Your rights' }),
    ).toBeInTheDocument()
  })

  it('lists the GDPR data-subject rights', () => {
    renderWithProviders(<PrivacyPolicy />)

    expect(screen.getByText(/access your personal data/i)).toBeInTheDocument()
    expect(
      screen.getByText(/withdraw your consent at any time/i),
    ).toBeInTheDocument()
  })
})
