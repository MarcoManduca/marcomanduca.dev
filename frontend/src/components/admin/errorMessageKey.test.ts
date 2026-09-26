import { errorMessageKey } from './errorMessageKey'

describe('errorMessageKey', () => {
  it.each([
    [{ status: 401 }, 'admin.errors.unauthorized'],
    [{ status: 403 }, 'admin.errors.forbidden'],
    [{ status: 422 }, 'admin.errors.validation'],
    [{ status: 500 }, 'admin.errors.generic'],
    [{ status: 'FETCH_ERROR' }, 'admin.errors.generic'],
    [new Error('boom'), 'admin.errors.generic'],
    [null, 'admin.errors.generic'],
  ])('maps %o to %s', (error, expected) => {
    expect(errorMessageKey(error)).toBe(expected)
  })
})
