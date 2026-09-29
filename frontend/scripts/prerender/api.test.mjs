import { describe, expect, it, vi } from 'vitest'

import { fetchCollection } from './api.mjs'

const API = 'https://example.test/api/v1'
const respond = (body, status = 200) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status }))

describe('fetchCollection', () => {
  it('returns the collection the API sends', async () => {
    const fetchImpl = respond([{ slug: 'a' }])

    const items = await fetchCollection(API, '/projects', { fetchImpl })

    expect(items).toEqual([{ slug: 'a' }])
    expect(fetchImpl).toHaveBeenCalledWith(
      `${API}/projects`,
      expect.any(Object),
    )
  })

  it.each([
    ['an HTTP error', respond({ detail: 'x' }, 503)],
    ['a body that is not an array', respond({ items: [] })],
    [
      'a network failure',
      vi.fn(async () => Promise.reject(new Error('offline'))),
    ],
  ])('falls back to an empty list on %s', async (_case, fetchImpl) => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const items = await fetchCollection(API, '/projects', { fetchImpl })

    expect(items).toEqual([])
  })

  it('throws in strict mode', async () => {
    const fetchImpl = respond({ detail: 'x' }, 503)

    await expect(
      fetchCollection(API, '/learning', { fetchImpl, strict: true }),
    ).rejects.toThrow('Pre-render: could not fetch /learning (HTTP 503)')
  })

  it('gives up on a hung API', async () => {
    const fetchImpl = vi.fn(
      (_url, { signal }) =>
        new Promise((_resolve, reject) =>
          signal.addEventListener('abort', () => reject(signal.reason)),
        ),
    )

    await expect(
      fetchCollection(API, '/projects', {
        fetchImpl,
        timeoutMs: 10,
        strict: true,
      }),
    ).rejects.toThrow(/could not fetch \/projects/)
  })
})
