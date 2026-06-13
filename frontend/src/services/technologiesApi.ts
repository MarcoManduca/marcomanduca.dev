import type { Technology, TechnologyInput } from '@/types'

import { api } from './api'

export const technologiesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getTechnologies: build.query<Technology[], void>({
      query: () => '/technologies',
      providesTags: ['Technology'],
    }),
    createTechnology: build.mutation<Technology, TechnologyInput>({
      query: (body) => ({ url: '/technologies', method: 'POST', body }),
      invalidatesTags: ['Technology'],
    }),
  }),
})

export const { useGetTechnologiesQuery, useCreateTechnologyMutation } =
  technologiesApi
