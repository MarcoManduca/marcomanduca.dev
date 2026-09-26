import { isNotFoundError } from './isNotFoundError'

describe('isNotFoundError', () => {
  it.each([
    [{ status: 404, data: { detail: 'Not found' } }, true],
    [{ status: 500, data: null }, false],
    [{ status: 'FETCH_ERROR', error: 'TypeError' }, false],
    [{ message: 'boom' }, false],
    [undefined, false],
    [null, false],
  ])('returns the expected result for %j', (error, expected) => {
    expect(isNotFoundError(error)).toBe(expected)
  })
})
