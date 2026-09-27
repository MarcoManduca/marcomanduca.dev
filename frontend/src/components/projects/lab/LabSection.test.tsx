import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { labFixture } from '@/test/mocks/fixtures'
import { renderWithProviders } from '@/test/utils'

import { LabSection } from './LabSection'

const overlay = (name: string) => screen.getByRole('img', { name })

const renderLab = (lab = labFixture) =>
  renderWithProviders(<LabSection lab={lab} />)

describe('LabSection', () => {
  it('opens on the first sample, split in half on its first layer', () => {
    renderLab()

    expect(screen.getByRole('img', { name: 'Image gt01-rgb' })).toBeVisible()
    expect(overlay('Image predicted')).toHaveStyle({
      clipPath: 'inset(0 0 0 50%)',
    })
    expect(screen.getByText('How to read Predicted IR')).toBeInTheDocument()
    expect(screen.getByText('resunet_nll')).toBeInTheDocument()
  })

  it('reveals the layer picked in the view group', async () => {
    renderLab()

    await userEvent.click(screen.getByRole('button', { name: 'Residual' }))

    expect(screen.getByRole('button', { name: 'Residual' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(overlay('Image residual')).toBeVisible()
    expect(screen.getByText('How to read Residual')).toBeInTheDocument()
  })

  it('moves the divider with the arrow keys, Home and End', async () => {
    renderLab()
    const divider = screen.getByRole('slider', { name: 'Compare' })
    divider.focus()

    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')

    expect(divider).toHaveAttribute('aria-valuenow', '40')
    expect(overlay('Image predicted')).toHaveStyle({
      clipPath: 'inset(0 0 0 40%)',
    })
    await userEvent.keyboard('{End}{ArrowRight}')
    expect(divider).toHaveAttribute('aria-valuetext', '100%')
    await userEvent.keyboard('{Home}{Enter}')
    expect(divider).toHaveAttribute('aria-valuenow', '0')
  })

  it('shows no slider besides the divider on the image', () => {
    renderLab()

    expect(screen.getAllByRole('slider')).toHaveLength(1)
  })

  it('moves the divider to where the image is pressed and dragged', () => {
    renderLab()
    const stage = overlay('Image predicted').parentElement!
    vi.spyOn(stage, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(100, 0, 400, 300),
    )

    fireEvent.pointerDown(stage, { clientX: 200, pointerId: 1 })
    fireEvent.pointerMove(stage, { clientX: 400, pointerId: 1 })
    fireEvent.pointerUp(stage, { pointerId: 1 })
    fireEvent.pointerMove(stage, { clientX: 150, pointerId: 1 })

    expect(screen.getByRole('slider', { name: 'Compare' })).toHaveAttribute(
      'aria-valuenow',
      '75',
    )
  })

  it('switches sample, falling back to its first layer', async () => {
    renderLab()
    await userEvent.click(screen.getByRole('button', { name: 'Residual' }))

    await userEvent.click(screen.getByRole('button', { name: 'GT02' }))

    expect(screen.getByRole('img', { name: 'Image gt02-rgb' })).toBeVisible()
    expect(overlay('Image predicted')).toBeVisible()
    expect(screen.getByText('Photo')).toBeInTheDocument()
  })

  it('hides the sample picker for a single sample', () => {
    renderLab({ ...labFixture, model: null, samples: [labFixture.samples[0]] })

    expect(
      screen.queryByRole('group', { name: 'Samples' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('resunet_nll')).not.toBeInTheDocument()
  })
})
