import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'

import { API_BASE_URL } from '@/utils/env'
import { getAccessToken, hasRenewableSession } from '@/utils/getAccessToken'

import type { RefreshOutcome } from './session'

// The session helpers pull in oidc-client-ts: load them only for visitors
// who have a stored session to renew or end (the admin), never for the
// public bundle.
const loadSession = () => import('./session')

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = getAccessToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return headers
  },
})

/**
 * Renew the session after `rejected` was refused. When another request
 * already renewed (or ended) the session meanwhile, that outcome is reused;
 * otherwise a silent refresh is attempted.
 */
const renewToken = async (rejected: string): Promise<RefreshOutcome> => {
  const current = getAccessToken()
  if (current !== rejected) return current === null ? 'rejected' : 'renewed'
  return (await loadSession()).refreshSession()
}

const endSession = async (): Promise<void> => (await loadSession()).endSession()

/**
 * An expired stored token is renewed before the request goes out (it would
 * otherwise be sent anonymously and an admin save would fail). A refused
 * refresh ends the session; a transient failure keeps it.
 */
const renewExpiredToken = async (): Promise<void> => {
  if (!hasRenewableSession()) return
  const outcome = await (await loadSession()).refreshSession()
  if (outcome === 'rejected') await endSession()
}

/**
 * Base query that recovers from a rejected token. When a request carrying a
 * token gets a 401, the token is renewed and the request retried with it. If
 * the session can't be renewed, or the new token is rejected too, the session
 * is ended (the admin area then asks to sign in again, keeping the page) and
 * the request is retried anonymously, so public reads still work. If the
 * refresh only failed for a transient reason, the 401 is returned and the
 * session kept. A 401 means the backend ran nothing, so retrying a mutation
 * is safe.
 */
const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, apiContext, extraOptions) => {
  await renewExpiredToken()
  const sentToken = getAccessToken()
  const result = await rawBaseQuery(args, apiContext, extraOptions)
  if (sentToken === null || result.error?.status !== 401) return result

  const outcome = await renewToken(sentToken)
  if (outcome === 'unavailable') return result
  if (outcome === 'renewed') {
    const retried = await rawBaseQuery(args, apiContext, extraOptions)
    if (retried.error?.status !== 401) return retried
  }
  await endSession()
  return rawBaseQuery(args, apiContext, extraOptions)
}

/**
 * Base RTK Query API. Domain endpoints are injected from the
 * sibling *Api.ts files (projectsApi, learningApi, ...).
 */
export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Project', 'Article', 'ArticleVersions', 'Technology'],
  endpoints: () => ({}),
})
