import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'

import { API_BASE_URL } from '@/utils/env'
import { getAccessToken } from '@/utils/getAccessToken'

import { endSession, refreshSession } from './session'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = getAccessToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return headers
  },
})

/**
 * Whether a usable token other than the `rejected` one is now stored. When
 * another request already renewed (or ended) the session meanwhile, that
 * outcome is reused; otherwise a silent refresh is attempted.
 */
const renewToken = async (rejected: string): Promise<boolean> => {
  const current = getAccessToken()
  if (current !== rejected) return current !== null
  return refreshSession()
}

/**
 * Base query that recovers from a rejected token. When a request carrying a
 * token gets a 401, the token is renewed and the request retried with it. If
 * no new token is available, or it is rejected too, the session is ended (the
 * auth context then asks the admin to sign in again) and the request is
 * retried anonymously, so public reads still work. A 401 means the backend
 * ran nothing, so retrying a mutation is safe.
 */
const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, apiContext, extraOptions) => {
  const sentToken = getAccessToken()
  const result = await rawBaseQuery(args, apiContext, extraOptions)
  if (sentToken === null || result.error?.status !== 401) return result

  if (await renewToken(sentToken)) {
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
