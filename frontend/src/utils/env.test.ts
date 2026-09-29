describe('env', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('falls back to the defaults for empty build-time values', async () => {
    // Docker build args pass unset values as empty strings.
    vi.stubEnv('VITE_API_BASE_URL', '')
    vi.stubEnv('VITE_COGNITO_REDIRECT_URI', '')

    const env = await import('./env')

    expect(env.API_BASE_URL).toBe('/api/v1')
    expect(env.COGNITO_REDIRECT_URI).toBe(
      `${window.location.origin}/admin/callback`,
    )
  })

  it('uses the configured values when they are set', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com/v1')

    const env = await import('./env')

    expect(env.API_BASE_URL).toBe('https://api.example.com/v1')
  })
})
