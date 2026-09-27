import { isSigninCallback } from './isSigninCallback'

const REDIRECT_URI = 'https://marcomanduca.dev/admin/callback'

describe('isSigninCallback', () => {
  it.each([
    ['https://marcomanduca.dev/admin/callback?code=a&state=b', true],
    ['https://marcomanduca.dev/projects?code=a&state=b', false],
    ['https://marcomanduca.dev/admin', false],
  ])('%s -> %s', (href, expected) => {
    expect(isSigninCallback(new URL(href), REDIRECT_URI)).toBe(expected)
  })

  it('treats the origin root as the callback when the redirect URI is the origin', () => {
    const url = new URL('http://localhost:5173/?code=a&state=b')

    expect(isSigninCallback(url, 'http://localhost:5173')).toBe(true)
  })
})
