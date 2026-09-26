import { COGNITO_AUTHORITY, COGNITO_CLIENT_ID } from '@/utils/env'

import { clearStoredUser, getAccessToken } from './getAccessToken'

const STORAGE_KEY = `oidc.user:${COGNITO_AUTHORITY}:${COGNITO_CLIENT_ID}`
const nowSeconds = () => Math.floor(Date.now() / 1000)

const storeUser = (user: Record<string, unknown>) =>
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))

describe('getAccessToken', () => {
  afterEach(() => sessionStorage.clear())

  it('returns null when no user is stored', () => {
    expect(getAccessToken()).toBeNull()
  })

  it('returns the access token of a valid stored user', () => {
    storeUser({ access_token: 'valid', expires_at: nowSeconds() + 3600 })

    expect(getAccessToken()).toBe('valid')
  })

  it('returns null for an expired token', () => {
    storeUser({ access_token: 'stale', expires_at: nowSeconds() - 60 })

    expect(getAccessToken()).toBeNull()
  })

  it('returns null for a token about to expire', () => {
    storeUser({ access_token: 'almost', expires_at: nowSeconds() + 2 })

    expect(getAccessToken()).toBeNull()
  })

  it('returns null when the stored value is not valid JSON', () => {
    sessionStorage.setItem(STORAGE_KEY, '{not json')

    expect(getAccessToken()).toBeNull()
  })

  it('clears the stored user', () => {
    storeUser({ access_token: 'valid', expires_at: nowSeconds() + 3600 })

    clearStoredUser()

    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
