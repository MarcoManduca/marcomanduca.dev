import { contactErrorKey } from './contactErrorKey'

describe('contactErrorKey', () => {
  it.each([
    [{ status: 422 }, 'contacts.errors.validation'],
    [{ status: 429 }, 'contacts.errors.rateLimited'],
    [{ status: 503 }, 'contacts.errors.generic'],
    [{ status: 'FETCH_ERROR' }, 'contacts.errors.generic'],
    [null, 'contacts.errors.generic'],
  ])('maps %o to %s', (error, key) => {
    expect(contactErrorKey(error)).toBe(key)
  })
})
