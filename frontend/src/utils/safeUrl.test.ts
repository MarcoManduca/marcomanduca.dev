import { safeExternalUrl } from './safeUrl'

describe('safeExternalUrl', () => {
  it('returns http(s) URLs unchanged', () => {
    expect(safeExternalUrl('https://example.com')).toBe('https://example.com')
    expect(safeExternalUrl('http://example.com')).toBe('http://example.com')
  })

  it.each(['javascript:alert(1)', 'data:text/html,<script>', 'ftp://x'])(
    'rejects the unsafe scheme %s',
    (url) => {
      expect(safeExternalUrl(url)).toBeUndefined()
    },
  )

  it('returns undefined for empty or invalid input', () => {
    expect(safeExternalUrl('')).toBeUndefined()
    expect(safeExternalUrl(null)).toBeUndefined()
    expect(safeExternalUrl('not a url')).toBeUndefined()
  })
})
