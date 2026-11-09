import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/utils'

import { MarkdownImage } from './MarkdownImage'
import { MarkdownRenderer } from './MarkdownRenderer'

const SRC = '/media/images/projects/chart.png'

const openLightbox = async () => {
  const trigger = screen.getByRole('button', { name: 'Enlarge image: Chart' })
  await userEvent.click(trigger)
  return { trigger, dialog: screen.getByRole('dialog', { name: 'Chart' }) }
}

describe('MarkdownImage', () => {
  afterEach(() => vi.restoreAllMocks())

  it('frames the image lazily, captioned by its title', () => {
    renderWithProviders(<MarkdownImage src={SRC} alt="Chart" title="Results" />)

    expect(screen.getByRole('img', { name: 'Chart' })).toHaveAttribute(
      'loading',
      'lazy',
    )
    expect(screen.getByText('Results')).toBeInTheDocument()
  })

  it('falls back to the alt text as the caption', () => {
    renderWithProviders(<MarkdownImage src={SRC} alt="Chart" />)

    expect(screen.getByText('Chart')).toBeInTheDocument()
  })

  it('opens the full-size image in a modal dialog on click', async () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal')
    renderWithProviders(<MarkdownImage src={SRC} alt="Chart" />)

    const { dialog } = await openLightbox()

    expect(showModal).toHaveBeenCalledOnce()
    expect(dialog).toContainElement(
      screen.getAllByRole('img', { name: 'Chart' })[1],
    )
  })

  it('closes on Escape and gives focus back to the image', async () => {
    renderWithProviders(<MarkdownImage src={SRC} alt="Chart" />)
    const { trigger, dialog } = await openLightbox()

    // jsdom does not turn Escape into `cancel`; dispatch it as browsers do.
    const cancel = new Event('cancel', { cancelable: true })
    fireEvent(dialog, cancel)

    expect(cancel.defaultPrevented).toBe(true)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('closes from the close button and from the backdrop', async () => {
    renderWithProviders(<MarkdownImage src={SRC} alt="Chart" />)

    await openLightbox()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    const { dialog } = await openLightbox()
    await userEvent.click(dialog)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders nothing without a source', () => {
    const { container } = renderWithProviders(<MarkdownImage alt="Chart" />)

    expect(container).toBeEmptyDOMElement()
  })

  it('replaces markdown images inside paragraphs without invalid nesting', async () => {
    const consoleError = vi.spyOn(console, 'error')
    renderWithProviders(
      <MarkdownRenderer content={`Intro\n\n![Chart](${SRC} "Results")`} />,
    )
    // The renderer is code-split: wait for its chunk.
    await screen.findByRole('button', { name: 'Enlarge image: Chart' })

    await openLightbox()

    expect(screen.getByText('Results')).toBeInTheDocument()
    expect(consoleError).not.toHaveBeenCalled()
  })
})
