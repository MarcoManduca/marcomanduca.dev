import { builtinEnvironments } from 'vitest/environments'

import type { Environment } from 'vitest/environments'

/**
 * jsdom replaces the global `AbortController` / `AbortSignal` with its own
 * implementations. Under Node's native (undici) `fetch`/`Request` — which jsdom
 * does NOT replace — those signals fail an `instanceof` check, breaking any
 * request issued by RTK Query under MSW.
 *
 * This environment extends the built-in jsdom environment and restores Node's
 * native `AbortController` / `AbortSignal`, captured here in the Node realm
 * before jsdom overrides them, so a single implementation is shared everywhere.
 */
const NativeAbortController = globalThis.AbortController
const NativeAbortSignal = globalThis.AbortSignal

const environment: Environment = {
  name: 'jsdom-undici',
  transformMode: 'web',
  async setup(global, options) {
    const jsdom = await builtinEnvironments.jsdom.setup(global, options)
    global.AbortController = NativeAbortController
    global.AbortSignal = NativeAbortSignal
    return {
      teardown(teardownGlobal) {
        return jsdom.teardown(teardownGlobal)
      },
    }
  },
}

export default environment
