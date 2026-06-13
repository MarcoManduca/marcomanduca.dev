import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/utils'

import { AdminCv } from './AdminCv'

describe('AdminCv', () => {
  it('renders an editor form for every CV section', async () => {
    renderWithProviders(<AdminCv />)

    // One IT and one EN content field per section (4 sections).
    expect(await screen.findAllByLabelText('Content (IT, JSON)')).toHaveLength(
      4,
    )
    expect(screen.getAllByLabelText('Content (EN, JSON)')).toHaveLength(4)
    expect(
      screen.getByRole('heading', { name: 'CV editor' }),
    ).toBeInTheDocument()
  })

  it('saves a section and shows the saved confirmation', async () => {
    renderWithProviders(<AdminCv />)
    await screen.findAllByLabelText('Content (IT, JSON)')

    await userEvent.click(screen.getAllByRole('button', { name: 'Save' })[0])

    expect(await screen.findByText('Saved')).toBeInTheDocument()
  })
})
