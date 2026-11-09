// Vite inlines the file's source as a string (`?raw`).
import SOURCE from '../../public/theme-init.js?raw'

/**
 * public/theme-init.js runs as a classic script before the app: run its
 * source against jsdom, with the OS preference stubbed.
 */
const runThemeInit = () => new Function(SOURCE)()

const prefersDark = (matches: boolean) => {
  window.matchMedia = vi.fn().mockReturnValue({ matches })
}

const themeColor = () =>
  document.querySelector('meta[name="theme-color"]')?.getAttribute('content')

describe('theme-init.js', () => {
  const originalMatchMedia = window.matchMedia

  beforeEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.theme
    const meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.append(meta)
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
    document.head.querySelector('meta[name="theme-color"]')?.remove()
    vi.restoreAllMocks()
  })

  it('gives a new visitor the light theme by default', () => {
    prefersDark(false)

    runThemeInit()

    expect(document.documentElement.dataset.theme).toBe('light')
    expect(themeColor()).toBe('#EFE3C8')
  })

  it('follows an OS set to dark', () => {
    prefersDark(true)

    runThemeInit()

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(themeColor()).toBe('#0D1B1F')
  })

  it.each([
    ['light', true],
    ['dark', false],
  ])('keeps the stored %s choice over the OS preference', (stored, osDark) => {
    localStorage.setItem('theme', stored)
    prefersDark(osDark)

    runThemeInit()

    expect(document.documentElement.dataset.theme).toBe(stored)
  })

  it('still follows the OS when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    prefersDark(true)

    runThemeInit()

    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('falls back to light without matchMedia', () => {
    window.matchMedia = undefined as unknown as typeof window.matchMedia

    runThemeInit()

    expect(document.documentElement.dataset.theme).toBe('light')
  })
})
