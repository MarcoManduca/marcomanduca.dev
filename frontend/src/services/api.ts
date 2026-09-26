import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'

import { API_BASE_URL } from '@/utils/env'
import { clearStoredUser, getAccessToken } from '@/utils/getAccessToken'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = getAccessToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return headers
  },
})

/**
 * Base query that recovers from a stale token: when a request carrying a
 * token is rejected with 401, the stored user is cleared and the request is
 * retried once anonymously. Public reads then succeed, while admin calls
 * surface the 401 (the admin area asks the user to sign in again).
 */
const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, apiContext, extraOptions) => {
  const sentToken = getAccessToken() !== null
  const result = await rawBaseQuery(args, apiContext, extraOptions)
  if (!sentToken || result.error?.status !== 401) return result

  clearStoredUser()
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
