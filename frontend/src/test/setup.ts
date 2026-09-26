import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'

import { server } from './mocks/server'

// jsdom does not implement scrolling; stub it so layout effects stay quiet.
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
Element.prototype.scrollIntoView = vi.fn()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  server.resetHandlers()
  cleanup()
})

afterAll(() => server.close())
