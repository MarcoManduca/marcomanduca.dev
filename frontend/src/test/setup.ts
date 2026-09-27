import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'

import { server } from './mocks/server'

// jsdom does not implement scrolling; stub it so layout effects stay quiet.
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
Element.prototype.scrollIntoView = vi.fn()
// Nor hit-testing: nothing is drawn at any point unless a test says so.
document.elementFromPoint = vi.fn(() => null)

// Nor modal dialogs: showModal/close only toggle `open` (no top layer, focus
// trap or Escape handling, which the browser provides).
if (typeof HTMLDialogElement.prototype.showModal !== 'function') {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.open = false
  }
}

// jsdom has no PointerEvent: without it, pointer events carry no coordinates
// or pointer type. A MouseEvent with the pointer fields stands in for it.
if (typeof window.PointerEvent === 'undefined') {
  class PointerEventPolyfill extends MouseEvent {
    readonly pointerId: number
    readonly pointerType: string

    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init)
      this.pointerId = init.pointerId ?? 1
      this.pointerType = init.pointerType ?? 'mouse'
    }
  }
  window.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  server.resetHandlers()
  cleanup()
})

afterAll(() => server.close())
