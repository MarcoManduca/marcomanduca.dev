import type { Technology } from '@/types'

import { api } from './api'

export const technologiesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getTechnologies: build.query<Technology[], void>({
      query: () => '/technologies',
      providesTags: ['Technology'],
    }),
  }),
})

export const { useGetTechnologiesQuery } = technologiesApi
