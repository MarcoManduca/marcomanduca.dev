import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { API_BASE_URL } from '@/utils/env'
import { getAccessToken } from '@/utils/getAccessToken'

/**
 * Base RTK Query API. Domain endpoints are injected from the
 * sibling *Api.ts files (projectsApi, learningApi, ...).
 */
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = getAccessToken()
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: ['Project', 'Article', 'ArticleVersions', 'Technology', 'Cv'],
  endpoints: () => ({}),
})
