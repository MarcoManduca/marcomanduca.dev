import { safeExternalUrl, safeMediaUrl } from './safeUrl'

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

describe('safeMediaUrl', () => {
  it.each(['/images/projects/a/cover.webp', 'https://cdn.example.com/a.png'])(
    'accepts the image source %s',
    (src) => {
      expect(safeMediaUrl(src)).toBe(src)
    },
  )

  it.each([
    '//evil.example.com/a.png',
    '/\\evil.example.com',
    'javascript:x',
    '/\t/evil.example.com/a.png',
    '/images/new\nline.png',
  ])('rejects the image source %j', (src) => {
    expect(safeMediaUrl(src)).toBeUndefined()
  })

  it('returns undefined without a source', () => {
    expect(safeMediaUrl(null)).toBeUndefined()
  })
})
