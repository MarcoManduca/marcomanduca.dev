import { useState } from 'react'

import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/utils'

import { ConfirmDialog } from './ConfirmDialog'

const renderDialog = () => {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()
  renderWithProviders(
    <ConfirmDialog
      title="Delete “Foo”?"
      message="This action cannot be undone."
      confirmLabel="Delete"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
  )
  return { onConfirm, onCancel }
}

/** A trigger that opens the dialog and closes it on cancel, like a table row. */
const WithTrigger = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Delete Foo
      </button>
      {open && (
        <ConfirmDialog
          title="Delete “Foo”?"
          message="This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      )}
    </>
  )
}

describe('ConfirmDialog', () => {
  afterEach(() => vi.restoreAllMocks())

  it('is an accessible alert dialog focused on the cancel action', () => {
    renderDialog()

    const dialog = screen.getByRole('alertdialog', { name: 'Delete “Foo”?' })
    expect(dialog).toHaveAccessibleDescription('This action cannot be undone.')
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus()
  })

  it('opens as a modal, so the browser traps focus and blocks the page', () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal')

    renderDialog()

    expect(showModal).toHaveBeenCalledOnce()
  })

  it('confirms on the confirm button', async () => {
    const { onConfirm, onCancel } = renderDialog()

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('cancels on Escape (the cancel event the browser fires)', () => {
    const { onConfirm, onCancel } = renderDialog()
    const cancel = new Event('cancel', { cancelable: true })

    // jsdom does not turn Escape into `cancel`; dispatch it as browsers do.
    fireEvent(screen.getByRole('alertdialog'), cancel)

    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
    expect(cancel.defaultPrevented).toBe(true)
  })

  it('gives focus back to the element that opened it', async () => {
    renderWithProviders(<WithTrigger />)
    const trigger = screen.getByRole('button', { name: 'Delete Foo' })

    await userEvent.click(trigger)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})
